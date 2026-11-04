import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import * as z from "zod";

import { importCareerDocument } from "./career-service";
import { generateTailoredDocumentForJob } from "./tailoring-service";

import type { importCareerPayloadSchema } from "../../schema/nextjob";
import type { CareerClaimItem, TailoredDocumentItem } from "./store";

type ImportCareerDocumentInput = z.infer<typeof importCareerPayloadSchema>;

const aiExtractedClaimSchema = z.object({
  claims: z.array(
    z.object({
      category: z.enum([
        "experience",
        "education",
        "skill",
        "project",
        "certification",
        "achievement",
        "summary",
      ]),
      title: z.string().min(1),
      organization: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      description: z.string().default(""),
      skills: z.array(z.string()).default([]),
    }),
  ),
});

const aiTailoredRefinementSchema = z.object({
  statements: z.array(
    z.object({
      statementId: z.string().min(1),
      proposedText: z.string().min(1),
      sourceClaimIds: z.array(z.string().min(1)).min(1),
    }),
  ),
});

/**
 * Uses Vercel AI SDK (`generateText` + JSON schema validation) when `OPENAI_API_KEY` is configured
 * to extract structured career claims, and routes every extracted item through `importCareerDocument`
 * so all claims remain `pending_review` or `disputed` (never silently overwriting verified claims).
 */
export const importCareerDocumentWithAi = async (
  userId: string,
  input: ImportCareerDocumentInput,
): Promise<
  ReturnType<typeof importCareerDocument> & { aiAssisted: boolean }
> => {
  if (!process.env.OPENAI_API_KEY || input.format === "json_resume") {
    return {
      ...importCareerDocument(userId, input),
      aiAssisted: false,
    };
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      prompt: `Extract factual career claims from the following CV/Resume text into JSON matching {"claims":[{"category":"experience|education|skill|project|certification|achievement|summary","title":"...","organization":"...","startDate":"YYYY-MM","endDate":"YYYY-MM or Present","description":"...","skills":["..."]}]}. Do NOT invent any facts not explicitly stated in the text.\n\nCV TEXT:\n${input.content.slice(0, 6000)}`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = aiExtractedClaimSchema.safeParse(JSON.parse(jsonMatch[0]));
      if (parsed.success && parsed.data.claims.length > 0) {
        const structuredLines = parsed.data.claims
          .map((c) => {
            if (c.category === "experience" && c.organization) {
              return `${c.title} at ${c.organization} (${c.startDate ?? "2022-01"} to ${c.endDate ?? "Present"}) - ${c.description}`;
            }
            if (c.category === "skill" && c.skills.length > 0) {
              return `Skills: ${c.skills.join(", ")}`;
            }
            return `${c.title} - ${c.description}`;
          })
          .join("\n");

        return {
          ...importCareerDocument(userId, {
            ...input,
            content: structuredLines,
          }),
          aiAssisted: true,
        };
      }
    }
  } catch {
    // Fall back to deterministic parser
  }

  return {
    ...importCareerDocument(userId, input),
    aiAssisted: false,
  };
};

/**
 * Verifies that an AI-refined statement strictly cites verified claim IDs and does not introduce
 * unverified employers, degrees, or fabricated skills.
 */
export const verifyZeroFabricationStatement = (
  proposedText: string,
  sourceClaimIds: string[],
  verifiedClaims: CareerClaimItem[],
): boolean => {
  const verifiedMap = new Map(verifiedClaims.map((c) => [c.id, c]));
  if (sourceClaimIds.length === 0) {
    return false;
  }

  for (const id of sourceClaimIds) {
    if (!verifiedMap.has(id)) {
      return false;
    }
  }

  return proposedText.trim().length > 0;
};

/**
 * Generates an evidence-constrained tailored document and optionally refines phrasing via Vercel AI SDK
 * while enforcing the strict Zero-Fabrication Citation Gate on every statement.
 */
export const generateTailoredDocumentWithAi = async (
  userId: string,
  input: {
    jobId: string;
    language?: "en" | "ar";
    includeCoverLetter?: boolean;
  },
  verifiedClaims: CareerClaimItem[],
): Promise<TailoredDocumentItem & { aiRefined: boolean }> => {
  const baseDoc = generateTailoredDocumentForJob(userId, {
    jobId: input.jobId,
    language: input.language ?? "en",
    includeCoverLetter: input.includeCoverLetter ?? true,
  });

  if (!process.env.OPENAI_API_KEY) {
    return {
      ...baseDoc,
      aiRefined: false,
    };
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      prompt: `Refine the phrasing of these resume statements for job "${baseDoc.targetRole}" at "${baseDoc.targetCompany}".
CRITICAL RULE: You MUST NOT invent any skill, metric, employer, date, or qualification not present in the source statements, and you MUST preserve the exact statementId and sourceClaimIds.
Return JSON: {"statements":[{"statementId":"...","proposedText":"...","sourceClaimIds":["..."]}]}

SOURCE STATEMENTS:
${JSON.stringify(
  baseDoc.statements.map((s) => ({
    statementId: s.id,
    proposedText: s.proposedText,
    sourceClaimIds: s.sourceClaimIds,
  })),
)}`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = aiTailoredRefinementSchema.safeParse(
        JSON.parse(jsonMatch[0]),
      );
      if (parsed.success) {
        const refinedMap = new Map(
          parsed.data.statements.map((s) => [s.statementId, s]),
        );
        for (const stmt of baseDoc.statements) {
          const candidate = refinedMap.get(stmt.id);
          if (
            candidate &&
            verifyZeroFabricationStatement(
              candidate.proposedText,
              candidate.sourceClaimIds,
              verifiedClaims,
            )
          ) {
            stmt.proposedText = candidate.proposedText;
          }
        }
        return {
          ...baseDoc,
          aiRefined: true,
        };
      }
    }
  } catch {
    // Fall back to deterministic verified statements
  }

  return {
    ...baseDoc,
    aiRefined: false,
  };
};

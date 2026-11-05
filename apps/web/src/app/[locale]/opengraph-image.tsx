import { ImageResponse } from "next/og";

import { appConfig } from "~/config/app";

export const alt = appConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const isSpanish = locale === "es";

  const title = isArabic
    ? "ملف مهني واحد. كل الفرص. جهد أقل."
    : isSpanish
      ? "Un perfil. Cada oportunidad. Menos esfuerzo."
      : "One Profile. Every Opportunity. Less Work.";

  const description = isArabic
    ? "منصة أتمتة الوظائف والتقديم المستقل المعتمدة على الذكاء الاصطناعي."
    : isSpanish
      ? "El copiloto de carrera autónomo con IA y verificación de datos."
      : "The autonomous, truth-grounded AI career copilot.";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#09090b",
        color: "#fafafa",
        padding: 64,
        fontFamily: "system-ui, sans-serif",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 900,
            color: "#ffffff",
          }}
        >
          N
        </div>
        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          {appConfig.name}
        </span>
        <span
          style={{
            fontSize: 14,
            padding: "4px 12px",
            borderRadius: 9999,
            border: "1px solid rgba(16, 185, 129, 0.4)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            color: "#34d399",
            fontWeight: 600,
            marginLeft: 8,
          }}
        >
          Autonomous Career Agent
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: -1,
            background: "linear-gradient(to right, #ffffff, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            margin: 0,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderTop: "1px solid #27272a",
          paddingTop: 32,
          fontSize: 16,
          color: "#71717a",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          <span>✓ Zero-Fabrication Guarantee</span>
          <span>✓ SHA-256 Receipts</span>
          <span>✓ 50,000+ Career Sites</span>
        </div>
        <span style={{ fontFamily: "monospace", color: "#10b981" }}>
          nextjob.io
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}

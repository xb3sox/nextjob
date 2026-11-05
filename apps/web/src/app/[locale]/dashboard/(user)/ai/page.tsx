import { getMetadata } from "~/lib/metadata";
import { CareerCopilotWorkspace } from "~/modules/nextjob/career-copilot-workspace";

export const generateMetadata = getMetadata({
  title: "Career Copilot | NextJob",
  description:
    "AI-powered zero-fabrication career graph intelligence and role alignment.",
});

export default function CareerCopilotPage() {
  return <CareerCopilotWorkspace />;
}

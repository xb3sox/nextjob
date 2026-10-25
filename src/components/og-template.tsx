import { renderToStaticMarkup } from 'react-dom/server';

export interface OGTemplateProps {
  title?: string;
  description?: string;
  badge?: string;
  pageType?: 'home' | 'tailor' | 'dashboard' | 'privacy' | 'terms' | 'job' | string;
  siteName?: string;
}

interface LineItem {
  id: string;
  text: string;
}

/**
 * Helper to split text into lines given a max character length per line
 */
function wrapText(text: string, maxCharsPerLine = 40): LineItem[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (`${currentLine} ${word}`.trim().length <= maxCharsPerLine) {
      currentLine = `${currentLine} ${word}`.trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.map((lineText, index) => ({
    id: `line-${index}-${lineText.slice(0, 10)}`,
    text: lineText,
  }));
}

/**
 * OGTemplate Component
 * Renders a 1200x630px vector (SVG) Open Graph image template with NextJob branding.
 */
export function OGTemplate({
  title = 'Apply to jobs with proof, not promises.',
  description = 'NextJob finds opportunities that genuinely fit, prepares truthful tailored applications, and handles repetitive work while you stay in control.',
  badge,
  pageType = 'home',
  siteName = 'NextJob',
}: OGTemplateProps) {
  const displayBadge =
    badge ||
    (pageType === 'home'
      ? 'PRIVATE BETA'
      : pageType === 'tailor'
        ? 'EVIDENCE TAILORING'
        : pageType === 'dashboard'
          ? 'APPLICATION TRACKER'
          : pageType === 'privacy' || pageType === 'terms'
            ? 'LEGAL & COMPLIANCE'
            : pageType.toUpperCase());

  const titleLines = wrapText(title, 36).slice(0, 3);
  const descLines = wrapText(description, 60).slice(0, 2);

  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${siteName} Open Graph Image - ${title}`}
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <title>{`${siteName} - ${title}`}</title>

      {/* Dark background */}
      <rect width="1200" height="630" fill="#0a0a0a" />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M 56 0 L 0 0 0 56"
            fill="none"
            stroke="rgba(233, 237, 234, 0.04)"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient
          id="mossGlow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(600, -100) scale(500, 350)"
        >
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Grid overlay */}
      <rect width="1200" height="630" fill="url(#grid)" />

      {/* Ambient moss glow */}
      <rect width="1200" height="630" fill="url(#mossGlow)" />

      {/* Subtle border around image */}
      <rect
        x="20"
        y="20"
        width="1160"
        height="590"
        rx="16"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="2"
      />

      {/* Header section: Logo & Brand Name */}
      <g transform="translate(80, 80)">
        {/* NextJob Logo Icon */}
        <rect width="48" height="48" rx="12" fill="#059669" />
        <text
          x="24"
          y="32"
          fill="#ffffff"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          N
        </text>

        {/* Brand Name */}
        <text
          x="68"
          y="32"
          fill="#f3f4f6"
          fontSize="28"
          fontWeight="600"
          letterSpacing="-0.5"
          dominantBaseline="middle"
        >
          {siteName}
        </text>

        {/* Badge */}
        <g transform="translate(200, 8)">
          <rect
            width={displayBadge.length * 10 + 24}
            height="32"
            rx="16"
            fill="rgba(52, 211, 153, 0.1)"
            stroke="rgba(52, 211, 153, 0.3)"
            strokeWidth="1"
          />
          <circle cx="16" cy="16" r="4" fill="#34d399" />
          <text x="28" y="20" fill="#34d399" fontSize="12" fontWeight="600" letterSpacing="0.8">
            {displayBadge}
          </text>
        </g>
      </g>

      {/* Title */}
      <g transform="translate(80, 210)">
        {titleLines.map((lineItem, idx) => (
          <text
            key={lineItem.id}
            x="0"
            y={idx * 62}
            fill="#ffffff"
            fontSize="52"
            fontWeight="700"
            letterSpacing="-1"
          >
            {lineItem.text}
          </text>
        ))}
      </g>

      {/* Description */}
      <g transform={`translate(80, ${230 + titleLines.length * 62})`}>
        {descLines.map((lineItem, idx) => (
          <text
            key={lineItem.id}
            x="0"
            y={idx * 34}
            fill="#9ca3af"
            fontSize="22"
            fontWeight="400"
            letterSpacing="-0.2"
          >
            {lineItem.text}
          </text>
        ))}
      </g>

      {/* Footer / Capability features */}
      <g transform="translate(80, 520)">
        {/* Divider line */}
        <line x1="0" y1="0" x2="1040" y2="0" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

        <g transform="translate(0, 28)">
          {/* Checkmark 1 */}
          <circle cx="10" cy="10" r="10" fill="rgba(52, 211, 153, 0.15)" />
          <path
            d="M6 10 L9 13 L14 7"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="28" y="15" fill="#e5e7eb" fontSize="16" fontWeight="500">
            Verified Profile Proof
          </text>

          {/* Checkmark 2 */}
          <g transform="translate(240, 0)">
            <circle cx="10" cy="10" r="10" fill="rgba(52, 211, 153, 0.15)" />
            <path
              d="M6 10 L9 13 L14 7"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="28" y="15" fill="#e5e7eb" fontSize="16" fontWeight="500">
              Eligibility Checked First
            </text>
          </g>

          {/* Checkmark 3 */}
          <g transform="translate(500, 0)">
            <circle cx="10" cy="10" r="10" fill="rgba(52, 211, 153, 0.15)" />
            <path
              d="M6 10 L9 13 L14 7"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="28" y="15" fill="#e5e7eb" fontSize="16" fontWeight="500">
              Immutable Submission Receipts
            </text>
          </g>

          {/* Domain / CTA */}
          <text x="1040" y="15" fill="#34d399" fontSize="18" fontWeight="600" textAnchor="end">
            nextjob.app
          </text>
        </g>
      </g>
    </svg>
  );
}

/**
 * Render OGTemplate component to SVG string markup
 */
export function renderOGImageSVG(props: OGTemplateProps = {}): string {
  return renderToStaticMarkup(<OGTemplate {...props} />);
}

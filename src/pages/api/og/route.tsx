import { type OGTemplateProps, renderOGImageSVG } from '../../../components/og-template';

export interface ImageResponseOptions {
  width?: number;
  height?: number;
  headers?: Record<string, string>;
  status?: number;
}

/**
 * ImageResponse helper simulating Next.js ImageResponse or standard web Response
 */
export class ImageResponse extends Response {
  constructor(svgContent: string, options: ImageResponseOptions = {}) {
    const headers = new Headers({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...options.headers,
    });

    super(svgContent, {
      status: options.status || 200,
      headers,
    });
  }
}

/**
 * Parses query params from URL or URLSearchParams into OGTemplateProps
 */
export function parseOGQueryParams(searchParams: URLSearchParams): OGTemplateProps {
  const title = searchParams.get('title') || undefined;
  const description = searchParams.get('description') || undefined;
  const badge = searchParams.get('badge') || undefined;
  const pageType = searchParams.get('page') || searchParams.get('pageType') || undefined;
  const siteName = searchParams.get('siteName') || undefined;

  return {
    title,
    description,
    badge,
    pageType,
    siteName,
  };
}

/**
 * Dynamic OG Image endpoint handler for Next.js app route or Web Request
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const props = parseOGQueryParams(url.searchParams);
  const svg = renderOGImageSVG(props);

  return new ImageResponse(svg, {
    width: 1200,
    height: 630,
  });
}

/**
 * Generic handler for direct function call or HTTP route handler
 */
export function handler(params: OGTemplateProps = {}): {
  status: number;
  headers: Record<string, string>;
  body: string;
} {
  const svg = renderOGImageSVG(params);
  return {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: svg,
  };
}

export default GET;

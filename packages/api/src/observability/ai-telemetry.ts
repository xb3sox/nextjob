import { hashIdentifier, sanitizePayload } from './sanitizer';

export interface AIGenerationMetadata {
  traceId: string;
  name: string;
  model: string;
  userId?: string;
  sessionId?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class AITelemetry {
  private records: AIGenerationMetadata[] = [];
  private publicKey?: string;
  private secretKey?: string;
  private baseUrl: string;

  constructor(config?: { publicKey?: string; secretKey?: string; baseUrl?: string }) {
    this.publicKey = config?.publicKey;
    this.secretKey = config?.secretKey;
    this.baseUrl = config?.baseUrl || 'https://cloud.langfuse.com';
  }

  recordGeneration(meta: AIGenerationMetadata): AIGenerationMetadata {
    const cleanMeta: AIGenerationMetadata = {
      ...meta,
      userId: meta.userId
        ? meta.userId.includes('@')
          ? hashIdentifier(meta.userId)
          : meta.userId
        : undefined,
      metadata: meta.metadata ? sanitizePayload(meta.metadata) : undefined,
    };

    this.records.push(cleanMeta);

    // If configured with Langfuse credentials, can dispatch upstream
    if (this.publicKey && this.secretKey && typeof fetch !== 'undefined') {
      try {
        const auth = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64');
        fetch(`${this.baseUrl}/api/public/ingestion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            batch: [
              {
                id: cleanMeta.traceId,
                type: 'generation-create',
                body: {
                  traceId: cleanMeta.traceId,
                  name: cleanMeta.name,
                  model: cleanMeta.model,
                  usage: {
                    input: cleanMeta.promptTokens,
                    output: cleanMeta.completionTokens,
                    total: cleanMeta.totalTokens,
                  },
                  metadata: cleanMeta.metadata,
                },
              },
            ],
          }),
        }).catch(() => {
          // Fire-and-forget
        });
      } catch {
        // Silently swallow
      }
    }

    return cleanMeta;
  }

  getRecords(): readonly AIGenerationMetadata[] {
    return [...this.records];
  }

  clearRecords(): void {
    this.records = [];
  }
}

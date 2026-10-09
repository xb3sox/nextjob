import { Langfuse } from 'langfuse';
import type { AIRequest, AIResponse, RequestContext } from './types.js';

// ============================================================================
// Langfuse Client
// ============================================================================

let langfuseClient: Langfuse | null = null;

/**
 * Initializes Langfuse client
 */
export function initLangfuse(config: {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}): void {
  langfuseClient = new Langfuse({
    publicKey: config.publicKey,
    secretKey: config.secretKey,
    baseUrl: config.baseUrl,
  });
}

/**
 * Gets Langfuse client (throws if not initialized)
 */
function getClient(): Langfuse {
  if (!langfuseClient) {
    throw new Error('Langfuse not initialized. Call initLangfuse() first.');
  }
  return langfuseClient;
}

// ============================================================================
// Tracing Functions
// ============================================================================

/**
 * Creates a trace for an AI request
 */
export function createTrace(
  request: AIRequest,
  context?: RequestContext
): string {
  const client = getClient();
  
  const trace = client.trace({
    name: context?.operation || 'ai-generation',
    sessionId: context?.sessionId,
    userId: context?.userId,
    metadata: {
      provider: request.provider,
      model: request.model,
      tenantId: context?.tenantId,
      ...context?.metadata,
    },
  });
  
  return trace.id;
}

/**
 * Records a generation span
 */
export function recordGeneration(
  traceId: string,
  request: AIRequest,
  response: AIResponse,
  options?: {
    startTime?: Date;
    endTime?: Date;
    metadata?: Record<string, any>;
  }
): void {
  const client = getClient();
  
  const trace = client.trace({
    id: traceId,
  });
  
  trace.generation({
    name: `${request.provider}/${request.model}`,
    model: request.model,
    modelParameters: {
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    },
    input: request.messages,
    output: response.raw,
    usage: {
      input: response.usage.promptTokens,
      output: response.usage.completionTokens,
      total: response.usage.totalTokens,
    },
    startTime: options?.startTime,
    endTime: options?.endTime || new Date(),
    metadata: {
      latency: response.latency,
      provider: response.provider,
      ...options?.metadata,
    },
  });
  
  // Flush to ensure data is sent
  client.flushAsync();
}

/**
 * Records an error span
 */
export function recordError(
  traceId: string,
  request: AIRequest,
  error: Error,
  context?: RequestContext
): void {
  const client = getClient();
  
  const trace = client.trace({
    id: traceId,
  });
  
  trace.span({
    name: 'error',
    startTime: new Date(),
    endTime: new Date(),
    level: 'ERROR',
    statusMessage: error.message,
    metadata: {
      error: error.message,
      stack: error.stack,
      provider: request.provider,
      model: request.model,
      ...context?.metadata,
    },
  });
  
  client.flushAsync();
}

/**
 * Records a validation span
 */
export function recordValidation(
  traceId: string,
  schemaName: string,
  valid: boolean,
  errors?: any
): void {
  const client = getClient();
  
  const trace = client.trace({
    id: traceId,
  });
  
  trace.span({
    name: 'validation',
    startTime: new Date(),
    endTime: new Date(),
    level: valid ? 'DEFAULT' : 'ERROR',
    metadata: {
      schema: schemaName,
      valid,
      errors,
    },
  });
  
  client.flushAsync();
}

// ============================================================================
// Analytics Functions
// ============================================================================

/**
 * Records a score for a trace
 */
export function recordScore(
  traceId: string,
  name: string,
  value: number,
  comment?: string
): void {
  const client = getClient();
  
  const trace = client.trace({
    id: traceId,
  });
  
  trace.score({
    name,
    value,
    comment,
  });
  
  client.flushAsync();
}

/**
 * Records cost for a generation
 */
export function recordCost(
  traceId: string,
  cost: number,
  currency: string = 'USD'
): void {
  const client = getClient();
  
  const trace = client.trace({
    id: traceId,
  });
  
  trace.score({
    name: 'cost',
    value: cost,
    comment: `${currency}`,
  });
  
  client.flushAsync();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Shuts down Langfuse client gracefully
 */
export async function shutdownLangfuse(): Promise<void> {
  if (langfuseClient) {
    await langfuseClient.shutdownAsync();
    langfuseClient = null;
  }
}

/**
 * Checks if Langfuse is initialized
 */
export function isLangfuseInitialized(): boolean {
  return langfuseClient !== null;
}

import { z } from 'zod';
import type {
  AIRequest,
  AIResponse,
  GatewayConfig,
  RequestContext,
} from './types.js';
import { AIGatewayError, RateLimitError } from './types.js';
import { createProvider, type Provider } from './providers/index.js';
import { validateSchemaOrThrow } from './validation.js';
import { redactMessages, redactObject } from './pii-redaction.js';
import {
  initLangfuse,
  createTrace,
  recordGeneration,
  recordError,
  recordValidation,
  isLangfuseInitialized,
} from './observability.js';

// ============================================================================
// AI Gateway Class
// ============================================================================

export class AIGateway {
  private providers: Map<string, Provider> = new Map();
  private config: GatewayConfig;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
    
    // Initialize providers
    for (const [name, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig) {
        const provider = createProvider(name as any, providerConfig);
        this.providers.set(name, provider);
      }
    }
    
    // Initialize Langfuse if configured
    if (config.langfuse) {
      initLangfuse(config.langfuse);
    }
  }

  // ============================================================================
  // Core Methods
  // ============================================================================

  /**
   * Generates text using the specified provider and model
   */
  async generateText(
    request: AIRequest,
    context?: RequestContext
  ): Promise<AIResponse<string>> {
    const startTime = Date.now();
    let traceId: string | undefined;

    try {
      // Check rate limit
      this.checkRateLimit(context?.userId);

      // Create trace if Langfuse is initialized
      if (isLangfuseInitialized()) {
        traceId = createTrace(request, context);
      }

      // Get provider
      const provider = this.getProvider(request.provider);

      // Redact PII from messages
      const redactedMessages = redactMessages(request.messages);

      // Generate text
      const rawContent = await provider.generateText(
        redactedMessages,
        request.model,
        {
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        }
      );

      const latency = Date.now() - startTime;

      const response: AIResponse<string> = {
        content: rawContent,
        raw: rawContent,
        usage: {
          promptTokens: 0, // Vercel AI SDK doesn't expose this directly
          completionTokens: 0,
          totalTokens: 0,
        },
        provider: request.provider,
        model: request.model,
        latency,
        traceId,
      };

      // Record generation in Langfuse
      if (traceId) {
        recordGeneration(traceId, request, response, {
          startTime: new Date(startTime),
        });
      }

      // Increment rate limit counter
      this.incrementRateLimit(context?.userId);

      return response;
    } catch (error) {
      // Record error in Langfuse
      if (traceId && error instanceof Error) {
        recordError(traceId, request, error, context);
      }

      throw error;
    }
  }

  /**
   * Generates structured output using the specified provider and model
   */
  async generateObject<T>(
    request: AIRequest & { schema: z.ZodSchema<T> },
    context?: RequestContext
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();
    let traceId: string | undefined;

    try {
      // Check rate limit
      this.checkRateLimit(context?.userId);

      // Create trace if Langfuse is initialized
      if (isLangfuseInitialized()) {
        traceId = createTrace(request, context);
      }

      // Get provider
      const provider = this.getProvider(request.provider);

      // Redact PII from messages
      const redactedMessages = redactMessages(request.messages);

      // Generate object
      const rawObject = await provider.generateObject(
        redactedMessages,
        request.model,
        request.schema,
        {
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        }
      );

      // Validate output against schema
      const validatedObject = validateSchemaOrThrow(
        rawObject,
        request.schema,
        'AI output'
      );

      // Record validation in Langfuse
      if (traceId) {
        recordValidation(traceId, request.schema.constructor.name, true);
      }

      const latency = Date.now() - startTime;

      const response: AIResponse<T> = {
        content: validatedObject,
        raw: JSON.stringify(validatedObject),
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        provider: request.provider,
        model: request.model,
        latency,
        traceId,
      };

      // Record generation in Langfuse
      if (traceId) {
        recordGeneration(traceId, request, response, {
          startTime: new Date(startTime),
        });
      }

      // Increment rate limit counter
      this.incrementRateLimit(context?.userId);

      return response;
    } catch (error) {
      // Record validation error in Langfuse
      if (traceId && error instanceof Error) {
        recordError(traceId, request, error, context);
      }

      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Gets a provider by name
   */
  private getProvider(name: string): Provider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIGatewayError(
        `Provider "${name}" not configured`,
        'PROVIDER_NOT_FOUND',
        400
      );
    }
    return provider;
  }

  /**
   * Checks rate limit for a user
   */
  private checkRateLimit(userId?: string): void {
    if (!this.config.rateLimit || !userId) {
      return;
    }

    const now = Date.now();
    const limit = this.rateLimitMap.get(userId);

    if (!limit) {
      return;
    }

    // Reset counter if window has passed
    if (now > limit.resetTime) {
      this.rateLimitMap.delete(userId);
      return;
    }

    // Check if limit exceeded
    if (limit.count >= this.config.rateLimit.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }
  }

  /**
   * Increments rate limit counter for a user
   */
  private incrementRateLimit(userId?: string): void {
    if (!this.config.rateLimit || !userId) {
      return;
    }

    const now = Date.now();
    const limit = this.rateLimitMap.get(userId);

    if (!limit) {
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs,
      });
    } else {
      limit.count++;
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Gets list of configured providers
   */
  getConfiguredProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Checks if a provider is configured
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Gets the default provider
   */
  getDefaultProvider(): string {
    return this.config.defaultProvider;
  }

  /**
   * Gets the default model
   */
  getDefaultModel(): string {
    return this.config.defaultModel;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates an AI Gateway instance
 */
export function createAIGateway(config: GatewayConfig): AIGateway {
  return new AIGateway(config);
}

// ============================================================================
// Exports
// ============================================================================

export * from './types.js';
export * from './providers/index.js';
export * from './validation.js';
export * from './pii-redaction.js';
export * from './observability.js';

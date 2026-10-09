import { z } from 'zod';

// ============================================================================
// Provider Types
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type AIModel = 
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface AIRequest {
  provider: AIProvider;
  model: AIModel;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  schema?: z.ZodSchema<any>;
  context?: RequestContext;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse<T = any> {
  content: T;
  raw: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: AIProvider;
  model: AIModel;
  latency: number;
  traceId?: string;
}

export interface RequestContext {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Error Types
// ============================================================================

export class AIGatewayError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AIGatewayError';
  }
}

export class ProviderError extends AIGatewayError {
  constructor(
    message: string,
    public provider: AIProvider,
    public originalError?: Error
  ) {
    super(message, 'PROVIDER_ERROR', 502, { provider, originalError });
    this.name = 'ProviderError';
  }
}

export class ValidationError extends AIGatewayError {
  constructor(
    message: string,
    public validationErrors: z.ZodError
  ) {
    super(message, 'VALIDATION_ERROR', 400, { validationErrors });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AIGatewayError {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: AIModel;
  maxRetries?: number;
  timeout?: number;
}

export interface GatewayConfig {
  providers: Partial<Record<AIProvider, ProviderConfig>>;
  defaultProvider: AIProvider;
  defaultModel: AIModel;
  langfuse?: {
    publicKey: string;
    secretKey: string;
    baseUrl: string;
  };
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// ============================================================================
// Schema Validation Types
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: z.ZodError;
}

export interface SchemaDefinition {
  name: string;
  description: string;
  schema: z.ZodSchema<any>;
}

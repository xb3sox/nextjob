import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import type { AIProvider, AIModel, AIMessage, AIRequest, AIResponse, ProviderConfig } from '../types.js';
import { ProviderError } from '../types.js';

// ============================================================================
// Provider Interface
// ============================================================================

export interface Provider {
  name: AIProvider;
  generateText(messages: AIMessage[], model: AIModel, options?: any): Promise<string>;
  generateObject<T>(messages: AIMessage[], model: AIModel, schema: z.ZodSchema<T>, options?: any): Promise<T>;
}

// ============================================================================
// OpenAI Provider
// ============================================================================

export class OpenAIProvider implements Provider {
  name: AIProvider = 'openai';
  private client: ReturnType<typeof createOpenAI>;

  constructor(config: ProviderConfig) {
    this.client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateText(messages: AIMessage[], model: AIModel, options?: any): Promise<string> {
    try {
      const result = await generateText({
        model: this.client(model),
        messages,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.text;
    } catch (error) {
      throw new ProviderError(
        `OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async generateObject<T>(
    messages: AIMessage[],
    model: AIModel,
    schema: z.ZodSchema<T>,
    options?: any
  ): Promise<T> {
    try {
      const result = await generateObject({
        model: this.client(model),
        messages,
        schema,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.object;
    } catch (error) {
      throw new ProviderError(
        `OpenAI object generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// ============================================================================
// Anthropic Provider
// ============================================================================

export class AnthropicProvider implements Provider {
  name: AIProvider = 'anthropic';
  private client: ReturnType<typeof createAnthropic>;

  constructor(config: ProviderConfig) {
    this.client = createAnthropic({
      apiKey: config.apiKey,
    });
  }

  async generateText(messages: AIMessage[], model: AIModel, options?: any): Promise<string> {
    try {
      const result = await generateText({
        model: this.client(model),
        messages,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.text;
    } catch (error) {
      throw new ProviderError(
        `Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async generateObject<T>(
    messages: AIMessage[],
    model: AIModel,
    schema: z.ZodSchema<T>,
    options?: any
  ): Promise<T> {
    try {
      const result = await generateObject({
        model: this.client(model),
        messages,
        schema,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.object;
    } catch (error) {
      throw new ProviderError(
        `Anthropic object generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// ============================================================================
// Google Provider
// ============================================================================

export class GoogleProvider implements Provider {
  name: AIProvider = 'google';
  private client: ReturnType<typeof createGoogleGenerativeAI>;

  constructor(config: ProviderConfig) {
    this.client = createGoogleGenerativeAI({
      apiKey: config.apiKey,
    });
  }

  async generateText(messages: AIMessage[], model: AIModel, options?: any): Promise<string> {
    try {
      const result = await generateText({
        model: this.client(model),
        messages,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.text;
    } catch (error) {
      throw new ProviderError(
        `Google generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async generateObject<T>(
    messages: AIMessage[],
    model: AIModel,
    schema: z.ZodSchema<T>,
    options?: any
  ): Promise<T> {
    try {
      const result = await generateObject({
        model: this.client(model),
        messages,
        schema,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
      return result.object;
    } catch (error) {
      throw new ProviderError(
        `Google object generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// ============================================================================
// Provider Factory
// ============================================================================

export function createProvider(name: AIProvider, config: ProviderConfig): Provider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'google':
      return new GoogleProvider(config);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

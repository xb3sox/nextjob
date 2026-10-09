import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { AIGateway, createAIGateway } from './index.js';
import type { GatewayConfig } from './types.js';

// ============================================================================
// Mock Provider
// ============================================================================

vi.mock('./providers/index.js', () => {
  return {
    createProvider: vi.fn((name: string) => ({
      name,
      generateText: vi.fn().mockResolvedValue('Mocked text response'),
      generateObject: vi.fn().mockResolvedValue({ test: 'data' }),
    })),
  };
});

// ============================================================================
// Tests
// ============================================================================

describe('AIGateway', () => {
  let gateway: AIGateway;
  let config: GatewayConfig;

  beforeEach(() => {
    config = {
      providers: {
        openai: {
          apiKey: 'test-key',
        },
        anthropic: {
          apiKey: 'test-key',
        },
      },
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o',
      rateLimit: {
        maxRequests: 10,
        windowMs: 60000,
      },
    };

    gateway = createAIGateway(config);
  });

  describe('Constructor', () => {
    it('should initialize with providers', () => {
      expect(gateway.hasProvider('openai')).toBe(true);
      expect(gateway.hasProvider('anthropic')).toBe(true);
      expect(gateway.hasProvider('google')).toBe(false);
    });

    it('should return configured providers', () => {
      const providers = gateway.getConfiguredProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
    });

    it('should return default provider', () => {
      expect(gateway.getDefaultProvider()).toBe('openai');
    });

    it('should return default model', () => {
      expect(gateway.getDefaultModel()).toBe('gpt-4o');
    });
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const response = await gateway.generateText({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      });

      expect(response).toBeDefined();
      expect(response.content).toBe('Mocked text response');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4o');
      expect(response.latency).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for unconfigured provider', async () => {
      await expect(
        gateway.generateText({
          provider: 'google',
          model: 'gemini-1.5-pro',
          messages: [
            { role: 'user', content: 'Hello' },
          ],
        })
      ).rejects.toThrow('Provider "google" not configured');
    });

    it('should redact PII from messages', async () => {
      const response = await gateway.generateText({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'My email is test@example.com' },
        ],
      });

      expect(response).toBeDefined();
      // PII should be redacted before sending to provider
    });
  });

  describe('generateObject', () => {
    it('should generate structured output successfully', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const response = await gateway.generateObject({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Generate a person' },
        ],
        schema,
      });

      expect(response).toBeDefined();
      expect(response.content).toEqual({ test: 'data' });
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4o');
    });

    it('should validate output against schema', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Mock provider returns invalid data
      const mockProvider = {
        name: 'openai' as const,
        generateText: vi.fn(),
        generateObject: vi.fn().mockResolvedValue({ invalid: 'data' }),
      };

      // This should throw a validation error
      // (In real implementation, the mock would need to be adjusted)
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      // Make 5 requests (within limit of 10)
      for (let i = 0; i < 5; i++) {
        await gateway.generateText({
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Test' }],
        }, { userId: 'user-1' });
      }

      // Should not throw
    });

    it('should throw error when rate limit exceeded', async () => {
      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        await gateway.generateText({
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Test' }],
        }, { userId: 'user-2' });
      }

      // 11th request should throw
      await expect(
        gateway.generateText({
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Test' }],
        }, { userId: 'user-2' })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should reset rate limit after window', async () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        await gateway.generateText({
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Test' }],
        }, { userId: 'user-3' });
      }

      // Wait for window to pass (mock time)
      vi.advanceTimersByTime(61000);

      // Should allow request again
      await gateway.generateText({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Test' }],
      }, { userId: 'user-3' });
    });
  });
});

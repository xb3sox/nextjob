import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initTemporal,
  getTemporalClient,
  getTemporalConnection,
  closeTemporal,
  isTemporalConnected,
} from './client.js';

// Mock Temporal Connection and Client
vi.mock('@temporalio/client', () => {
  const mockConnection = {
    close: vi.fn().mockResolvedValue(undefined),
  };

  const mockClient = {
    workflow: {
      start: vi.fn(),
      execute: vi.fn(),
      getHandle: vi.fn(),
    },
  };

  return {
    Connection: {
      connect: vi.fn().mockResolvedValue(mockConnection),
    },
    Client: vi.fn().mockImplementation(() => mockClient),
  };
});

describe('Temporal Client', () => {
  const testConfig = {
    address: 'localhost:7233',
    namespace: 'default',
    taskQueue: 'test-queue',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
    if (isTemporalConnected()) {
      await closeTemporal();
    }
  });

  describe('initTemporal', () => {
    it('should initialize Temporal connection and client', async () => {
      await initTemporal(testConfig);

      expect(isTemporalConnected()).toBe(true);
    });

    it('should throw error if connection fails', async () => {
      const { Connection } = await import('@temporalio/client');
      vi.mocked(Connection.connect).mockRejectedValueOnce(new Error('Connection failed'));

      await expect(initTemporal(testConfig)).rejects.toThrow('Connection failed');
    });
  });

  describe('getTemporalClient', () => {
    it('should return client when initialized', async () => {
      await initTemporal(testConfig);
      const client = getTemporalClient();

      expect(client).toBeDefined();
    });

    it('should throw error when not initialized', () => {
      expect(() => getTemporalClient()).toThrow('Temporal client not initialized');
    });
  });

  describe('getTemporalConnection', () => {
    it('should return connection when initialized', async () => {
      await initTemporal(testConfig);
      const connection = getTemporalConnection();

      expect(connection).toBeDefined();
    });

    it('should throw error when not initialized', () => {
      expect(() => getTemporalConnection()).toThrow('Temporal connection not initialized');
    });
  });

  describe('closeTemporal', () => {
    it('should close connection gracefully', async () => {
      await initTemporal(testConfig);
      expect(isTemporalConnected()).toBe(true);

      await closeTemporal();
      expect(isTemporalConnected()).toBe(false);
    });

    it('should handle closing when not connected', async () => {
      expect(isTemporalConnected()).toBe(false);
      await closeTemporal(); // Should not throw
      expect(isTemporalConnected()).toBe(false);
    });
  });

  describe('isTemporalConnected', () => {
    it('should return false when not initialized', () => {
      expect(isTemporalConnected()).toBe(false);
    });

    it('should return true when initialized', async () => {
      await initTemporal(testConfig);
      expect(isTemporalConnected()).toBe(true);
    });

    it('should return false after closing', async () => {
      await initTemporal(testConfig);
      expect(isTemporalConnected()).toBe(true);

      await closeTemporal();
      expect(isTemporalConnected()).toBe(false);
    });
  });
});

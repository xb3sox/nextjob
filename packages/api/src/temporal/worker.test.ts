import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockWorkerInstance, mockNativeConnection } = vi.hoisted(() => {
  const mockWorker = {
    run: vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        })
    ),
    shutdown: vi.fn(),
  };

  const mockConnection = {
    close: vi.fn().mockResolvedValue(undefined),
  };

  return {
    mockWorkerInstance: mockWorker,
    mockNativeConnection: mockConnection,
  };
});

vi.mock('@temporalio/worker', () => ({
  NativeConnection: {
    connect: vi.fn().mockResolvedValue(mockNativeConnection),
  },
  Worker: {
    create: vi.fn().mockResolvedValue(mockWorkerInstance),
  },
}));

import { getWorker, isWorkerRunning, startWorker, stopWorker } from './worker.js';

describe('Temporal Worker (T-24, Phase 7)', () => {
  const testConfig = {
    address: 'localhost:7233',
    namespace: 'nextjob-test',
    taskQueue: 'connector-submissions-test',
    maxConcurrentActivityExecutions: 5,
    maxConcurrentWorkflowTaskExecutions: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (isWorkerRunning()) {
      await stopWorker();
    }
  });

  it('starts worker with configured task queue, connection, and activities', async () => {
    expect(isWorkerRunning()).toBe(false);

    const workerPromise = startWorker(testConfig);
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(isWorkerRunning()).toBe(true);
    expect(getWorker()).toBeDefined();

    await stopWorker();
    await workerPromise;
  });

  it('shuts down worker and closes native connection gracefully', async () => {
    const workerPromise = startWorker(testConfig);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(isWorkerRunning()).toBe(true);

    await stopWorker();
    expect(isWorkerRunning()).toBe(false);
    expect(getWorker()).toBeNull();
    expect(mockWorkerInstance.shutdown).toHaveBeenCalled();
    expect(mockNativeConnection.close).toHaveBeenCalled();

    await workerPromise;
  });

  it('does not re-start worker if already running', async () => {
    const workerPromise = startWorker(testConfig);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(isWorkerRunning()).toBe(true);

    // Call startWorker again
    await startWorker(testConfig);
    expect(isWorkerRunning()).toBe(true);

    await stopWorker();
    await workerPromise;
  });
});

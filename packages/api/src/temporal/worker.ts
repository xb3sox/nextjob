import { Worker } from '@temporalio/worker';
import * as activities from '../activities/ats-connector.js';
import type { TemporalConfig } from './client.js';

// ============================================================================
// Types
// ============================================================================

export interface WorkerConfig extends TemporalConfig {
  maxConcurrentActivityExecutions?: number;
  maxConcurrentWorkflowTaskExecutions?: number;
}

// ============================================================================
// Worker Management
// ============================================================================

let worker: Worker | null = null;
let isRunning = false;

/**
 * Starts the Temporal worker
 */
export async function startWorker(config: WorkerConfig): Promise<void> {
  if (isRunning) {
    console.log('Worker is already running');
    return;
  }

  try {
    worker = await Worker.create({
      connection: {
        address: config.address,
      },
      namespace: config.namespace,
      taskQueue: config.taskQueue,
      workflowsPath: require.resolve('../workflows/connector-execution.js'),
      activities,
      maxConcurrentActivityExecutions: config.maxConcurrentActivityExecutions || 10,
      maxConcurrentWorkflowTaskExecutions: config.maxConcurrentWorkflowTaskExecutions || 10,
    });

    isRunning = true;
    console.log(`Temporal worker started on task queue: ${config.taskQueue}`);

    // Run the worker (this is a blocking call)
    await worker.run();
  } catch (error) {
    console.error('Failed to start Temporal worker:', error);
    isRunning = false;
    throw error;
  }
}

/**
 * Stops the Temporal worker gracefully
 */
export async function stopWorker(): Promise<void> {
  if (!worker || !isRunning) {
    console.log('Worker is not running');
    return;
  }

  try {
    console.log('Stopping Temporal worker...');
    worker.shutdown();
    isRunning = false;
    worker = null;
    console.log('Temporal worker stopped');
  } catch (error) {
    console.error('Error stopping Temporal worker:', error);
    throw error;
  }
}

/**
 * Checks if the worker is running
 */
export function isWorkerRunning(): boolean {
  return isRunning && worker !== null;
}

/**
 * Gets the worker instance (for testing purposes)
 */
export function getWorker(): Worker | null {
  return worker;
}

import { Connection, Client } from '@temporalio/client';

// ============================================================================
// Types
// ============================================================================

export interface TemporalConfig {
  address: string;
  namespace: string;
  taskQueue: string;
}

// ============================================================================
// Temporal Client
// ============================================================================

let connection: Connection | null = null;
let client: Client | null = null;

/**
 * Initializes Temporal connection and client
 */
export async function initTemporal(config: TemporalConfig): Promise<void> {
  try {
    connection = await Connection.connect({
      address: config.address,
    });

    client = new Client({
      connection,
      namespace: config.namespace,
    });

    console.log('Temporal client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Temporal client:', error);
    throw error;
  }
}

/**
 * Gets the Temporal client instance
 */
export function getTemporalClient(): Client {
  if (!client) {
    throw new Error('Temporal client not initialized. Call initTemporal() first.');
  }
  return client;
}

/**
 * Gets the Temporal connection instance
 */
export function getTemporalConnection(): Connection {
  if (!connection) {
    throw new Error('Temporal connection not initialized. Call initTemporal() first.');
  }
  return connection;
}

/**
 * Closes Temporal connection gracefully
 */
export async function closeTemporal(): Promise<void> {
  if (connection) {
    await connection.close();
    connection = null;
    client = null;
    console.log('Temporal connection closed');
  }
}

/**
 * Checks if Temporal is connected
 */
export function isTemporalConnected(): boolean {
  return connection !== null && client !== null;
}

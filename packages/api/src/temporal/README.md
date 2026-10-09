# Temporal Workflow Infrastructure

This module provides durable workflow execution for NextJob's ATS connector system using Temporal.

## Overview

Temporal is used to orchestrate the complex, multi-step process of submitting job applications to various ATS (Applicant Tracking Systems). It provides:

- **Durable execution** - Workflows survive server restarts
- **Automatic retries** - Failed activities are retried with exponential backoff
- **Idempotency** - Prevents duplicate submissions
- **Visibility** - Full audit trail of all operations
- **Timeouts** - Configurable timeouts for each step

## Architecture

```
┌─────────────────┐
│   API Server    │
│                 │
│  ┌───────────┐  │
│  │  Client   │  │──────┐
│  └───────────┘  │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│  Temporal       │      │
│  Server         │◄─────┘
│                 │
│  ┌───────────┐  │
│  │ Workflows │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │ Activities│  │
│  └───────────┘  │
└─────────────────┘
```

## Components

### 1. Client (`temporal/client.ts`)

Manages the connection to Temporal server and provides the client interface.

```typescript
import { initTemporal, getTemporalClient, closeTemporal } from './temporal/client';

// Initialize
await initTemporal({
  address: 'localhost:7233',
  namespace: 'default',
  taskQueue: 'nextjob-connectors',
});

// Get client
const client = getTemporalClient();

// Close when done
await closeTemporal();
```

### 2. Worker (`temporal/worker.ts`)

Runs the workflows and executes activities.

```typescript
import { startWorker, stopWorker } from './temporal/worker';

// Start worker
await startWorker({
  address: 'localhost:7233',
  namespace: 'default',
  taskQueue: 'nextjob-connectors',
  maxConcurrentActivityExecutions: 10,
});

// Stop worker gracefully
await stopWorker();
```

### 3. Workflows (`workflows/connector-execution.ts`)

Defines the workflow logic for executing ATS connectors.

**Workflow: `connectorExecutionWorkflow`**

Executes the complete application submission process:

1. **Check Duplicate** - Ensures idempotency
2. **Execute Connector** - Submits to ATS
3. **Verify Submission** - Confirms successful submission

```typescript
import { getTemporalClient } from './temporal/client';
import { connectorExecutionWorkflow } from './workflows/connector-execution';

const client = getTemporalClient();

const handle = await client.workflow.start(connectorExecutionWorkflow, {
  args: [{
    applicationId: 'app-123',
    userId: 'user-456',
    tenantId: 'tenant-789',
    jobId: 'job-abc',
    connectorType: 'greenhouse',
    applicationData: {
      resume: 'resume-content',
      coverLetter: 'cover-letter',
      answers: { question1: 'answer1' },
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    idempotencyKey: 'unique-key-123',
  }],
  taskQueue: 'nextjob-connectors',
  workflowId: 'connector-exec-app-123',
});

const result = await handle.result();
```

### 4. Activities (`activities/ats-connector.ts`)

Implements the actual operations performed by workflows.

**Activities:**

- `checkDuplicate` - Checks if application already submitted
- `executeATSConnector` - Executes the ATS-specific submission logic
- `verifySubmission` - Verifies the submission was successful

```typescript
// Activities are automatically registered with the worker
// They are called from workflows using proxyActivities
```

## Configuration

### Environment Variables

```bash
# Temporal server address
TEMPORAL_ADDRESS=localhost:7233

# Temporal namespace
TEMPORAL_NAMESPACE=default

# Task queue name
TEMPORAL_TASK_QUEUE=nextjob-connectors

# Worker configuration
TEMPORAL_MAX_CONCURRENT_ACTIVITIES=10
TEMPORAL_MAX_CONCURRENT_WORKFLOWS=10
```

### Default Configuration

```typescript
const defaultConfig = {
  address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'nextjob-connectors',
  maxConcurrentActivityExecutions: 10,
  maxConcurrentWorkflowTaskExecutions: 10,
};
```

## Usage Example

### Starting the Worker

```typescript
import { initTemporal, startWorker } from './temporal';

async function main() {
  // Initialize Temporal client
  await initTemporal({
    address: 'localhost:7233',
    namespace: 'default',
    taskQueue: 'nextjob-connectors',
  });

  // Start worker
  await startWorker({
    address: 'localhost:7233',
    namespace: 'default',
    taskQueue: 'nextjob-connectors',
  });
}

main().catch(console.error);
```

### Submitting an Application

```typescript
import { getTemporalClient } from './temporal/client';
import { connectorExecutionWorkflow } from './workflows/connector-execution';

async function submitApplication(applicationData: any) {
  const client = getTemporalClient();

  const handle = await client.workflow.start(connectorExecutionWorkflow, {
    args: [applicationData],
    taskQueue: 'nextjob-connectors',
    workflowId: `connector-exec-${applicationData.applicationId}`,
  });

  console.log(`Workflow started: ${handle.workflowId}`);

  const result = await handle.result();
  console.log('Workflow completed:', result);

  return result;
}
```

### Checking Workflow Status

```typescript
import { getTemporalClient } from './temporal/client';

async function checkWorkflowStatus(workflowId: string) {
  const client = getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  const description = await handle.describe();

  console.log('Status:', description.status);
  return description;
}
```

## Error Handling

### Workflow Errors

Workflows handle errors gracefully and return structured error responses:

```typescript
interface ConnectorExecutionResult {
  success: boolean;
  submissionId?: string;
  receiptId?: string;
  status: 'SUBMITTED' | 'FAILED' | 'DUPLICATE' | 'TIMEOUT';
  error?: string;
  verified: boolean;
  timestamp: string;
}
```

### Activity Retries

Activities are configured with automatic retries:

```typescript
const { executeATSConnector } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1s',
    backoffCoefficient: 2,
  },
});
```

### Idempotency

The workflow checks for duplicates before executing:

```typescript
const duplicateCheck = await checkDuplicate({
  applicationId: params.applicationId,
  idempotencyKey: params.idempotencyKey,
});

if (duplicateCheck.isDuplicate) {
  return {
    success: false,
    status: 'DUPLICATE',
    error: 'Application already submitted',
    verified: true,
    timestamp: new Date().toISOString(),
  };
}
```

## Testing

### Unit Tests

```bash
# Run Temporal client tests
npm test temporal/client.test.ts

# Run ATS connector activity tests
npm test activities/ats-connector.test.ts
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { initTemporal, closeTemporal } from './temporal/client';
import { connectorExecutionWorkflow } from './workflows/connector-execution';

describe('Temporal Integration', () => {
  beforeAll(async () => {
    await initTemporal({
      address: 'localhost:7233',
      namespace: 'default',
      taskQueue: 'test-queue',
    });
  });

  afterAll(async () => {
    await closeTemporal();
  });

  it('should execute workflow successfully', async () => {
    // Test workflow execution
  });
});
```

## Monitoring

### Temporal Web UI

Access the Temporal Web UI at: `http://localhost:8088`

View:
- Workflow executions
- Activity executions
- History and logs
- Search and filtering

### Metrics

Temporal exposes Prometheus metrics at: `http://localhost:9090/metrics`

Key metrics:
- `temporal_workflow_completed` - Number of completed workflows
- `temporal_activity_completed` - Number of completed activities
- `temporal_workflow_failed` - Number of failed workflows
- `temporal_activity_failed` - Number of failed activities

## Troubleshooting

### Worker Not Starting

**Problem:** Worker fails to start

**Solution:**
1. Check Temporal server is running: `temporal server start-dev`
2. Verify connection: `temporal operator cluster health`
3. Check logs for connection errors

### Workflow Stuck

**Problem:** Workflow appears stuck

**Solution:**
1. Check workflow history in Temporal Web UI
2. Look for failed activities
3. Check activity timeouts
4. Verify worker is running

### Duplicate Submissions

**Problem:** Duplicate applications being submitted

**Solution:**
1. Verify idempotency key is unique per application
2. Check `checkDuplicate` activity is working
3. Review workflow execution logs

## Development

### Local Development

1. Start Temporal server:
```bash
temporal server start-dev
```

2. Start worker:
```bash
npm run temporal:worker
```

3. Submit test application:
```bash
npm run temporal:test
```

### Adding New Connectors

1. Create new activity in `activities/` directory
2. Add connector-specific logic
3. Update workflow to support new connector type
4. Add tests for new connector
5. Update documentation

## Production Deployment

### Requirements

- Temporal server (self-hosted or Temporal Cloud)
- PostgreSQL database
- Node.js 18+
- Sufficient memory for worker (recommend 2GB+)

### Scaling

- Run multiple workers for horizontal scaling
- Configure task queue partitions for high throughput
- Use Temporal Cloud for managed infrastructure

### Security

- Use TLS for Temporal connections
- Implement authentication for Temporal server
- Restrict network access to Temporal server
- Use environment variables for sensitive data

## References

- [Temporal Documentation](https://docs.temporal.io/)
- [Temporal TypeScript SDK](https://docs.temporal.io/develop/typescript)
- [Temporal Web UI](http://localhost:8088)
- [NextJob PRD - Application Execution](../../docs/PRD.md#application-execution)

## License

Private - Part of NextJob project

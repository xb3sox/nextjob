# @nextjob/ai-gateway

AI Gateway package for NextJob - provides unified interface for multiple AI providers with structured output validation, PII redaction, and observability.

## Features

- **Multi-Provider Support**: OpenAI, Anthropic, Google
- **Provider Abstraction**: Unified interface for all providers
- **Structured Output**: Zod schema validation for all AI outputs
- **PII Redaction**: Automatic detection and redaction of sensitive data
- **Observability**: Langfuse integration for tracing and monitoring
- **Rate Limiting**: Built-in rate limiting per user
- **Type Safety**: Full TypeScript support

## Installation

```bash
bun install
```

## Usage

### Basic Setup

```typescript
import { createAIGateway } from '@nextjob/ai-gateway';

const gateway = createAIGateway({
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
  defaultProvider: 'openai',
  defaultModel: 'gpt-4o',
  langfuse: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL,
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
});
```

### Generate Text

```typescript
const response = await gateway.generateText({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  temperature: 0.7,
  maxTokens: 500,
});

console.log(response.content);
```

### Generate Structured Output

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number(),
  skills: z.array(z.string()),
});

const response = await gateway.generateObject({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Generate a person profile' },
  ],
  schema,
});

console.log(response.content); // Validated object
```

### Using Predefined Schemas

```typescript
import { CareerClaimSchema, EligibilityAssessmentSchema } from '@nextjob/ai-gateway';

const response = await gateway.generateObject({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Extract career claim from CV' },
  ],
  schema: CareerClaimSchema,
});
```

### PII Redaction

```typescript
import { redactPII, detectPII } from '@nextjob/ai-gateway';

// Detect PII
const detected = detectPII('Email: test@example.com, Phone: 555-123-4567');
console.log(detected); // { email: ['test@example.com'], phone: ['555-123-4567'] }

// Redact PII
const redacted = redactPII('Email: test@example.com');
console.log(redacted); // 'Email: [REDACTED]'

// Context-aware redaction
const cvRedacted = redactWithContext('Email: test@example.com', 'cv');
// Preserves email for CV context
```

### Request Context

```typescript
const response = await gateway.generateText(
  {
    provider: 'openai',
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }],
  },
  {
    userId: 'user-123',
    tenantId: 'tenant-456',
    sessionId: 'session-789',
    operation: 'cv-extraction',
    metadata: { source: 'web' },
  }
);
```

## API Reference

### AIGateway

#### `generateText(request, context?)`
Generates text using specified provider and model.

#### `generateObject<T>(request, context?)`
Generates structured output validated against Zod schema.

#### `getConfiguredProviders()`
Returns list of configured provider names.

#### `hasProvider(name)`
Checks if a provider is configured.

#### `getDefaultProvider()`
Returns default provider name.

#### `getDefaultModel()`
Returns default model name.

### Providers

- `OpenAIProvider` - OpenAI GPT models
- `AnthropicProvider` - Anthropic Claude models
- `GoogleProvider` - Google Gemini models

### Validation

- `validateSchema(data, schema)` - Validates data against schema
- `validateSchemaOrThrow(data, schema, context?)` - Validates and throws on error
- `createStructuredSchema(name, description, shape)` - Creates schema with metadata

### Predefined Schemas

- `CareerClaimSchema` - Career claim extraction
- `EligibilityAssessmentSchema` - Job eligibility assessment
- `JobMatchSchema` - Job match scoring
- `TailoredResumeSchema` - Resume tailoring
- `CoverLetterSchema` - Cover letter generation
- `ApplicationAnswerSchema` - Application answers
- `InterviewPrepSchema` - Interview preparation

### PII Redaction

- `detectPII(text)` - Detects PII in text
- `redactPII(text, options?)` - Redacts PII from text
- `redactMessages(messages, options?)` - Redacts PII from message array
- `redactObject(obj, options?)` - Redacts PII from object recursively
- `redactWithContext(text, context)` - Context-aware redaction
- `validateNoPII(text)` - Validates text has no PII
- `assertNoPII(text, context?)` - Asserts text has no PII

### Observability

- `initLangfuse(config)` - Initializes Langfuse client
- `createTrace(request, context)` - Creates trace for request
- `recordGeneration(traceId, request, response, options)` - Records generation
- `recordError(traceId, request, error, context)` - Records error
- `recordValidation(traceId, schemaName, valid, errors)` - Records validation
- `recordScore(traceId, name, value, comment)` - Records score
- `recordCost(traceId, cost, currency)` - Records cost
- `shutdownLangfuse()` - Shuts down Langfuse client

## Error Handling

```typescript
import { AIGatewayError, ProviderError, ValidationError, RateLimitError } from '@nextjob/ai-gateway';

try {
  await gateway.generateText(request);
} catch (error) {
  if (error instanceof ProviderError) {
    console.error('Provider error:', error.provider);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.validationErrors);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof AIGatewayError) {
    console.error('Gateway error:', error.code);
  }
}
```

## Configuration

### Provider Configuration

```typescript
{
  apiKey: string;        // Required
  baseUrl?: string;      // Optional custom endpoint
  defaultModel?: string; // Optional default model
  maxRetries?: number;   // Optional retry count
  timeout?: number;      // Optional timeout in ms
}
```

### Rate Limiting

```typescript
{
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Window size in milliseconds
}
```

### Langfuse

```typescript
{
  publicKey: string;   // Langfuse public key
  secretKey: string;   // Langfuse secret key
  baseUrl: string;     // Langfuse base URL
}
```

## Testing

```bash
bun test
```

## License

Private - Part of NextJob project

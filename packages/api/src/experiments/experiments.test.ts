import { beforeEach, describe, expect, it } from 'vitest';
import { ExperimentService } from './service';
import type { ExperimentDomain, GuardrailMetric } from './types';

describe('ExperimentService', () => {
  let service: ExperimentService;

  beforeEach(() => {
    service = new ExperimentService();
  });

  it('should register and retrieve experiments across all required domains', () => {
    const domains: ExperimentDomain[] = [
      'ranking',
      'match_explanations',
      'tailoring',
      'approval_ux',
      'notifications',
      'pricing',
      'onboarding',
    ];

    domains.forEach((domain) => {
      service.registerExperiment({
        id: `exp-${domain}`,
        name: `Experiment for ${domain}`,
        domain,
        status: 'active',
        variants: [
          { id: 'control', name: 'Control', weight: 0.5 },
          { id: 'variant_a', name: 'Variant A', weight: 0.5 },
        ],
        primaryOutcome: 'interview_lift',
        guardrails: [{ metric: 'unsupported_claims', maxRate: 0.01 }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const exp = service.getExperiment(`exp-${domain}`);
      expect(exp?.domain).toBe(domain);
      expect(exp?.primaryOutcome).toBe('interview_lift');
    });

    expect(service.listExperiments()).toHaveLength(7);
  });

  it('should deterministically assign variants based on user ID and experiment ID', () => {
    service.registerExperiment({
      id: 'exp-ranking-01',
      name: 'Ranking Algorithm Test',
      domain: 'ranking',
      status: 'active',
      variants: [
        { id: 'control', name: 'Control Ranking', weight: 0.5 },
        { id: 'smart_ranking', name: 'Smart Ranking', weight: 0.5 },
      ],
      primaryOutcome: 'interview_lift',
      guardrails: [{ metric: 'ineligible_applications', maxRate: 0.02 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const v1 = service.assignVariant('user_123', 'exp-ranking-01');
    const v1Repeat = service.assignVariant('user_123', 'exp-ranking-01');
    expect(v1.id).toBe(v1Repeat.id);
    expect(service.assignVariant('user_456', 'exp-ranking-01').id).toBeDefined();
  });

  it('should return control variant when experiment is paused or draft', () => {
    service.registerExperiment({
      id: 'exp-paused',
      name: 'Paused Experiment',
      domain: 'pricing',
      status: 'paused',
      variants: [{ id: 'variant_a', name: 'Variant A', weight: 1.0 }],
      primaryOutcome: 'interview_lift',
      guardrails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(service.assignVariant('user_123', 'exp-paused').id).toBe('control');
  });

  it('should track primary outcome metric (verified interview lift) per variant', () => {
    service.registerExperiment({
      id: 'exp-tailoring',
      name: 'Tailoring Prompt Test',
      domain: 'tailoring',
      status: 'active',
      variants: [
        { id: 'control', name: 'Control', weight: 0.5 },
        { id: 'variant_a', name: 'New Prompt', weight: 0.5 },
      ],
      primaryOutcome: 'interview_lift',
      guardrails: [{ metric: 'unsupported_claims', maxRate: 0.0 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    service.recordMetric({
      experimentId: 'exp-tailoring',
      variantId: 'control',
      userId: 'u1',
      metricName: 'total_applications',
      value: 10,
    });
    service.recordMetric({
      experimentId: 'exp-tailoring',
      variantId: 'control',
      userId: 'u1',
      metricName: 'interview_lift',
      value: 2,
    });
    service.recordMetric({
      experimentId: 'exp-tailoring',
      variantId: 'variant_a',
      userId: 'u2',
      metricName: 'total_applications',
      value: 10,
    });
    service.recordMetric({
      experimentId: 'exp-tailoring',
      variantId: 'variant_a',
      userId: 'u2',
      metricName: 'interview_lift',
      value: 4,
    });

    const stats = service.getInterviewLift('exp-tailoring');
    expect(stats.control.liftRate).toBe(0.2);
    expect(stats.variant_a.liftRate).toBe(0.4);
  });

  it('should monitor guardrails and trigger alerts on violations across all metrics', () => {
    const metrics: GuardrailMetric[] = [
      'unsupported_claims',
      'ineligible_applications',
      'duplicate_submissions',
      'sensitive_field_errors',
      'complaints',
      'connector_failures',
    ];

    metrics.forEach((metric) => {
      const expService = new ExperimentService();
      const expId = `exp-${metric}`;

      expService.registerExperiment({
        id: expId,
        name: `Guardrail test for ${metric}`,
        domain: 'approval_ux',
        status: 'active',
        variants: [{ id: 'variant_b', name: 'Variant B', weight: 1.0 }],
        primaryOutcome: 'interview_lift',
        guardrails: [{ metric, maxRate: 0.05 }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expService.recordMetric({
        experimentId: expId,
        variantId: 'variant_b',
        userId: 'u1',
        metricName: 'total_applications',
        value: 100,
      });
      expService.recordMetric({
        experimentId: expId,
        variantId: 'variant_b',
        userId: 'u1',
        metricName: metric,
        value: 10,
      });

      const alerts = expService.getAlerts(expId);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].metric).toBe(metric);
      expect(alerts[0].status).toBe('triggered');
      expect(expService.getExperiment(expId)?.status).toBe('paused');
    });
  });
});

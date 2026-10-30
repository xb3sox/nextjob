import type {
  Experiment,
  ExperimentAssignment,
  GuardrailAlert,
  GuardrailMetric,
  MetricEvent,
  Variant,
} from './types';

export class ExperimentService {
  private experiments = new Map<string, Experiment>();
  private assignments = new Map<string, ExperimentAssignment>();
  private metricEvents: MetricEvent[] = [];
  private alerts: GuardrailAlert[] = [];

  public registerExperiment(experiment: Experiment): void {
    this.experiments.set(experiment.id, experiment);
  }

  public getExperiment(id: string): Experiment | undefined {
    return this.experiments.get(id);
  }

  public listExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  public updateStatus(id: string, status: Experiment['status']): void {
    const exp = this.experiments.get(id);
    if (exp) {
      exp.status = status;
      exp.updatedAt = new Date().toISOString();
    }
  }

  public assignVariant(userId: string, experimentId: string): Variant {
    const experiment = this.experiments.get(experimentId);
    if (experiment?.status !== 'active' || experiment.variants.length === 0) {
      return { id: 'control', name: 'Control (Default)', weight: 1.0 };
    }

    const assignmentKey = `${userId}:${experimentId}`;
    const existing = this.assignments.get(assignmentKey);
    if (existing) {
      const found = experiment.variants.find((v) => v.id === existing.variantId);
      if (found) return found;
    }

    let hash = 0;
    const str = `${experimentId}:${userId}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const normalizedHash = (Math.abs(hash) % 10000) / 10000;

    let cumulativeWeight = 0;
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    let selectedVariant = experiment.variants[0];

    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight / (totalWeight || 1);
      if (normalizedHash < cumulativeWeight) {
        selectedVariant = variant;
        break;
      }
    }

    this.assignments.set(assignmentKey, {
      experimentId,
      userId,
      variantId: selectedVariant.id,
      assignedAt: new Date().toISOString(),
    });

    return selectedVariant;
  }

  public recordMetric(event: Omit<MetricEvent, 'timestamp'>): void {
    this.metricEvents.push({ ...event, timestamp: new Date().toISOString() });
    if (this.experiments.get(event.experimentId)?.status === 'active') {
      this.evaluateGuardrails(event.experimentId);
    }
  }

  public getInterviewLift(
    experimentId: string
  ): Record<string, { totalApplications: number; interviews: number; liftRate: number }> {
    const events = this.metricEvents.filter((e) => e.experimentId === experimentId);
    const result: Record<
      string,
      { totalApplications: number; interviews: number; liftRate: number }
    > = {};

    for (const event of events) {
      if (!result[event.variantId]) {
        result[event.variantId] = { totalApplications: 0, interviews: 0, liftRate: 0 };
      }
      const stats = result[event.variantId];
      if (event.metricName === 'total_applications' || event.metricName === 'total_submissions') {
        stats.totalApplications += event.value;
      } else if (event.metricName === 'interview_lift') {
        stats.interviews += event.value;
      }
    }

    for (const stats of Object.values(result)) {
      stats.liftRate = stats.totalApplications > 0 ? stats.interviews / stats.totalApplications : 0;
    }

    return result;
  }

  public evaluateGuardrails(experimentId: string): GuardrailAlert[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return [];

    const events = this.metricEvents.filter((e) => e.experimentId === experimentId);
    const totalApps = events
      .filter((e) => e.metricName === 'total_applications' || e.metricName === 'total_submissions')
      .reduce((sum, e) => sum + e.value, 0);

    const triggeredAlerts: GuardrailAlert[] = [];

    for (const threshold of experiment.guardrails) {
      const count = events
        .filter((e) => e.metricName === threshold.metric)
        .reduce((sum, e) => sum + e.value, 0);
      const currentRate = totalApps > 0 ? count / totalApps : count > 0 ? 1.0 : 0;

      if (
        (threshold.maxRate !== undefined && currentRate > threshold.maxRate) ||
        (threshold.maxCount !== undefined && count > threshold.maxCount)
      ) {
        const alert: GuardrailAlert = {
          experimentId,
          metric: threshold.metric as GuardrailMetric,
          currentRate,
          maxRate: threshold.maxRate,
          status: 'triggered',
          message: `Guardrail violation: '${threshold.metric}' rate ${currentRate.toFixed(4)} exceeded max threshold ${threshold.maxRate}`,
          timestamp: new Date().toISOString(),
        };

        triggeredAlerts.push(alert);
        this.alerts.push(alert);

        if (experiment.status === 'active') {
          this.updateStatus(experimentId, 'paused');
        }
      }
    }

    return triggeredAlerts;
  }

  public getAlerts(experimentId?: string): GuardrailAlert[] {
    return experimentId ? this.alerts.filter((a) => a.experimentId === experimentId) : this.alerts;
  }
}

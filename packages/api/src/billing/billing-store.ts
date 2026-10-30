import crypto from 'node:crypto';
import type { UserSubscription } from './types';

export class BillingStore {
  private subscriptions: Map<string, UserSubscription> = new Map();
  private processedWebhookEvents: Set<string> = new Set();
  private featureUsage: Map<string, number> = new Map();

  private makeUserKey(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }

  private makeUsageKey(tenantId: string, userId: string, feature: string): string {
    return `${tenantId}:${userId}:${feature}`;
  }

  async findSubscriptionByUser(tenantId: string, userId: string): Promise<UserSubscription | null> {
    const key = this.makeUserKey(tenantId, userId);
    return this.subscriptions.get(key) ?? null;
  }

  async findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.stripeSubscriptionId === stripeSubscriptionId) {
        return sub;
      }
    }
    return null;
  }

  async saveSubscription(
    data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<UserSubscription> {
    const id = data.id || `sub_${crypto.randomUUID()}`;
    const sub: UserSubscription = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const key = this.makeUserKey(sub.tenantId, sub.userId);
    this.subscriptions.set(key, sub);
    return sub;
  }

  async getFeatureUsage(tenantId: string, userId: string, feature: string): Promise<number> {
    const key = this.makeUsageKey(tenantId, userId, feature);
    return this.featureUsage.get(key) ?? 0;
  }

  async incrementFeatureUsage(tenantId: string, userId: string, feature: string): Promise<number> {
    const key = this.makeUsageKey(tenantId, userId, feature);
    const count = (this.featureUsage.get(key) ?? 0) + 1;
    this.featureUsage.set(key, count);
    return count;
  }

  async resetFeatureUsage(tenantId: string, userId: string, feature: string): Promise<void> {
    const key = this.makeUsageKey(tenantId, userId, feature);
    this.featureUsage.delete(key);
  }

  hasProcessedWebhookEvent(eventId: string): boolean {
    return this.processedWebhookEvents.has(eventId);
  }

  markWebhookEventProcessed(eventId: string): void {
    this.processedWebhookEvents.add(eventId);
  }

  clear(): void {
    this.subscriptions.clear();
    this.processedWebhookEvents.clear();
    this.featureUsage.clear();
  }
}

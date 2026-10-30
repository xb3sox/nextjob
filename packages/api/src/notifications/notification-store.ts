import crypto from 'node:crypto';
import type { InAppNotification, NotificationPreferences } from './types';

export class NotificationStore {
  private notifications: Map<string, InAppNotification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  private makePrefKey(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }

  async saveNotification(
    notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read' | 'readAt'>
  ): Promise<InAppNotification> {
    const id = `notif_${crypto.randomUUID()}`;
    const record: InAppNotification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date(),
      readAt: null,
    };
    this.notifications.set(id, record);
    return record;
  }

  async findById(tenantId: string, userId: string, id: string): Promise<InAppNotification | null> {
    const item = this.notifications.get(id);
    if (!item) return null;
    // Strict tenant and user isolation
    if (item.tenantId !== tenantId || item.userId !== userId) {
      return null;
    }
    return item;
  }

  async list(
    tenantId: string,
    userId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ notifications: InAppNotification[]; total: number; unreadCount: number }> {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    const allForUser = Array.from(this.notifications.values()).filter(
      (n) => n.tenantId === tenantId && n.userId === userId
    );

    const unreadCount = allForUser.filter((n) => !n.read).length;

    let filtered = allForUser;
    if (options.unreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }

    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const paginated = filtered.slice(offset, offset + limit);

    return {
      notifications: paginated,
      total: filtered.length,
      unreadCount,
    };
  }

  async markAsRead(
    tenantId: string,
    userId: string,
    notificationId: string
  ): Promise<InAppNotification | null> {
    const item = await this.findById(tenantId, userId, notificationId);
    if (!item) return null;

    item.read = true;
    item.readAt = new Date();
    this.notifications.set(notificationId, item);
    return item;
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    let updated = 0;
    const now = new Date();
    for (const [id, item] of this.notifications.entries()) {
      if (item.tenantId === tenantId && item.userId === userId && !item.read) {
        item.read = true;
        item.readAt = now;
        this.notifications.set(id, item);
        updated++;
      }
    }
    return updated;
  }

  async getPreferences(tenantId: string, userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.get(this.makePrefKey(tenantId, userId)) ?? null;
  }

  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    const key = this.makePrefKey(preferences.tenantId, preferences.userId);
    this.preferences.set(key, preferences);
  }

  clear(): void {
    this.notifications.clear();
    this.preferences.clear();
  }
}

import crypto from 'node:crypto';
import type { AnalyticsService } from '../analytics/service';
import type { ReferralCodeRecord, ReferralConversionRecord, ReferralStats } from './types';

const BASE_URL = 'https://nextjob.ai';
const REWARD_PER_SIGNUP = 10; // $10 Search Pass credit per referral

export class ReferralService {
  private codes = new Map<string, ReferralCodeRecord>(); // code -> record
  private userToCode = new Map<string, string>(); // userId -> code
  private conversions: ReferralConversionRecord[] = [];
  private analytics?: AnalyticsService;

  constructor(analytics?: AnalyticsService) {
    this.analytics = analytics;
  }

  /**
   * Generates or retrieves unique referral code and URL for a user.
   */
  getOrCreateReferralCode(tenantId: string, userId: string): ReferralCodeRecord {
    const existingCode = this.userToCode.get(userId);
    if (existingCode) {
      const existingRecord = this.codes.get(existingCode);
      if (existingRecord) {
        return existingRecord;
      }
    }

    const hash = crypto
      .createHash('sha256')
      .update(`${tenantId}:${userId}`)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();
    const code = `REF-${hash}`;
    const referralUrl = `${BASE_URL}/?ref=${code}`;

    const record: ReferralCodeRecord = {
      code,
      referrerUserId: userId,
      tenantId,
      referralUrl,
      clicks: 0,
      signups: 0,
      rewardCredits: 0,
      createdAt: new Date().toISOString(),
    };

    this.codes.set(code, record);
    this.userToCode.set(userId, code);
    return record;
  }

  /**
   * Records an outbound click or visit via a referral link.
   */
  recordClick(code: string): boolean {
    const record = this.codes.get(code.toUpperCase());
    if (!record) {
      return false;
    }
    record.clicks += 1;
    return true;
  }

  /**
   * Attributes a signup to the referral code.
   * Enforces that a user cannot refer themselves.
   */
  async trackReferralSignup(
    code: string,
    referredUserId: string
  ): Promise<ReferralConversionRecord | null> {
    const record = this.codes.get(code.toUpperCase());
    if (!record) {
      return null;
    }

    // Prevent self-referral
    if (record.referrerUserId === referredUserId) {
      throw new Error('Self-referrals are not permitted');
    }

    // Check if referred user was already attributed
    const alreadyAttributed = this.conversions.some((c) => c.referredUserId === referredUserId);
    if (alreadyAttributed) {
      return null;
    }

    record.signups += 1;
    record.rewardCredits += REWARD_PER_SIGNUP;

    const conversion: ReferralConversionRecord = {
      id: crypto.randomUUID(),
      code: record.code,
      referrerUserId: record.referrerUserId,
      referredUserId,
      status: 'rewarded',
      createdAt: new Date().toISOString(),
      rewardValue: REWARD_PER_SIGNUP,
    };

    this.conversions.push(conversion);

    // Track in analytics if service configured
    if (this.analytics) {
      await this.analytics.trackOnboarding(record.tenantId, referredUserId, 'completed', {
        referralCode: record.code,
      });
    }

    return conversion;
  }

  /**
   * Retrieves summary referral performance stats for a user.
   */
  getReferralStats(tenantId: string, userId: string): ReferralStats {
    const record = this.getOrCreateReferralCode(tenantId, userId);
    return {
      code: record.code,
      referralUrl: record.referralUrl,
      clicks: record.clicks,
      successfulSignups: record.signups,
      rewardCreditsEarned: record.rewardCredits,
      rewardDescription: 'Give $10 off Search Pass, get $10 credit per verified signup.',
    };
  }

  /**
   * Returns all recorded conversions.
   */
  getConversions(): readonly ReferralConversionRecord[] {
    return [...this.conversions];
  }
}

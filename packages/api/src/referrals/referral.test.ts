import { beforeEach, describe, expect, it } from 'vitest';
import { AnalyticsService } from '../analytics/service';
import { ReferralService } from './index';

describe('Referral Program Infrastructure (T-56, FR-MKT-10)', () => {
  let analytics: AnalyticsService;
  let service: ReferralService;

  const TENANT_ID = 'tenant_referral_test';
  const REFERRER_USER_ID = 'user_alice';
  const REFERRED_USER_ID = 'user_bob';

  beforeEach(() => {
    analytics = new AnalyticsService();
    service = new ReferralService(analytics);
  });

  describe('Referral Link & Code Generation', () => {
    it('generates unique, deterministic referral code and link for candidate', () => {
      const codeRecord1 = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);
      const codeRecord2 = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);

      expect(codeRecord1.code).toMatch(/^REF-[A-Z0-9]{6}$/);
      expect(codeRecord1.referralUrl).toBe(`https://nextjob.ai/?ref=${codeRecord1.code}`);
      expect(codeRecord1.clicks).toBe(0);
      expect(codeRecord1.signups).toBe(0);
      expect(codeRecord1.rewardCredits).toBe(0);

      // Deterministic: subsequent calls return same code
      expect(codeRecord1.code).toBe(codeRecord2.code);
    });

    it('generates distinct codes for different users', () => {
      const recordA = service.getOrCreateReferralCode(TENANT_ID, 'user_alice');
      const recordB = service.getOrCreateReferralCode(TENANT_ID, 'user_charlie');

      expect(recordA.code).not.toBe(recordB.code);
    });
  });

  describe('Click Tracking', () => {
    it('increments click counter when referral link is clicked', () => {
      const record = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);

      const success = service.recordClick(record.code);
      expect(success).toBe(true);

      service.recordClick(record.code);
      service.recordClick(record.code);

      const stats = service.getReferralStats(TENANT_ID, REFERRER_USER_ID);
      expect(stats.clicks).toBe(3);
    });

    it('returns false when clicking non-existent code', () => {
      expect(service.recordClick('REF-INVALID')).toBe(false);
    });
  });

  describe('Referral Conversion & Attribution', () => {
    it('attributes new signup to referral code and grants incentive credits', async () => {
      const record = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);

      const conversion = await service.trackReferralSignup(record.code, REFERRED_USER_ID);
      expect(conversion).not.toBeNull();
      expect(conversion?.code).toBe(record.code);
      expect(conversion?.referrerUserId).toBe(REFERRER_USER_ID);
      expect(conversion?.referredUserId).toBe(REFERRED_USER_ID);
      expect(conversion?.rewardValue).toBe(10);
      expect(conversion?.status).toBe('rewarded');

      const stats = service.getReferralStats(TENANT_ID, REFERRER_USER_ID);
      expect(stats.successfulSignups).toBe(1);
      expect(stats.rewardCreditsEarned).toBe(10);
      expect(stats.rewardDescription).toContain('Give $10 off Search Pass');
    });

    it('rejects self-referrals with an explicit error', async () => {
      const record = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);

      await expect(service.trackReferralSignup(record.code, REFERRER_USER_ID)).rejects.toThrow(
        /self-referrals are not permitted/i
      );
    });

    it('prevents double-attribution for the same referred user', async () => {
      const record = service.getOrCreateReferralCode(TENANT_ID, REFERRER_USER_ID);

      const first = await service.trackReferralSignup(record.code, REFERRED_USER_ID);
      expect(first).not.toBeNull();

      const second = await service.trackReferralSignup(record.code, REFERRED_USER_ID);
      expect(second).toBeNull();

      const stats = service.getReferralStats(TENANT_ID, REFERRER_USER_ID);
      expect(stats.successfulSignups).toBe(1);
      expect(stats.rewardCreditsEarned).toBe(10);
    });
  });
});

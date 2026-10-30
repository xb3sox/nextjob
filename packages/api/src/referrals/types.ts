export interface ReferralCodeRecord {
  code: string;
  referrerUserId: string;
  tenantId: string;
  referralUrl: string;
  clicks: number;
  signups: number;
  rewardCredits: number;
  createdAt: string;
}

export type ReferralStatus = 'pending' | 'qualified' | 'rewarded';

export interface ReferralConversionRecord {
  id: string;
  code: string;
  referrerUserId: string;
  referredUserId: string;
  status: ReferralStatus;
  createdAt: string;
  rewardValue: number;
}

export interface ReferralStats {
  code: string;
  referralUrl: string;
  clicks: number;
  successfulSignups: number;
  rewardCreditsEarned: number;
  rewardDescription: string;
}

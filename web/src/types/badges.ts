// Badge types and verification criteria

export type BadgeType = 
  | 'verified_agent'
  | 'elite_score'
  | 'trusted_partner'
  | 'early_adopter'
  | '10_streak'
  | 'century_club'
  | 'high_volume'
  | 'whale'
  | 'fast_payer'
  | 'perfect_balance';

export type BadgeStyle = 'minimal' | 'standard' | 'full';
export type BadgeTheme = 'dark' | 'light';

export interface VerificationBadge {
  type: BadgeType;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  criteria: string;
}

export interface VerificationCriteria {
  verifiedAgent: {
    minScore: number;
    minTransactions: number;
    registeredForDays: number;
  };
  eliteScore: {
    minScore: number;
  };
  trustedPartner: {
    minScore: number;
    minTransactions: number;
    minVolume: number;
  };
  earlyAdopter: {
    registeredBefore: number; // timestamp
  };
}

export const VERIFICATION_CRITERIA: VerificationCriteria = {
  verifiedAgent: {
    minScore: 500,
    minTransactions: 5,
    registeredForDays: 7,
  },
  eliteScore: {
    minScore: 750,
  },
  trustedPartner: {
    minScore: 650,
    minTransactions: 25,
    minVolume: 50000,
  },
  earlyAdopter: {
    registeredBefore: new Date('2026-03-01').getTime() / 1000, // March 1, 2026
  },
};

export interface WidgetConfig {
  address: string;
  style: BadgeStyle;
  theme: BadgeTheme;
  showBadges: boolean;
  showLink: boolean;
}

export interface BadgeData {
  address: string;
  score: number;
  tier: string;
  transactions: number;
  registered: number; // timestamp
  lifetimeVolume: number;
  badges: VerificationBadge[];
}

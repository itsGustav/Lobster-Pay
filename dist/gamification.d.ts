/**
 * Pay Lobster Gamification Module
 * Streaks, badges, achievements, and leaderboards 🦞
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    emoji: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    unlockedAt?: string;
}
export interface PlayerStats {
    address: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    totalVolume: string;
    totalTransactions: number;
    badges: Badge[];
    points: number;
    level: number;
    largestSingleTx: string;
    mostRecipients: number;
    firstTxDate: string;
    lastTxDate: string;
}
export interface GamificationData {
    players: Record<string, PlayerStats>;
    globalStats: {
        totalPlayers: number;
        totalBadgesAwarded: number;
        topStreak: {
            address: string;
            streak: number;
        };
    };
}
/**
 * Record activity and update streaks/badges
 */
export declare function recordActivity(address: string, type: 'transfer' | 'escrow' | 'tip' | 'split', amount: string, metadata?: {
    recipients?: number;
    isTip?: boolean;
}): {
    newBadges: Badge[];
    pointsEarned: number;
};
/**
 * Get player profile
 */
export declare function getPlayerProfile(address: string): PlayerStats | null;
/**
 * Get leaderboard
 */
export declare function getLeaderboard(type?: 'volume' | 'streak' | 'level' | 'badges', limit?: number): Array<{
    rank: number;
    address: string;
    value: string | number;
    level: number;
    badges: number;
}>;
/**
 * Format player profile for display
 */
export declare function formatProfile(player: PlayerStats): string;
/**
 * Format streak info
 */
export declare function formatStreak(player: PlayerStats): string;
/**
 * Get all available badges
 */
export declare function getAllBadges(): Badge[];
export declare const gamification: {
    recordActivity: typeof recordActivity;
    getProfile: typeof getPlayerProfile;
    getLeaderboard: typeof getLeaderboard;
    formatProfile: typeof formatProfile;
    formatStreak: typeof formatStreak;
    getAllBadges: typeof getAllBadges;
};
//# sourceMappingURL=gamification.d.ts.map
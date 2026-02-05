/**
 * Pay Lobster Gamification Module
 * Streaks, badges, achievements, and leaderboards 🦞
 */

import * as fs from 'fs';
import * as path from 'path';
import { stats } from './stats';

const GAME_FILE = path.join(process.env.HOME || '/tmp', '.paylobster', 'gamification.json');

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
  
  // Streaks
  currentStreak: number;        // Consecutive days with transactions
  longestStreak: number;
  lastActivityDate: string;     // YYYY-MM-DD
  
  // Volume milestones
  totalVolume: string;
  totalTransactions: number;
  
  // Achievements
  badges: Badge[];
  points: number;
  level: number;
  
  // Records
  largestSingleTx: string;
  mostRecipients: number;       // Largest split
  
  // Timestamps
  firstTxDate: string;
  lastTxDate: string;
}

export interface GamificationData {
  players: Record<string, PlayerStats>;
  globalStats: {
    totalPlayers: number;
    totalBadgesAwarded: number;
    topStreak: { address: string; streak: number };
  };
}

// Badge definitions
const BADGES: Record<string, Omit<Badge, 'unlockedAt'>> = {
  // Volume badges
  first_tx: { id: 'first_tx', name: 'First Steps', description: 'Made your first transaction', emoji: '🐣', tier: 'bronze' },
  volume_100: { id: 'volume_100', name: 'Centurion', description: 'Moved $100 through Pay Lobster', emoji: '💯', tier: 'bronze' },
  volume_1k: { id: 'volume_1k', name: 'Thousandaire', description: 'Moved $1,000 through Pay Lobster', emoji: '🎯', tier: 'silver' },
  volume_10k: { id: 'volume_10k', name: 'Big Spender', description: 'Moved $10,000 through Pay Lobster', emoji: '💎', tier: 'gold' },
  volume_100k: { id: 'volume_100k', name: 'Whale', description: 'Moved $100,000 through Pay Lobster', emoji: '🐋', tier: 'platinum' },
  volume_1m: { id: 'volume_1m', name: 'Lobster King', description: 'Moved $1,000,000 through Pay Lobster', emoji: '👑', tier: 'diamond' },
  
  // Transaction count badges
  tx_10: { id: 'tx_10', name: 'Regular', description: '10 transactions', emoji: '🔄', tier: 'bronze' },
  tx_50: { id: 'tx_50', name: 'Active Agent', description: '50 transactions', emoji: '⚡', tier: 'silver' },
  tx_100: { id: 'tx_100', name: 'Power User', description: '100 transactions', emoji: '🚀', tier: 'gold' },
  tx_500: { id: 'tx_500', name: 'Transaction Machine', description: '500 transactions', emoji: '🤖', tier: 'platinum' },
  
  // Streak badges
  streak_7: { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', emoji: '🔥', tier: 'bronze' },
  streak_30: { id: 'streak_30', name: 'Monthly Master', description: '30-day streak', emoji: '🌟', tier: 'silver' },
  streak_90: { id: 'streak_90', name: 'Quarterly Champion', description: '90-day streak', emoji: '🏆', tier: 'gold' },
  streak_365: { id: 'streak_365', name: 'Year of the Lobster', description: '365-day streak', emoji: '🦞', tier: 'diamond' },
  
  // Special badges
  early_adopter: { id: 'early_adopter', name: 'Early Adopter', description: 'Used Pay Lobster in beta', emoji: '🌅', tier: 'gold' },
  split_master: { id: 'split_master', name: 'Split Master', description: 'Split payment to 10+ recipients', emoji: '✂️', tier: 'silver' },
  escrow_pro: { id: 'escrow_pro', name: 'Escrow Pro', description: 'Completed 10 escrows', emoji: '🔐', tier: 'silver' },
  tipper: { id: 'tipper', name: 'Generous Tipper', description: 'Tipped 20+ times', emoji: '🎁', tier: 'bronze' },
  big_tip: { id: 'big_tip', name: 'Big Tipper', description: 'Single tip over $100', emoji: '💰', tier: 'silver' },
};

// Level thresholds (points needed)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000
];

function loadGameData(): GamificationData {
  try {
    if (fs.existsSync(GAME_FILE)) {
      return JSON.parse(fs.readFileSync(GAME_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {
    players: {},
    globalStats: {
      totalPlayers: 0,
      totalBadgesAwarded: 0,
      topStreak: { address: '', streak: 0 },
    },
  };
}

function saveGameData(data: GamificationData): void {
  const dir = path.dirname(GAME_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(GAME_FILE, JSON.stringify(data, null, 2));
}

function getDefaultPlayerStats(address: string): PlayerStats {
  const today = new Date().toISOString().split('T')[0];
  return {
    address: address.toLowerCase(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalVolume: '0',
    totalTransactions: 0,
    badges: [],
    points: 0,
    level: 1,
    largestSingleTx: '0',
    mostRecipients: 0,
    firstTxDate: today,
    lastTxDate: today,
  };
}

function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * Record activity and update streaks/badges
 */
export function recordActivity(
  address: string,
  type: 'transfer' | 'escrow' | 'tip' | 'split',
  amount: string,
  metadata?: { recipients?: number; isTip?: boolean }
): { newBadges: Badge[]; pointsEarned: number } {
  const data = loadGameData();
  const addr = address.toLowerCase();
  
  // Get or create player
  if (!data.players[addr]) {
    data.players[addr] = getDefaultPlayerStats(addr);
    data.globalStats.totalPlayers++;
  }
  
  const player = data.players[addr];
  const today = new Date().toISOString().split('T')[0];
  const amountNum = parseFloat(amount);
  const newBadges: Badge[] = [];
  let pointsEarned = 0;
  
  // Update streak
  if (player.lastActivityDate) {
    const lastDate = new Date(player.lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 1) {
      // Continue streak
      player.currentStreak++;
    } else if (diffDays > 1) {
      // Break streak
      player.currentStreak = 1;
    }
    // Same day - no change
  } else {
    player.currentStreak = 1;
  }
  
  player.lastActivityDate = today;
  player.lastTxDate = today;
  
  // Update longest streak
  if (player.currentStreak > player.longestStreak) {
    player.longestStreak = player.currentStreak;
  }
  
  // Update global top streak
  if (player.currentStreak > data.globalStats.topStreak.streak) {
    data.globalStats.topStreak = { address: addr, streak: player.currentStreak };
  }
  
  // Update stats
  player.totalVolume = (parseFloat(player.totalVolume) + amountNum).toFixed(2);
  player.totalTransactions++;
  
  if (amountNum > parseFloat(player.largestSingleTx)) {
    player.largestSingleTx = amount;
  }
  
  if (metadata?.recipients && metadata.recipients > player.mostRecipients) {
    player.mostRecipients = metadata.recipients;
  }
  
  // Calculate points
  pointsEarned = Math.floor(amountNum); // 1 point per $1
  if (type === 'tip') pointsEarned = Math.floor(pointsEarned * 1.5); // Bonus for tips
  if (type === 'escrow') pointsEarned = Math.floor(pointsEarned * 2); // Bonus for escrow
  player.points += pointsEarned;
  
  // Update level
  player.level = calculateLevel(player.points);
  
  // Check badges
  const checkBadge = (badgeId: string) => {
    if (!player.badges.find(b => b.id === badgeId) && BADGES[badgeId]) {
      const badge = { ...BADGES[badgeId], unlockedAt: new Date().toISOString() };
      player.badges.push(badge);
      newBadges.push(badge);
      data.globalStats.totalBadgesAwarded++;
      player.points += badge.tier === 'bronze' ? 10 : badge.tier === 'silver' ? 25 : badge.tier === 'gold' ? 50 : badge.tier === 'platinum' ? 100 : 250;
    }
  };
  
  // First transaction
  if (player.totalTransactions === 1) checkBadge('first_tx');
  
  // Volume badges
  const vol = parseFloat(player.totalVolume);
  if (vol >= 100) checkBadge('volume_100');
  if (vol >= 1000) checkBadge('volume_1k');
  if (vol >= 10000) checkBadge('volume_10k');
  if (vol >= 100000) checkBadge('volume_100k');
  if (vol >= 1000000) checkBadge('volume_1m');
  
  // Transaction count badges
  if (player.totalTransactions >= 10) checkBadge('tx_10');
  if (player.totalTransactions >= 50) checkBadge('tx_50');
  if (player.totalTransactions >= 100) checkBadge('tx_100');
  if (player.totalTransactions >= 500) checkBadge('tx_500');
  
  // Streak badges
  if (player.currentStreak >= 7) checkBadge('streak_7');
  if (player.currentStreak >= 30) checkBadge('streak_30');
  if (player.currentStreak >= 90) checkBadge('streak_90');
  if (player.currentStreak >= 365) checkBadge('streak_365');
  
  // Special badges
  if (metadata?.recipients && metadata.recipients >= 10) checkBadge('split_master');
  if (metadata?.isTip && amountNum >= 100) checkBadge('big_tip');
  
  saveGameData(data);
  
  return { newBadges, pointsEarned };
}

/**
 * Get player profile
 */
export function getPlayerProfile(address: string): PlayerStats | null {
  const data = loadGameData();
  return data.players[address.toLowerCase()] || null;
}

/**
 * Get leaderboard
 */
export function getLeaderboard(type: 'volume' | 'streak' | 'level' | 'badges' = 'volume', limit = 10): Array<{
  rank: number;
  address: string;
  value: string | number;
  level: number;
  badges: number;
}> {
  const data = loadGameData();
  const players = Object.values(data.players);
  
  const sorted = players.sort((a, b) => {
    switch (type) {
      case 'volume': return parseFloat(b.totalVolume) - parseFloat(a.totalVolume);
      case 'streak': return b.currentStreak - a.currentStreak;
      case 'level': return b.level - a.level;
      case 'badges': return b.badges.length - a.badges.length;
      default: return 0;
    }
  });
  
  return sorted.slice(0, limit).map((p, i) => ({
    rank: i + 1,
    address: p.address,
    value: type === 'volume' ? p.totalVolume : 
           type === 'streak' ? p.currentStreak :
           type === 'level' ? p.level : p.badges.length,
    level: p.level,
    badges: p.badges.length,
  }));
}

/**
 * Format player profile for display
 */
export function formatProfile(player: PlayerStats): string {
  const tierEmoji = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '👑' };
  
  let output = `🦞 ${player.address.slice(0, 6)}...${player.address.slice(-4)}\n\n`;
  output += `📊 Level ${player.level} • ${player.points.toLocaleString()} pts\n`;
  output += `💰 Volume: $${parseFloat(player.totalVolume).toLocaleString()}\n`;
  output += `📈 Transactions: ${player.totalTransactions}\n`;
  output += `🔥 Streak: ${player.currentStreak} days (best: ${player.longestStreak})\n\n`;
  
  output += `🏅 Badges (${player.badges.length})\n`;
  if (player.badges.length > 0) {
    const grouped: Record<string, Badge[]> = { diamond: [], platinum: [], gold: [], silver: [], bronze: [] };
    player.badges.forEach(b => grouped[b.tier].push(b));
    
    for (const tier of ['diamond', 'platinum', 'gold', 'silver', 'bronze'] as const) {
      if (grouped[tier].length > 0) {
        output += `${tierEmoji[tier]} ${grouped[tier].map(b => b.emoji).join(' ')}\n`;
      }
    }
  } else {
    output += `No badges yet. Start transacting!\n`;
  }
  
  return output;
}

/**
 * Format streak info
 */
export function formatStreak(player: PlayerStats): string {
  const flames = '🔥'.repeat(Math.min(player.currentStreak, 10));
  
  let output = `${flames}\n\n`;
  output += `🔥 Current Streak: ${player.currentStreak} days\n`;
  output += `🏆 Best Streak: ${player.longestStreak} days\n\n`;
  
  // Next milestone
  const milestones = [7, 30, 90, 365];
  const nextMilestone = milestones.find(m => m > player.currentStreak) || null;
  
  if (nextMilestone) {
    const daysLeft = nextMilestone - player.currentStreak;
    output += `📍 Next milestone: ${nextMilestone} days (${daysLeft} to go)\n`;
  } else {
    output += `🎉 You've achieved the ultimate streak badge!\n`;
  }
  
  return output;
}

/**
 * Get all available badges
 */
export function getAllBadges(): Badge[] {
  return Object.values(BADGES) as Badge[];
}

export const gamification = {
  recordActivity,
  getProfile: getPlayerProfile,
  getLeaderboard,
  formatProfile,
  formatStreak,
  getAllBadges,
};

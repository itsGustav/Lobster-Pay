/**
 * Tip Jar / Creator Economy Module
 * 
 * Enable Clawdbot operators and agents to receive USDC tips
 * via simple commands. Built for the creator economy.
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface TipJar {
  id: string;
  name: string;
  description?: string;
  
  // Owner info
  ownerId: string;        // Clawdbot session/agent ID
  ownerName: string;      // Display name
  
  // Wallet addresses by chain
  addresses: {
    chain: string;
    address: string;
    isDefault: boolean;
  }[];
  
  // Settings
  settings: {
    minTip: string;           // Minimum tip amount
    suggestedAmounts: string[]; // Quick-select amounts
    thankYouMessage?: string;  // Custom thank you message
    allowAnonymous: boolean;   // Allow anonymous tips
    notifyOnTip: boolean;      // Send notification on tip
  };
  
  // Stats
  stats: {
    totalReceived: string;
    tipCount: number;
    uniqueTippers: number;
    largestTip: string;
    lastTipAt?: string;
  };
  
  // Public link
  publicSlug?: string;      // e.g., "gustav" for tip.clawd.bot/gustav
  
  createdAt: string;
  updatedAt: string;
}

export interface Tip {
  id: string;
  tipJarId: string;
  
  // Sender
  fromAddress: string;
  fromName?: string;
  isAnonymous: boolean;
  
  // Payment
  amount: string;
  chain: string;
  txHash: string;
  
  // Message
  message?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed';
  confirmedAt?: string;
  
  createdAt: string;
}

export interface Leaderboard {
  tipJarId: string;
  period: 'all-time' | 'monthly' | 'weekly';
  entries: {
    rank: number;
    name: string;
    address: string;
    totalTipped: string;
    tipCount: number;
  }[];
  generatedAt: string;
}

const DATA_DIR = process.env.USDC_DATA_DIR || './data';

/**
 * Tip Jar Manager
 */
export class TipJarManager {
  private jarsPath: string;
  private tipsPath: string;

  constructor(dataDir = DATA_DIR) {
    this.jarsPath = path.join(dataDir, 'tip-jars.json');
    this.tipsPath = path.join(dataDir, 'tips.json');
  }

  private async loadJars(): Promise<TipJar[]> {
    try {
      const data = await fs.readFile(this.jarsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveJars(jars: TipJar[]): Promise<void> {
    await fs.mkdir(path.dirname(this.jarsPath), { recursive: true });
    await fs.writeFile(this.jarsPath, JSON.stringify(jars, null, 2));
  }

  private async loadTips(): Promise<Tip[]> {
    try {
      const data = await fs.readFile(this.tipsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveTips(tips: Tip[]): Promise<void> {
    await fs.mkdir(path.dirname(this.tipsPath), { recursive: true });
    await fs.writeFile(this.tipsPath, JSON.stringify(tips, null, 2));
  }

  // ============ Tip Jar Management ============

  /**
   * Create a new tip jar
   */
  async createJar(params: {
    ownerId: string;
    ownerName: string;
    name?: string;
    description?: string;
    addresses: { chain: string; address: string }[];
    publicSlug?: string;
    settings?: Partial<TipJar['settings']>;
  }): Promise<TipJar> {
    const jars = await this.loadJars();

    // Check for duplicate slug
    if (params.publicSlug) {
      const existing = jars.find(j => j.publicSlug === params.publicSlug);
      if (existing) {
        throw new Error(`Slug "${params.publicSlug}" is already taken`);
      }
    }

    const jar: TipJar = {
      id: crypto.randomUUID(),
      name: params.name || `${params.ownerName}'s Tip Jar`,
      description: params.description,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      addresses: params.addresses.map((a, i) => ({
        ...a,
        isDefault: i === 0,
      })),
      settings: {
        minTip: params.settings?.minTip || '1',
        suggestedAmounts: params.settings?.suggestedAmounts || ['5', '10', '25', '50'],
        thankYouMessage: params.settings?.thankYouMessage || 'Thanks for the tip! 🙏',
        allowAnonymous: params.settings?.allowAnonymous ?? true,
        notifyOnTip: params.settings?.notifyOnTip ?? true,
      },
      stats: {
        totalReceived: '0',
        tipCount: 0,
        uniqueTippers: 0,
        largestTip: '0',
      },
      publicSlug: params.publicSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jars.push(jar);
    await this.saveJars(jars);
    
    return jar;
  }

  /**
   * Get tip jar by ID, slug, or owner
   */
  async getJar(identifier: string): Promise<TipJar | null> {
    const jars = await this.loadJars();
    return jars.find(j => 
      j.id === identifier || 
      j.publicSlug === identifier ||
      j.ownerId === identifier
    ) || null;
  }

  /**
   * Update tip jar settings
   */
  async updateJar(
    id: string, 
    updates: Partial<Pick<TipJar, 'name' | 'description' | 'settings' | 'publicSlug'>>
  ): Promise<TipJar | null> {
    const jars = await this.loadJars();
    const jar = jars.find(j => j.id === id);
    
    if (jar) {
      if (updates.name) jar.name = updates.name;
      if (updates.description !== undefined) jar.description = updates.description;
      if (updates.publicSlug !== undefined) {
        // Check for duplicate
        if (updates.publicSlug && jars.some(j => j.id !== id && j.publicSlug === updates.publicSlug)) {
          throw new Error(`Slug "${updates.publicSlug}" is already taken`);
        }
        jar.publicSlug = updates.publicSlug;
      }
      if (updates.settings) {
        jar.settings = { ...jar.settings, ...updates.settings };
      }
      jar.updatedAt = new Date().toISOString();
      await this.saveJars(jars);
    }
    
    return jar || null;
  }

  /**
   * Add address to tip jar
   */
  async addAddress(jarId: string, chain: string, address: string): Promise<TipJar | null> {
    const jars = await this.loadJars();
    const jar = jars.find(j => j.id === jarId);
    
    if (jar) {
      if (jar.addresses.some(a => a.chain === chain)) {
        throw new Error(`Address for ${chain} already exists`);
      }
      jar.addresses.push({ chain, address, isDefault: false });
      jar.updatedAt = new Date().toISOString();
      await this.saveJars(jars);
    }
    
    return jar || null;
  }

  /**
   * Set default address
   */
  async setDefaultAddress(jarId: string, chain: string): Promise<TipJar | null> {
    const jars = await this.loadJars();
    const jar = jars.find(j => j.id === jarId);
    
    if (jar) {
      jar.addresses.forEach(a => {
        a.isDefault = a.chain === chain;
      });
      jar.updatedAt = new Date().toISOString();
      await this.saveJars(jars);
    }
    
    return jar || null;
  }

  // ============ Tip Processing ============

  /**
   * Record a tip
   */
  async recordTip(params: {
    tipJarId: string;
    fromAddress: string;
    fromName?: string;
    isAnonymous?: boolean;
    amount: string;
    chain: string;
    txHash: string;
    message?: string;
  }): Promise<Tip> {
    const jars = await this.loadJars();
    const jar = jars.find(j => j.id === params.tipJarId);
    
    if (!jar) {
      throw new Error('Tip jar not found');
    }

    const tips = await this.loadTips();

    const tip: Tip = {
      id: crypto.randomUUID(),
      tipJarId: params.tipJarId,
      fromAddress: params.fromAddress,
      fromName: params.fromName,
      isAnonymous: params.isAnonymous ?? false,
      amount: params.amount,
      chain: params.chain,
      txHash: params.txHash,
      message: params.message,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    tips.push(tip);
    await this.saveTips(tips);

    // Update jar stats
    const amount = parseFloat(params.amount);
    jar.stats.totalReceived = (parseFloat(jar.stats.totalReceived) + amount).toString();
    jar.stats.tipCount++;
    
    // Check if new unique tipper
    const previousTips = tips.filter(t => 
      t.tipJarId === jar.id && 
      t.fromAddress.toLowerCase() === params.fromAddress.toLowerCase() &&
      t.id !== tip.id
    );
    if (previousTips.length === 0) {
      jar.stats.uniqueTippers++;
    }
    
    // Update largest tip
    if (amount > parseFloat(jar.stats.largestTip)) {
      jar.stats.largestTip = params.amount;
    }
    
    jar.stats.lastTipAt = new Date().toISOString();
    jar.updatedAt = new Date().toISOString();
    await this.saveJars(jars);

    return tip;
  }

  /**
   * Get tips for a jar
   */
  async getTips(jarId: string, options?: {
    limit?: number;
    includeAnonymous?: boolean;
  }): Promise<Tip[]> {
    let tips = await this.loadTips();
    tips = tips.filter(t => t.tipJarId === jarId);
    
    if (options?.includeAnonymous === false) {
      tips = tips.filter(t => !t.isAnonymous);
    }
    
    tips.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (options?.limit) {
      tips = tips.slice(0, options.limit);
    }
    
    return tips;
  }

  /**
   * Get recent tips across all jars (for activity feed)
   */
  async getRecentTips(limit = 10): Promise<(Tip & { jarName: string })[]> {
    const tips = await this.loadTips();
    const jars = await this.loadJars();
    
    const jarMap = new Map(jars.map(j => [j.id, j]));
    
    return tips
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(tip => ({
        ...tip,
        jarName: jarMap.get(tip.tipJarId)?.name || 'Unknown',
      }));
  }

  // ============ Leaderboards ============

  /**
   * Generate leaderboard for a tip jar
   */
  async getLeaderboard(jarId: string, period: Leaderboard['period'] = 'all-time'): Promise<Leaderboard> {
    let tips = await this.loadTips();
    tips = tips.filter(t => t.tipJarId === jarId && !t.isAnonymous);
    
    // Filter by period
    const now = new Date();
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      tips = tips.filter(t => new Date(t.createdAt) >= weekAgo);
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      tips = tips.filter(t => new Date(t.createdAt) >= monthAgo);
    }

    // Aggregate by tipper
    const tipperMap = new Map<string, { name: string; total: number; count: number }>();
    
    for (const tip of tips) {
      const key = tip.fromAddress.toLowerCase();
      const existing = tipperMap.get(key) || { 
        name: tip.fromName || this.shortAddress(tip.fromAddress), 
        total: 0, 
        count: 0 
      };
      existing.total += parseFloat(tip.amount);
      existing.count++;
      if (tip.fromName) existing.name = tip.fromName;
      tipperMap.set(key, existing);
    }

    // Sort and rank
    const entries = Array.from(tipperMap.entries())
      .map(([address, data]) => ({
        address,
        name: data.name,
        totalTipped: data.total.toFixed(2),
        tipCount: data.count,
      }))
      .sort((a, b) => parseFloat(b.totalTipped) - parseFloat(a.totalTipped))
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    return {
      tipJarId: jarId,
      period,
      entries,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============ Tip Commands (for Clawdbot) ============

  /**
   * Parse tip command and return tip info
   * Supports: "tip @gustav 10", "tip 5 to gustav", etc.
   */
  parseTipCommand(command: string): {
    recipient: string;
    amount: string;
    message?: string;
  } | null {
    // Patterns:
    // "tip @gustav 10"
    // "tip 10 to @gustav"
    // "tip gustav 10 usdc thanks!"
    
    const patterns = [
      // tip @recipient amount [message]
      /^tip\s+@?(\w+)\s+(\d+(?:\.\d+)?)\s*(?:usdc)?\s*(.*)$/i,
      // tip amount to @recipient [message]
      /^tip\s+(\d+(?:\.\d+)?)\s*(?:usdc)?\s+to\s+@?(\w+)\s*(.*)$/i,
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          return {
            recipient: match[1],
            amount: match[2],
            message: match[3]?.trim() || undefined,
          };
        } else {
          return {
            recipient: match[2],
            amount: match[1],
            message: match[3]?.trim() || undefined,
          };
        }
      }
    }

    return null;
  }

  /**
   * Generate tip jar card/embed for display
   */
  formatTipJarCard(jar: TipJar): string {
    const defaultAddr = jar.addresses.find(a => a.isDefault) || jar.addresses[0];
    
    let card = `💰 **${jar.name}**\n`;
    if (jar.description) {
      card += `${jar.description}\n`;
    }
    card += `\n`;
    card += `Owner: ${jar.ownerName}\n`;
    card += `Total Received: **$${parseFloat(jar.stats.totalReceived).toFixed(2)} USDC**\n`;
    card += `Tips: ${jar.stats.tipCount} from ${jar.stats.uniqueTippers} tippers\n`;
    card += `\n`;
    card += `**Quick Tip:**\n`;
    card += jar.settings.suggestedAmounts.map(a => `[$${a}]`).join(' ') + '\n';
    card += `\n`;
    card += `Send to: \`${defaultAddr.address}\`\n`;
    card += `Chain: ${defaultAddr.chain}\n`;
    
    if (jar.publicSlug) {
      card += `\nLink: tip.clawd.bot/${jar.publicSlug}`;
    }
    
    return card;
  }

  /**
   * Format tip notification
   */
  formatTipNotification(tip: Tip, jar: TipJar): string {
    const senderName = tip.isAnonymous ? 'Anonymous' : (tip.fromName || this.shortAddress(tip.fromAddress));
    
    let notif = `🎉 **New Tip!**\n\n`;
    notif += `${senderName} tipped **$${tip.amount} USDC**`;
    
    if (tip.message) {
      notif += `\n\n"${tip.message}"`;
    }
    
    notif += `\n\n${jar.settings.thankYouMessage}`;
    
    return notif;
  }

  private shortAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // ============ Agent-to-Agent Tips ============

  /**
   * Send tip from one agent to another
   * Returns the transaction to be executed
   */
  async prepareAgentTip(params: {
    fromAgentId: string;
    fromWalletId: string;
    toAgentId: string;
    amount: string;
    message?: string;
  }): Promise<{
    toJar: TipJar;
    toAddress: string;
    chain: string;
    amount: string;
    message?: string;
  } | null> {
    // Find recipient's tip jar
    const toJar = await this.getJar(params.toAgentId);
    if (!toJar) {
      return null;
    }

    const defaultAddr = toJar.addresses.find(a => a.isDefault) || toJar.addresses[0];
    if (!defaultAddr) {
      return null;
    }

    return {
      toJar,
      toAddress: defaultAddr.address,
      chain: defaultAddr.chain,
      amount: params.amount,
      message: params.message,
    };
  }
}

export default TipJarManager;

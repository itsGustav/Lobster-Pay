import { VERIFICATION_CRITERIA, type VerificationBadge, type BadgeType, type BadgeData } from '@/types/badges';

export function checkVerificationBadges(
  score: number,
  transactions: number,
  lifetimeVolume: number,
  registeredTimestamp: number
): VerificationBadge[] {
  const now = Math.floor(Date.now() / 1000);
  const accountAgeDays = Math.floor((now - registeredTimestamp) / 86400);
  
  const badges: VerificationBadge[] = [];

  // Verified Agent
  const verifiedCriteria = VERIFICATION_CRITERIA.verifiedAgent;
  badges.push({
    type: 'verified_agent',
    icon: '✓',
    name: 'Verified Agent',
    description: 'Established account with proven track record',
    criteria: `Score ${verifiedCriteria.minScore}+, ${verifiedCriteria.minTransactions}+ transactions, ${verifiedCriteria.registeredForDays}+ days`,
    earned: 
      score >= verifiedCriteria.minScore &&
      transactions >= verifiedCriteria.minTransactions &&
      accountAgeDays >= verifiedCriteria.registeredForDays,
  });

  // Elite Score
  const eliteCriteria = VERIFICATION_CRITERIA.eliteScore;
  badges.push({
    type: 'elite_score',
    icon: '🏆',
    name: 'Elite Score',
    description: 'Top-tier LOBSTER score',
    criteria: `Score ${eliteCriteria.minScore}+`,
    earned: score >= eliteCriteria.minScore,
  });

  // Trusted Partner
  const trustedCriteria = VERIFICATION_CRITERIA.trustedPartner;
  badges.push({
    type: 'trusted_partner',
    icon: '🤝',
    name: 'Trusted Partner',
    description: 'High-volume trusted agent',
    criteria: `Score ${trustedCriteria.minScore}+, ${trustedCriteria.minTransactions}+ transactions, $${(trustedCriteria.minVolume / 1000).toFixed(0)}K+ volume`,
    earned: 
      score >= trustedCriteria.minScore &&
      transactions >= trustedCriteria.minTransactions &&
      lifetimeVolume >= trustedCriteria.minVolume,
  });

  // Early Adopter
  const earlyAdopterCriteria = VERIFICATION_CRITERIA.earlyAdopter;
  badges.push({
    type: 'early_adopter',
    icon: '🌟',
    name: 'Early Adopter',
    description: 'Joined Pay Lobster in the early days',
    criteria: `Registered before ${new Date(earlyAdopterCriteria.registeredBefore * 1000).toLocaleDateString()}`,
    earned: registeredTimestamp <= earlyAdopterCriteria.registeredBefore,
  });

  // Performance badges
  if (transactions >= 10) {
    badges.push({
      type: '10_streak',
      icon: '🔥',
      name: '10-Streak',
      description: '10+ successful transactions',
      criteria: '10+ transactions',
      earned: true,
    });
  }

  if (transactions >= 50) {
    badges.push({
      type: 'century_club',
      icon: '💯',
      name: 'Century Club',
      description: '50+ successful transactions',
      criteria: '50+ transactions',
      earned: true,
    });
  }

  if (lifetimeVolume >= 10000) {
    badges.push({
      type: 'high_volume',
      icon: '💎',
      name: 'High Volume',
      description: '$10,000+ in transactions',
      criteria: '$10,000+ volume',
      earned: true,
    });
  }

  if (lifetimeVolume >= 100000) {
    badges.push({
      type: 'whale',
      icon: '👑',
      name: 'Whale',
      description: '$100,000+ in transactions',
      criteria: '$100,000+ volume',
      earned: true,
    });
  }

  return badges;
}

export function getEarnedBadges(badges: VerificationBadge[]): VerificationBadge[] {
  return badges.filter(b => b.earned);
}

export function formatBadgeForEmbed(badge: VerificationBadge): string {
  return `${badge.icon} ${badge.name}`;
}

export function generateWidgetHTML(
  data: BadgeData,
  style: 'minimal' | 'standard' | 'full',
  theme: 'dark' | 'light',
  showBadges: boolean,
  showLink: boolean
): string {
  const earnedBadges = getEarnedBadges(data.badges);
  const tierColors: Record<string, string> = {
    ELITE: '#FFD700',
    EXCELLENT: '#4CAF50',
    GOOD: '#2196F3',
    FAIR: '#FF9800',
    POOR: '#9E9E9E',
  };

  const bgColor = theme === 'dark' ? '#111827' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111827';
  const mutedColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const borderColor = theme === 'dark' ? '#1F2937' : '#E5E7EB';
  const tierColor = tierColors[data.tier] || tierColors.POOR;

  if (style === 'minimal') {
    return `
<div style="
  background: ${bgColor};
  border: 2px solid ${borderColor};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  max-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
">
  <div style="color: ${mutedColor}; font-size: 14px; margin-bottom: 8px;">
    🦞 LOBSTER
  </div>
  <div style="font-size: 32px; font-weight: bold; color: ${textColor};">
    ${data.score}
  </div>
  <div style="font-size: 12px; color: ${tierColor}; margin-top: 8px; font-weight: 600;">
    ${data.tier}
  </div>
</div>`.trim();
  }

  if (style === 'standard') {
    return `
<div style="
  background: ${bgColor};
  border: 2px solid ${borderColor};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  max-width: 280px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
">
  <div style="color: ${mutedColor}; font-size: 16px; margin-bottom: 12px;">
    🦞 LOBSTER Score
  </div>
  <div style="font-size: 48px; font-weight: bold; color: ${textColor};">
    ${data.score}
  </div>
  <div style="font-size: 16px; color: ${tierColor}; margin: 12px 0; font-weight: 600;">
    ★ ${data.tier} ★
  </div>
  ${showBadges && earnedBadges.length > 0 ? `
  <div style="display: flex; justify-content: center; gap: 8px; margin: 12px 0; font-size: 20px;">
    ${earnedBadges.slice(0, 4).map(b => b.icon).join(' ')}
  </div>` : ''}
  ${showLink ? `
  <a href="https://paylobster.com/agent/${data.address}" 
     style="color: #3B82F6; font-size: 14px; text-decoration: none; display: inline-block; margin-top: 8px;"
     target="_blank" rel="noopener">
    Verify on Pay Lobster →
  </a>` : ''}
</div>`.trim();
  }

  // Full style
  return `
<div style="
  background: ${bgColor};
  border: 2px solid ${borderColor};
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
">
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="color: ${mutedColor}; font-size: 14px; margin-bottom: 8px;">
      🦞 LOBSTER Score
    </div>
    <div style="font-size: 56px; font-weight: bold; color: ${textColor};">
      ${data.score}
    </div>
    <div style="font-size: 18px; color: ${tierColor}; margin-top: 8px; font-weight: 600;">
      ★ ${data.tier} ★
    </div>
  </div>
  
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid ${borderColor};
    border-bottom: 1px solid ${borderColor};
  ">
    <div style="text-align: center;">
      <div style="color: ${mutedColor}; font-size: 12px; margin-bottom: 4px;">Transactions</div>
      <div style="color: ${textColor}; font-size: 20px; font-weight: bold;">${data.transactions}</div>
    </div>
    <div style="text-align: center;">
      <div style="color: ${mutedColor}; font-size: 12px; margin-bottom: 4px;">Volume</div>
      <div style="color: ${textColor}; font-size: 20px; font-weight: bold;">$${(data.lifetimeVolume / 1000).toFixed(0)}K</div>
    </div>
  </div>
  
  ${showBadges && earnedBadges.length > 0 ? `
  <div style="margin-top: 16px;">
    <div style="color: ${mutedColor}; font-size: 12px; margin-bottom: 8px; font-weight: 600;">VERIFIED BADGES</div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      ${earnedBadges.slice(0, 6).map(badge => `
        <div style="
          background: ${theme === 'dark' ? '#1F2937' : '#F3F4F6'};
          border: 1px solid ${borderColor};
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          color: ${textColor};
          display: flex;
          align-items: center;
          gap: 4px;
        " title="${badge.description}">
          <span>${badge.icon}</span>
          <span>${badge.name}</span>
        </div>
      `).join('')}
    </div>
  </div>` : ''}
  
  ${showLink ? `
  <a href="https://paylobster.com/agent/${data.address}" 
     style="
       display: block;
       text-align: center;
       color: #3B82F6;
       font-size: 14px;
       text-decoration: none;
       margin-top: 16px;
       font-weight: 500;
     "
     target="_blank" rel="noopener">
    View Full Profile on Pay Lobster →
  </a>` : ''}
</div>`.trim();
}

export function generateWidgetScript(address: string, style: string, theme: string, showBadges: boolean, showLink: boolean): string {
  const params = new URLSearchParams({
    style,
    theme,
    showBadges: showBadges.toString(),
    showLink: showLink.toString(),
  });

  return `
<!-- Pay Lobster Trust Widget -->
<div id="paylobster-widget-${address}" data-address="${address}"></div>
<script>
(function() {
  const widgetId = 'paylobster-widget-${address}';
  const container = document.getElementById(widgetId);
  if (!container) return;
  
  const address = container.dataset.address;
  const apiUrl = 'https://paylobster.com/api/widget/' + address + '?${params.toString()}';
  
  fetch(apiUrl)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
    })
    .catch(err => {
      console.error('Failed to load Pay Lobster widget:', err);
      container.innerHTML = '<div style="color: #9CA3AF; font-size: 14px;">Failed to load widget</div>';
    });
})();
</script>
`.trim();
}

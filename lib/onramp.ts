/**
 * Coinbase Onramp Integration
 * Card-to-crypto payments via Coinbase Pay
 * 
 * Enables users to fund their wallets with USDC using:
 * - Debit/credit cards
 * - Apple Pay (US)
 * - Bank transfers
 * - Existing Coinbase balance
 */

import { SignJWT, importPKCS8 } from 'jose';

// CDP API credentials (from env or config)
const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID || '';
const CDP_PRIVATE_KEY = process.env.CDP_PRIVATE_KEY || '';

export interface OnrampConfig {
  /** CDP API Key ID */
  apiKeyId?: string;
  /** CDP Private Key (base64 or PEM) */
  privateKey?: string;
}

export interface OnrampSessionParams {
  /** Destination wallet address */
  destinationAddress: string;
  /** Blockchain network (default: 'base') */
  blockchain?: string;
  /** Assets to enable (default: ['USDC']) */
  assets?: string[];
  /** Client IP for security validation */
  clientIp?: string;
}

export interface OnrampUrlParams {
  /** Session token from API */
  sessionToken: string;
  /** Amount in USD */
  amount: number;
  /** Asset to purchase (default: 'USDC') */
  asset?: string;
  /** Fiat currency (default: 'USD') */
  fiatCurrency?: string;
  /** Redirect URL after completion */
  redirectUrl?: string;
}

export interface OnrampSession {
  token: string;
  channelId?: string;
}

export interface OnrampResult {
  /** URL to open Coinbase Pay */
  url: string;
  /** Session token (for tracking) */
  sessionToken: string;
  /** Amount in USD */
  amount: number;
  /** Destination address */
  destinationAddress: string;
}

/**
 * Create a CDP JWT for API authentication
 */
async function createCdpJwt(apiKeyId: string, privateKey: string): Promise<string> {
  // Convert base64 private key to PEM format if needed
  let pemKey = privateKey;
  if (!privateKey.includes('-----BEGIN')) {
    // It's base64 encoded - this is an EC private key
    pemKey = `-----BEGIN EC PRIVATE KEY-----\n${privateKey}\n-----END EC PRIVATE KEY-----`;
  }
  
  const key = await importPKCS8(pemKey, 'ES256');
  
  const jwt = await new SignJWT({})
    .setProtectedHeader({ 
      alg: 'ES256', 
      kid: apiKeyId,
      typ: 'JWT',
      nonce: crypto.randomUUID()
    })
    .setIssuedAt()
    .setExpirationTime('2m')
    .setSubject(apiKeyId)
    .setIssuer('cdp')
    .setAudience('cdp_service')
    .sign(key);
  
  return jwt;
}

/**
 * Get a session token for Coinbase Onramp
 */
export async function getOnrampSession(
  params: OnrampSessionParams,
  config?: OnrampConfig
): Promise<OnrampSession> {
  const apiKeyId = config?.apiKeyId || CDP_API_KEY_ID;
  const privateKey = config?.privateKey || CDP_PRIVATE_KEY;
  
  if (!apiKeyId || !privateKey) {
    throw new Error('CDP API credentials not configured. Set CDP_API_KEY_ID and CDP_PRIVATE_KEY environment variables.');
  }
  
  const jwt = await createCdpJwt(apiKeyId, privateKey);
  
  const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      addresses: [{
        address: params.destinationAddress,
        blockchains: [params.blockchain || 'base']
      }],
      assets: params.assets || ['USDC'],
      ...(params.clientIp && { client_ip: params.clientIp })
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get onramp session: ${error}`);
  }
  
  const data = await response.json() as { data: { token: string; channel_id?: string } };
  return {
    token: data.data.token,
    channelId: data.data.channel_id
  };
}

/**
 * Generate a Coinbase Onramp URL
 */
export function generateOnrampUrl(params: OnrampUrlParams): string {
  const baseUrl = 'https://pay.coinbase.com/buy';
  const searchParams = new URLSearchParams({
    sessionToken: params.sessionToken,
    defaultAsset: params.asset || 'USDC',
    presetFiatAmount: params.amount.toString(),
    fiatCurrency: params.fiatCurrency || 'USD',
    defaultNetwork: 'base',
  });
  
  if (params.redirectUrl) {
    searchParams.set('redirectUrl', params.redirectUrl);
  }
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Create a complete onramp flow - get session and generate URL
 * 
 * @example
 * ```typescript
 * const result = await createOnrampUrl({
 *   destinationAddress: '0x1234...',
 *   amount: 100, // $100 USD
 * });
 * console.log('Fund your wallet:', result.url);
 * ```
 */
export async function createOnrampUrl(params: {
  destinationAddress: string;
  amount: number;
  blockchain?: string;
  assets?: string[];
  fiatCurrency?: string;
  redirectUrl?: string;
  clientIp?: string;
}, config?: OnrampConfig): Promise<OnrampResult> {
  // Get session token
  const session = await getOnrampSession({
    destinationAddress: params.destinationAddress,
    blockchain: params.blockchain || 'base',
    assets: params.assets || ['USDC'],
    clientIp: params.clientIp
  }, config);
  
  // Generate URL
  const url = generateOnrampUrl({
    sessionToken: session.token,
    amount: params.amount,
    asset: params.assets?.[0] || 'USDC',
    fiatCurrency: params.fiatCurrency || 'USD',
    redirectUrl: params.redirectUrl
  });
  
  return {
    url,
    sessionToken: session.token,
    amount: params.amount,
    destinationAddress: params.destinationAddress
  };
}

/**
 * Check onramp transaction status
 */
export async function getOnrampStatus(
  partnerUserId: string,
  config?: OnrampConfig
): Promise<any> {
  const apiKeyId = config?.apiKeyId || CDP_API_KEY_ID;
  const privateKey = config?.privateKey || CDP_PRIVATE_KEY;
  
  if (!apiKeyId || !privateKey) {
    throw new Error('CDP API credentials not configured');
  }
  
  const jwt = await createCdpJwt(apiKeyId, privateKey);
  
  const response = await fetch(
    `https://api.developer.coinbase.com/onramp/v1/buy/user/${partnerUserId}/transactions`,
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get transaction status: ${error}`);
  }
  
  return response.json();
}

/**
 * Onramp manager for the LobsterAgent
 */
export const onramp = {
  /**
   * Generate a URL for the user to fund their wallet with a card
   * 
   * @example
   * ```typescript
   * const { url } = await onramp.fundWithCard({
   *   address: '0x1234...',
   *   amount: 50 // $50 USD
   * });
   * console.log('Click to add funds:', url);
   * ```
   */
  async fundWithCard(params: {
    address: string;
    amount: number;
    asset?: string;
    redirectUrl?: string;
  }, config?: OnrampConfig): Promise<OnrampResult> {
    return createOnrampUrl({
      destinationAddress: params.address,
      amount: params.amount,
      assets: [params.asset || 'USDC'],
      redirectUrl: params.redirectUrl
    }, config);
  },
  
  /**
   * Get a simple URL without server-side session (uses Coinbase's default flow)
   * Less secure but works without CDP credentials
   */
  getSimpleUrl(params: {
    address: string;
    amount: number;
    asset?: string;
  }): string {
    const baseUrl = 'https://pay.coinbase.com/buy/select-asset';
    const searchParams = new URLSearchParams({
      appId: 'pay-lobster',
      destinationWallets: JSON.stringify([{
        address: params.address,
        blockchains: ['base'],
        assets: [params.asset || 'USDC']
      }]),
      presetFiatAmount: params.amount.toString(),
      fiatCurrency: 'USD',
    });
    
    return `${baseUrl}?${searchParams.toString()}`;
  },
  
  /**
   * Check status of an onramp transaction
   */
  getStatus: getOnrampStatus
};

export default onramp;

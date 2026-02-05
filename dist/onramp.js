"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onramp = void 0;
exports.getOnrampSession = getOnrampSession;
exports.generateOnrampUrl = generateOnrampUrl;
exports.createOnrampUrl = createOnrampUrl;
exports.getOnrampStatus = getOnrampStatus;
const jose_1 = require("jose");
// CDP API credentials (from env or config)
const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID || '';
const CDP_PRIVATE_KEY = process.env.CDP_PRIVATE_KEY || '';
/**
 * Create a CDP JWT for API authentication
 */
async function createCdpJwt(apiKeyId, privateKey) {
    // Convert base64 private key to PEM format if needed
    let pemKey = privateKey;
    if (!privateKey.includes('-----BEGIN')) {
        // It's base64 encoded - this is an EC private key
        pemKey = `-----BEGIN EC PRIVATE KEY-----\n${privateKey}\n-----END EC PRIVATE KEY-----`;
    }
    const key = await (0, jose_1.importPKCS8)(pemKey, 'ES256');
    const jwt = await new jose_1.SignJWT({})
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
async function getOnrampSession(params, config) {
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
    const data = await response.json();
    return {
        token: data.data.token,
        channelId: data.data.channel_id
    };
}
/**
 * Generate a Coinbase Onramp URL
 */
function generateOnrampUrl(params) {
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
async function createOnrampUrl(params, config) {
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
async function getOnrampStatus(partnerUserId, config) {
    const apiKeyId = config?.apiKeyId || CDP_API_KEY_ID;
    const privateKey = config?.privateKey || CDP_PRIVATE_KEY;
    if (!apiKeyId || !privateKey) {
        throw new Error('CDP API credentials not configured');
    }
    const jwt = await createCdpJwt(apiKeyId, privateKey);
    const response = await fetch(`https://api.developer.coinbase.com/onramp/v1/buy/user/${partnerUserId}/transactions`, {
        headers: {
            'Authorization': `Bearer ${jwt}`,
        }
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get transaction status: ${error}`);
    }
    return response.json();
}
/**
 * Onramp manager for the LobsterAgent
 */
exports.onramp = {
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
    async fundWithCard(params, config) {
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
    getSimpleUrl(params) {
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
exports.default = exports.onramp;
//# sourceMappingURL=onramp.js.map
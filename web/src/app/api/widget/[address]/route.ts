import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, REPUTATION_ABI, IDENTITY_ABI, ESCROW_ABI } from '@/lib/contracts';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { PUBLIC_CORS_HEADERS, CACHE_HEADERS } from '@/lib/cors';
import { getTier } from '@/lib/agent-utils';
import { checkVerificationBadges, generateWidgetHTML } from '@/lib/badge-utils';
import { type BadgeData, type BadgeStyle, type BadgeTheme } from '@/types/badges';
import validator from 'validator';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  // Rate limiting: 200 req/min for widgets (higher than badges)
  const rateLimitResult = rateLimit(request, 'widget', 200);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          ...PUBLIC_CORS_HEADERS,
          ...getRateLimitHeaders(rateLimitResult),
        }
      }
    );
  }

  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    
    const style = (searchParams.get('style') || 'standard') as BadgeStyle;
    const theme = (searchParams.get('theme') || 'dark') as BadgeTheme;
    const showBadges = searchParams.get('showBadges') !== 'false';
    const showLink = searchParams.get('showLink') !== 'false';
    const format = searchParams.get('format') || 'html';

    // Validate parameters
    if (!['minimal', 'standard', 'full'].includes(style)) {
      return NextResponse.json(
        { error: 'Invalid style parameter. Use minimal, standard, or full.' },
        { 
          status: 400,
          headers: {
            ...PUBLIC_CORS_HEADERS,
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    if (!['dark', 'light'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme parameter. Use dark or light.' },
        { 
          status: 400,
          headers: {
            ...PUBLIC_CORS_HEADERS,
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    if (!['html', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format parameter. Use html or json.' },
        { 
          status: 400,
          headers: {
            ...PUBLIC_CORS_HEADERS,
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    // Validate address
    if (!validator.isEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { 
          status: 400,
          headers: {
            ...PUBLIC_CORS_HEADERS,
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    const walletAddress = address.toLowerCase() as Address;

    // Fetch agent data
    const [reputation, agentInfo, txCount] = await Promise.all([
      publicClient.readContract({
        address: CONTRACTS.REPUTATION,
        abi: REPUTATION_ABI,
        functionName: 'getReputation',
        args: [walletAddress],
      }),
      publicClient.readContract({
        address: CONTRACTS.IDENTITY,
        abi: IDENTITY_ABI,
        functionName: 'getAgentInfo',
        args: [walletAddress],
      }),
      publicClient.readContract({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: 'getUserTransactionCount',
        args: [walletAddress],
      }),
    ]);

    const score = Number(reputation[0]);
    const tier = getTier(score);
    const transactions = Number(txCount);
    const registered = agentInfo[2]; // boolean

    if (!registered) {
      return NextResponse.json(
        { error: 'Agent not registered' },
        { 
          status: 404,
          headers: {
            ...PUBLIC_CORS_HEADERS,
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    // Get registration timestamp
    let registeredTimestamp = Math.floor(Date.now() / 1000) - 30 * 86400; // Default: 30 days ago
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACTS.IDENTITY,
        event: {
          type: 'event',
          name: 'AgentRegistered',
          inputs: [
            { indexed: true, name: 'agent', type: 'address' },
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: false, name: 'name', type: 'string' },
          ],
        },
        args: {
          agent: walletAddress,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      if (logs.length > 0) {
        const block = await publicClient.getBlock({
          blockNumber: logs[0].blockNumber,
        });
        registeredTimestamp = Number(block.timestamp);
      }
    } catch (err) {
      console.error('[Widget API] Error fetching registration date:', err);
    }

    // Calculate lifetime volume (mock for now)
    const lifetimeVolume = transactions * 500;

    // Check verification badges
    const badges = checkVerificationBadges(
      score,
      transactions,
      lifetimeVolume,
      registeredTimestamp
    );

    const badgeData: BadgeData = {
      address: walletAddress,
      score,
      tier,
      transactions,
      registered: registeredTimestamp,
      lifetimeVolume,
      badges,
    };

    if (format === 'json') {
      return NextResponse.json(badgeData, {
        headers: {
          ...PUBLIC_CORS_HEADERS,
          ...getRateLimitHeaders(rateLimitResult),
          'Cache-Control': CACHE_HEADERS.SHORT,
        },
      });
    }

    // Generate HTML widget
    const widgetHTML = generateWidgetHTML(badgeData, style, theme, showBadges, showLink);

    return new Response(widgetHTML, {
      headers: {
        'Content-Type': 'text/html',
        ...PUBLIC_CORS_HEADERS,
        ...getRateLimitHeaders(rateLimitResult),
        'Cache-Control': CACHE_HEADERS.SHORT,
      },
    });
  } catch (error) {
    console.error('[Widget API] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'An error occurred while fetching widget data. Please try again later.' },
      { 
        status: 500,
        headers: PUBLIC_CORS_HEADERS,
      }
    );
  }
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: PUBLIC_CORS_HEADERS,
  });
}

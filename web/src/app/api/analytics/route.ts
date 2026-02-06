import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { initAdmin } from '@/lib/firebase';
import { Address } from 'viem';

export const runtime = 'nodejs';

interface AnalyticsData {
  scoreHistory: Array<{
    date: string;
    score: number;
    change: number;
    reason?: string;
  }>;
  transactionVolume: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  escrowStats: {
    total: number;
    released: number;
    disputed: number;
    successRate: number;
  };
  peerComparison: {
    userScore: number;
    userRank: number;
    totalUsers: number;
    percentile: number;
    averageScore: number;
  };
  keyMetrics: {
    currentScore: number;
    scoreChange30d: number;
    totalTransactions: number;
    totalVolume: number;
    escrowsCompleted: number;
    trustRating: number;
  };
}

// GET - Fetch user analytics
export async function GET(req: NextRequest) {
  try {
    const session = await authServer.auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address') as Address | null;
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const db = initAdmin();
    const now = new Date();
    const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // Fetch score history
    const scoreHistorySnapshot = await db
      .collection('scoreHistory')
      .where('address', '==', address.toLowerCase())
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'asc')
      .get();

    const scoreHistory = scoreHistorySnapshot.docs.map((doc, index, arr) => {
      const data = doc.data();
      const prevScore = index > 0 ? arr[index - 1].data().score : data.score;
      return {
        date: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        score: data.score || 0,
        change: data.score - prevScore,
        reason: data.reason,
      };
    });

    // Fetch transaction volume
    const transactionsSnapshot = await db
      .collection('transactions')
      .where('address', '==', address.toLowerCase())
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'asc')
      .get();

    // Group transactions by day
    const volumeByDay = new Map<string, { count: number; amount: number }>();
    transactionsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp?.toDate?.()?.toISOString()?.split('T')[0] || '';
      const current = volumeByDay.get(date) || { count: 0, amount: 0 };
      volumeByDay.set(date, {
        count: current.count + 1,
        amount: current.amount + (data.amount || 0),
      });
    });

    const transactionVolume = Array.from(volumeByDay.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Fetch escrow stats
    const escrowsSnapshot = await db
      .collection('escrows')
      .where('participants', 'array-contains', address.toLowerCase())
      .get();

    let escrowTotal = 0;
    let escrowReleased = 0;
    let escrowDisputed = 0;

    escrowsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      escrowTotal++;
      if (data.status === 'released') escrowReleased++;
      if (data.status === 'disputed') escrowDisputed++;
    });

    const escrowStats = {
      total: escrowTotal,
      released: escrowReleased,
      disputed: escrowDisputed,
      successRate: escrowTotal > 0 ? (escrowReleased / escrowTotal) * 100 : 0,
    };

    // Fetch peer comparison data
    const allScoresSnapshot = await db
      .collection('creditScores')
      .orderBy('score', 'desc')
      .get();

    const allScores = allScoresSnapshot.docs.map((doc) => ({
      address: doc.id,
      score: doc.data().score || 0,
    }));

    const userScoreData = allScores.find(
      (s) => s.address.toLowerCase() === address.toLowerCase()
    );
    const userScore = userScoreData?.score || 0;
    const userRank = allScores.findIndex(
      (s) => s.address.toLowerCase() === address.toLowerCase()
    ) + 1;
    const totalUsers = allScores.length;
    const percentile = totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0;
    const averageScore = allScores.reduce((sum, s) => sum + s.score, 0) / totalUsers || 0;

    const peerComparison = {
      userScore,
      userRank,
      totalUsers,
      percentile,
      averageScore,
    };

    // Calculate key metrics
    const currentScore = userScore;
    const scoreChange30d = scoreHistory.length > 0 
      ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score 
      : 0;
    const totalTransactions = transactionsSnapshot.size;
    const totalVolume = transactionsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    const keyMetrics = {
      currentScore,
      scoreChange30d,
      totalTransactions,
      totalVolume,
      escrowsCompleted: escrowReleased,
      trustRating: escrowStats.successRate,
    };

    const analytics: AnalyticsData = {
      scoreHistory,
      transactionVolume,
      escrowStats,
      peerComparison,
      keyMetrics,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

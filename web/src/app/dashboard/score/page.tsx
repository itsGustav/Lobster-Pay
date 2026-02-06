"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { Card } from "@/components/ui/Card";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { BottomNav } from "@/components/ui/BottomNav";
import { ScoreHistory } from "@/components/ScoreHistory";
import { PeerComparison } from "@/components/PeerComparison";
import { Milestones } from "@/components/Milestones";
import { CONTRACTS, CREDIT_ABI, CHAIN_ID } from "@/lib/contracts";
import { motion } from "framer-motion";

export default function ScorePage() {
  const { address, isConnected } = useAccount();

  // Get user's credit score
  const { 
    data: creditScore, 
    isLoading: isLoadingScore 
  } = useReadContract({
    address: CONTRACTS.CREDIT,
    abi: CREDIT_ABI,
    functionName: 'getCreditScore',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
  });

  const score = Number(creditScore || 0);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your trust score</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-16 md:py-24 px-4 md:px-8 pb-24 md:pb-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-50 transition text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">LOBSTER Score Details</h1>
          <p className="text-gray-400">Your trust score and reputation metrics</p>
        </motion.div>

        {/* Score Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 text-center">
            {isLoadingScore ? (
              <div className="animate-pulse">
                <div className="h-40 bg-gray-800 rounded-full w-40 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-32 mx-auto"></div>
              </div>
            ) : (
              <ScoreGauge score={score} maxScore={1000} label="LOBSTER Score" size="lg" animate />
            )}
          </Card>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">What Affects Your Score</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold mb-2">Transaction History</h3>
              <p className="text-sm text-gray-400">
                Successfully completed transactions increase your score. More transactions = higher trust.
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Escrow Reliability</h3>
              <p className="text-sm text-gray-400">
                Creating and completing escrows on time builds your reputation.
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-bold mb-2">Account Age</h3>
              <p className="text-sm text-gray-400">
                Longer active history on the platform contributes to your score.
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Volume</h3>
              <p className="text-sm text-gray-400">
                Higher transaction volumes demonstrate more active participation.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Score Analytics */}
        {address && score > 0 && (
          <>
            <motion.div
              className="grid lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="lg:col-span-2">
                <ScoreHistory address={address} />
              </div>
              <div>
                <PeerComparison address={address} score={score} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Milestones address={address} />
            </motion.div>
          </>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-orange-900 bg-orange-950/20">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-bold mb-2">Tips to Improve Your Score</h3>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Complete escrows on time</li>
                  <li>• Maintain consistent transaction activity</li>
                  <li>• Build a positive transaction history</li>
                  <li>• Avoid disputes and late releases</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}

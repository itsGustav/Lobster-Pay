"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BottomNav } from "@/components/ui/BottomNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const {
    transactions,
    isLoading,
    error,
  } = useUserTransactions(address, 50);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">📜</div>
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view transaction history</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-16 md:py-24 px-4 md:px-8 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-50 transition text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
              <p className="text-gray-400">View all your transactions</p>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        {isLoading ? (
          <Card className="p-0">
            <div className="divide-y divide-gray-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="h-5 bg-gray-800 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error Loading Transactions</h3>
            <p className="text-gray-400 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No transactions yet"
            description="Your transaction history will appear here once you start using Pay Lobster."
            action={{
              label: "Send USDC",
              href: "/dashboard/send",
            }}
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-gray-800">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-900/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {tx.type}
                      {tx.status && (
                        <Badge 
                          variant={
                            tx.status === 'Completed' 
                              ? 'success' 
                              : tx.status === 'Pending' 
                              ? 'warning' 
                              : 'default'
                          }
                        >
                          {tx.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {tx.from && (
                        <span>
                          From {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </span>
                      )}
                      {tx.to && (
                        <span>
                          {' → '}To {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(tx.timestamp)}
                    </div>
                  </div>
                  <div 
                    className={`text-lg font-bold ${
                      tx.amount > 0 ? 'text-green-500' : 'text-gray-50'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {Math.abs(tx.amount).toFixed(2)} USDC
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}

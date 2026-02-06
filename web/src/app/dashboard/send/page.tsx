"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { CONTRACTS, USDC_ABI } from "@/lib/contracts";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";

// Recent recipients - could be fetched from local storage or blockchain
const RECENT_RECIPIENTS = [
  { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" as const, label: "Alice" },
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const, label: "Bob" },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function SendPage() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Trigger confetti on success
  useEffect(() => {
    if (isSuccess && !hasShownConfetti) {
      haptics.success();
      
      // Fire confetti from multiple angles
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#ea580c", "#f97316", "#fb923c"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#ea580c", "#f97316", "#fb923c"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      setHasShownConfetti(true);
    }
  }, [isSuccess, hasShownConfetti]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !isAddress(recipient)) return;

    try {
      writeContract({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, parseUnits(amount, 6)],
      });
    } catch (err) {
      console.error("Send error:", err);
      haptics.error();
    }
  };

  const handleRetry = () => {
    reset();
    setHasShownConfetti(false);
  };

  const selectRecipient = (addr: string) => {
    setRecipient(addr);
    haptics.light();
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">💸</div>
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to send USDC</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-16 md:py-24 px-4 md:px-8 pb-24 md:pb-16">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-50 transition text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.6 }}
          >
            💸
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Send USDC</h1>
          <p className="text-gray-400">Transfer funds instantly on Base</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              onSubmit={handleSend}
              className="space-y-6"
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Recent Recipients */}
              {RECENT_RECIPIENTS.length > 0 && !recipient && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">Recent Recipients</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {RECENT_RECIPIENTS.map((r) => (
                      <motion.button
                        key={r.address}
                        type="button"
                        onClick={() => selectRecipient(r.address)}
                        className="bg-gray-900 border border-gray-800 hover:border-orange-600 rounded-xl p-4 transition-all text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-semibold text-sm mb-1">{r.label}</div>
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {r.address.slice(0, 6)}...{r.address.slice(-4)}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recipient Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Recipient
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-50 placeholder:text-gray-600 focus:border-orange-600 focus:outline-none transition"
                  />
                  {recipient && !isAddress(recipient) && (
                    <motion.p
                      className="text-xs text-red-400 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Invalid address
                    </motion.p>
                  )}
                </Card>
              </motion.div>

              {/* Amount Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-50 placeholder:text-gray-600 focus:border-orange-600 focus:outline-none transition text-2xl font-bold"
                  />
                  <div className="flex gap-2 mt-3">
                    {[10, 50, 100, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition"
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Error State */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="p-4 border-red-900 bg-red-950/20">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-red-400 mb-1">Transaction Failed</div>
                          <p className="text-xs text-gray-400 mb-3">{error.message}</p>
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                          >
                            Try Again →
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Send Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={!recipient || !amount || !isAddress(recipient) || isPending || isConfirming}
                  className="w-full bg-orange-600 hover:bg-orange-500 min-h-[44px]"
                  size="lg"
                >
                  {isPending || isConfirming ? "Sending..." : "Send USDC"}
                </Button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Success State */}
              <Card className="p-8 border-green-900 bg-green-950/20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="text-6xl mb-4"
                >
                  ✅
                </motion.div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Transaction Sent!</h3>
                <p className="text-gray-400 mb-6">
                  Your USDC has been sent successfully
                </p>
                {hash && (
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-orange-400 hover:text-orange-300 font-medium mb-6"
                  >
                    View on BaseScan →
                  </a>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">Go Home</Button>
                </Link>
                <Button
                  onClick={() => {
                    reset();
                    setRecipient("");
                    setAmount("");
                    setHasShownConfetti(false);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-500"
                >
                  Send Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}

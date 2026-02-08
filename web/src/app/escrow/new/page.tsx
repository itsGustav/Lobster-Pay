"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { CONTRACTS, ESCROW_ABI, USDC_ABI } from "@/lib/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, ActionButton, AmountInput, SparkleEffect } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";

type Step = "form" | "approve" | "create";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

interface Milestone {
  id: string;
  description: string;
  amount: string;
  deadline: string;
}

export default function NewEscrowPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<Step>("form");
  const [direction, setDirection] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", description: "", amount: "", deadline: "" },
  ]);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [createdEscrowId, setCreatedEscrowId] = useState<string | null>(null);

  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Celebrate escrow creation
  useEffect(() => {
    if (isSuccess && step === "create" && !hasShownConfetti) {
      haptics.success();
      
      // Fireworks effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#2563EB", "#3B82F6", "#06B6D4"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#2563EB", "#3B82F6", "#06B6D4"],
        });
      }, 250);

      setHasShownConfetti(true);
    }
  }, [isSuccess, step, hasShownConfetti]);

  const handleApprove = async () => {
    if (!amount) return;

    try {
      await writeContract({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACTS.ESCROW, parseUnits(amount, 6)],
      });
    } catch (err) {
      console.error("Approve error:", err);
      haptics.error();
    }
  };

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !description) return;

    try {
      writeContract({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "createEscrow",
        args: [
          recipient as `0x${string}`,
          parseUnits(amount, 6),
          CONTRACTS.USDC,
          description,
        ],
      });
    } catch (err) {
      console.error("Create escrow error:", err);
      haptics.error();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "form") {
      setDirection(1);
      setStep("approve");
      haptics.light();
    } else if (step === "approve") {
      handleApprove();
    } else {
      handleCreateEscrow(e);
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (step === "approve" || step === "create") {
      setStep("form");
    } else {
      router.push('/dashboard');
    }
    haptics.light();
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), description: "", amount: "", deadline: "" },
    ]);
    haptics.light();
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
      haptics.light();
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[#030B1A] flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-50">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to create escrow</p>
        </motion.div>
      </main>
    );
  }

  const currentStepNum = step === "form" ? 1 : 2;
  const isSuccessful = isSuccess && (step === "approve" || step === "create");

  // After approval success, move to create step
  useEffect(() => {
    if (isSuccess && step === "approve") {
      setTimeout(() => {
        setDirection(1);
        setStep("create");
        reset();
      }, 1500);
    }
  }, [isSuccess, step, reset]);

  // Calculate total amount
  const totalAmount = milestones.reduce((sum, m) => {
    const amt = parseFloat(m.amount || "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  return (
    <main className="min-h-screen bg-[#030B1A] pb-24">
      {/* Header */}
      <header className="border-b border-[#0A1628] bg-[#0A1628]/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={goBack}
            className="text-gray-400 hover:text-gray-50 transition text-sm font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.6 }}
          >
            🔒
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-50">Create Escrow</h1>
          <p className="text-gray-400">Secure payment with smart contract protection</p>
        </motion.div>

        {/* Animated Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((num) => {
            const isActive = currentStepNum >= num;
            const isCurrent = currentStepNum === num;
            
            return (
              <motion.div
                key={num}
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: num * 0.1 }}
              >
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold relative ${
                    isActive ? "bg-[#2563EB] text-white" : "bg-[#0A1628] text-gray-500"
                  }`}
                  animate={{
                    scale: isCurrent ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent ? Infinity : 0,
                    repeatType: "reverse",
                  }}
                >
                  {num}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#2563EB]"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                {num < 2 && (
                  <motion.div
                    className={`h-1 w-12 rounded-full ${
                      currentStepNum > num ? "bg-[#2563EB]" : "bg-[#0A1628]"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Form Content with Slide Animation */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {step === "form" && (
              <motion.form
                key="form"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                <Card className="p-4 bg-[#0A1628] border-gray-800">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-[#030B1A] border border-gray-700 rounded-xl text-gray-50 placeholder:text-gray-600 focus:border-[#2563EB] focus:outline-none transition"
                  />
                  {recipient && !isAddress(recipient) && (
                    <p className="text-xs text-red-400 mt-2">Invalid address</p>
                  )}
                </Card>

                <Card className="p-4 bg-[#0A1628] border-gray-800">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Total Amount (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#030B1A] border border-gray-700 rounded-xl text-gray-50 placeholder:text-gray-600 focus:border-[#2563EB] focus:outline-none transition text-2xl font-bold"
                  />
                </Card>

                <Card className="p-4 bg-[#0A1628] border-gray-800">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this escrow for?"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#030B1A] border border-gray-700 rounded-xl text-gray-50 placeholder:text-gray-600 focus:border-[#2563EB] focus:outline-none transition resize-none"
                  />
                </Card>

                {/* Milestones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">
                      Milestones (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="text-[#2563EB] hover:text-[#3B82F6] text-sm font-medium"
                    >
                      + Add Milestone
                    </button>
                  </div>
                  
                  {milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="p-4 bg-[#0A1628] border-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500">
                          Milestone {index + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(milestone.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Milestone description"
                          value={milestone.description}
                          onChange={(e) =>
                            updateMilestone(milestone.id, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#030B1A] border border-gray-700 rounded-lg text-sm text-gray-50 placeholder:text-gray-600 focus:border-[#2563EB] focus:outline-none transition"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={milestone.amount}
                            onChange={(e) =>
                              updateMilestone(milestone.id, "amount", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#030B1A] border border-gray-700 rounded-lg text-sm text-gray-50 placeholder:text-gray-600 focus:border-[#2563EB] focus:outline-none transition"
                          />
                          <input
                            type="date"
                            value={milestone.deadline}
                            onChange={(e) =>
                              updateMilestone(milestone.id, "deadline", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#030B1A] border border-gray-700 rounded-lg text-sm text-gray-50 focus:border-[#2563EB] focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {totalAmount > 0 && (
                    <div className="text-sm text-gray-400 text-right">
                      Total milestones: ${totalAmount.toFixed(2)} USDC
                    </div>
                  )}
                </div>

                <ActionButton
                  type="submit"
                  disabled={!recipient || !amount || !description || !isAddress(recipient)}
                  variant="primary"
                >
                  Continue →
                </ActionButton>
              </motion.form>
            )}

            {(step === "approve" || step === "create") && (
              <motion.form
                key="approve-create"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                {/* Summary Card */}
                <Card className="p-6 bg-gradient-to-br from-[#2563EB]/5 to-transparent border-[#2563EB]/20">
                  <h3 className="text-lg font-bold mb-4 text-gray-50">Escrow Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Recipient</span>
                      <span className="font-mono text-gray-50 truncate ml-2 max-w-[200px]">
                        {recipient.slice(0, 6)}...{recipient.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount</span>
                      <span className="font-mono font-semibold text-gray-50">${amount} USDC</span>
                    </div>
                    {milestones.some(m => m.description) && (
                      <div className="pt-3 border-t border-gray-800">
                        <div className="text-xs text-gray-400 mb-2">Milestones:</div>
                        {milestones.filter(m => m.description).map((m, i) => (
                          <div key={m.id} className="text-xs text-gray-500 mb-1">
                            {i + 1}. {m.description} {m.amount && `($${m.amount})`}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-xs text-gray-400">{description}</p>
                    </div>
                  </div>
                </Card>

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
                          <div>
                            <div className="font-semibold text-sm text-red-400 mb-1">Transaction Failed</div>
                            <p className="text-xs text-gray-400">{error.message}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success State */}
                <AnimatePresence>
                  {isSuccessful && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="p-6 border-green-900 bg-green-950/20 text-center relative overflow-hidden">
                        {step === "create" && <SparkleEffect />}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          className="text-5xl mb-3"
                        >
                          {step === "approve" ? "✅" : "🎉"}
                        </motion.div>
                        <h3 className="text-xl font-bold text-green-400 mb-1">
                          {step === "approve" ? "Approved!" : "Escrow Created!"}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {step === "approve" ? "Moving to next step..." : "Your secure payment is ready"}
                        </p>
                        {hash && (
                          <a
                            href={`https://basescan.org/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#2563EB] hover:text-[#3B82F6] font-medium"
                          >
                            View on BaseScan →
                          </a>
                        )}
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isSuccessful && (
                  <ActionButton
                    type="submit"
                    disabled={isPending || isConfirming}
                    variant="primary"
                  >
                    {step === "approve"
                      ? isPending || isConfirming
                        ? "Approving..."
                        : "Approve USDC"
                      : isPending || isConfirming
                      ? "Creating..."
                      : "Create Escrow"}
                  </ActionButton>
                )}

                {isSuccess && step === "create" && (
                  <Link href="/dashboard" className="block">
                    <ActionButton variant="primary">Go to Dashboard</ActionButton>
                  </Link>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

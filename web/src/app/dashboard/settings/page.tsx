"use client";

import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BottomNav } from "@/components/ui/BottomNav";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { user, signOut } = useAuth();
  const { disconnect } = useDisconnect();
  const [notifications, setNotifications] = useState(true);

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isConnected && !user) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Not Signed In</h2>
          <p className="text-gray-400">Sign in to access settings</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-16 md:py-24 px-4 md:px-8 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-50 transition text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <Card className="p-6 space-y-4">
            {user?.email && (
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            )}
            {address && (
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                  <div className="font-mono text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              {isConnected && (
                <Button onClick={handleDisconnect} variant="outline" size="sm">
                  Disconnect Wallet
                </Button>
              )}
              {user && (
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Preferences</h2>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">Notifications</div>
                <div className="text-sm text-gray-400">
                  Receive updates about your transactions and escrows
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-orange-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4">Security</h2>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">Session Management</div>
                  <div className="text-sm text-gray-400">
                    View and manage active sessions
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">About</h2>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Version</div>
                <div className="text-sm text-gray-400">Pay Lobster v0.1.0</div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <div className="flex flex-col gap-2">
                <Link href="/docs" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                  Documentation →
                </Link>
                <Link href="https://github.com/paylobster" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                  GitHub →
                </Link>
                <Link href="https://discord.gg/paylobster" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                  Discord →
                </Link>
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

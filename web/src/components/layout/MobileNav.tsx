'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/discover', label: 'Discover' },
  { href: '/docs', label: 'Docs' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-900 border-l border-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <span className="text-xl font-bold flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="text-white">
                  <g fill="currentColor">
                    <path d="M14 19c-1.5-2.5-5-4.5-7.5-3s-1.5 5.5 1 7l6.5-1.5" opacity="0.9"/>
                    <path d="M34 19c1.5-2.5 5-4.5 7.5-3s1.5 5.5-1 7l-6.5-1.5" opacity="0.9"/>
                    <ellipse cx="24" cy="26" rx="9" ry="11"/>
                    <path d="M19 37l5 7 5-7" opacity="0.8"/>
                  </g>
                </svg>
              </div>
              Pay Lobster
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-50 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-touch ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            {!loading && !user ? (
              <Link
                href="/signup"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all"
              >
                Sign Up Free
              </Link>
            ) : !loading && user ? (
              <button
                onClick={async () => { await signOut(); onClose(); router.push('/'); }}
                className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

import Link from 'next/link';
import { BlueLobster } from '@/components/BlueLobster';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-darker via-blue-950/10 to-darker">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <div className="flex justify-center mb-3">
            <BlueLobster size={56} />
          </div>
          <div className="text-2xl font-bold text-white">Pay Lobster</div>
          <div className="text-sm text-gray-400 mt-1">The Payment Layer for Agents</div>
        </Link>

        {/* Auth Card */}
        {children}
      </div>
    </div>
  );
}

'use client';

import { useId } from 'react';

interface BlueLobsterProps {
  className?: string;
  size?: number;
  gradient?: boolean;
}

export function BlueLobster({ className, size = 32, gradient = true }: BlueLobsterProps) {
  const id = useId();
  const gradId = `lobster-grad-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pay Lobster"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      )}
      <g fill={gradient ? `url(#${gradId})` : 'currentColor'}>
        {/* Left claw */}
        <path d="M14 19c-1.5-2.5-5-4.5-7.5-3s-1.5 5.5 1 7l6.5-1.5" opacity="0.9"/>
        {/* Right claw */}
        <path d="M34 19c1.5-2.5 5-4.5 7.5-3s1.5 5.5-1 7l-6.5-1.5" opacity="0.9"/>
        {/* Body */}
        <ellipse cx="24" cy="26" rx="9" ry="11"/>
        {/* Tail */}
        <path d="M19 37l5 7 5-7" opacity="0.8"/>
        {/* Tail segments */}
        <rect x="19" y="34" width="10" height="3" rx="1.5" opacity="0.85"/>
      </g>
      {/* Antennae */}
      <path d="M20 16Q15 8 11 5" stroke={gradient ? `url(#${gradId})` : 'currentColor'} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M28 16Q33 8 37 5" stroke={gradient ? `url(#${gradId})` : 'currentColor'} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Eyes */}
      <circle cx="20.5" cy="22" r="2" fill="white" opacity="0.95"/>
      <circle cx="27.5" cy="22" r="2" fill="white" opacity="0.95"/>
      <circle cx="20.5" cy="22" r="0.8" fill="#030B1A"/>
      <circle cx="27.5" cy="22" r="0.8" fill="#030B1A"/>
    </svg>
  );
}

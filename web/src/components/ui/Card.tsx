import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'bordered' | 'elevated' | 'glass';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-900 border border-gray-800',
      bordered: 'bg-gray-900 border-2 border-gray-800',
      elevated: 'bg-gray-900 border border-gray-800 shadow-lg',
      glass: 'glass-card bg-[rgba(15,23,42,0.5)] backdrop-blur-xl border border-white/[0.06]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 md:p-8 transition-all duration-300',
          variants[variant],
          hover && 'hover:border-blue-600/30 hover:shadow-glow-blue hover:-translate-y-1 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

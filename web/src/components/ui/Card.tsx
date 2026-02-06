import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { tokens } from '@/styles/tokens';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-900 border border-gray-800',
      bordered: 'bg-gray-900 border-2 border-gray-800',
      elevated: 'bg-gray-900 border border-gray-800 shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-6 md:p-8 transition-all duration-150',
          variants[variant],
          hover && 'hover:border-gray-700 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
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

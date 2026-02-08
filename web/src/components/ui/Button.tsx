import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-darker disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-glow-blue',
      secondary: 'bg-gray-800/80 text-gray-50 border border-gray-700 hover:bg-gray-700/80 hover:border-gray-600 active:scale-[0.98] backdrop-blur-sm',
      ghost: 'text-gray-400 hover:text-gray-50 hover:bg-white/5 active:scale-[0.98]',
      outline: 'border border-gray-700 text-gray-50 hover:bg-white/5 hover:border-blue-600/50 active:scale-[0.98]',
      glow: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] shadow-glow-blue hover:shadow-glow-blue-lg',
    };

    const sizes = {
      sm: 'text-sm px-3 py-2 min-h-[36px]',
      md: 'text-base px-5 py-2.5 min-h-[44px]',
      lg: 'text-lg px-8 py-3.5 min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

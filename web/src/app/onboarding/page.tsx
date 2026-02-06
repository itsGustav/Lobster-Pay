'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeStep } from '@/components/Onboarding/WelcomeStep';
import { WalletStep } from '@/components/Onboarding/WalletStep';
import { AgentStep } from '@/components/Onboarding/AgentStep';
import { TourStep } from '@/components/Onboarding/TourStep';

const STEPS = ['welcome', 'wallet', 'agent', 'tour'] as const;
type Step = typeof STEPS[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_complete', 'true');
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header with Progress */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="font-semibold text-gray-50">Pay Lobster</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Skip Tour
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-600 to-orange-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              
              return (
                <div
                  key={step}
                  className="flex items-center"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-orange-600 text-white ring-4 ring-orange-600/20'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 capitalize hidden sm:block ${
                        isActive ? 'text-gray-50' : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 md:w-24 h-0.5 mx-1 transition-all duration-300 ${
                        isComplete ? 'bg-green-500' : 'bg-gray-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {currentStep === 'welcome' && (
            <WelcomeStep onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 'wallet' && (
            <WalletStep onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 'agent' && (
            <AgentStep onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 'tour' && (
            <TourStep onComplete={handleComplete} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Need help?{' '}
          <a href="/docs" className="text-orange-600 hover:text-orange-500 transition-colors">
            Visit our documentation
          </a>
        </div>
      </footer>
    </div>
  );
}

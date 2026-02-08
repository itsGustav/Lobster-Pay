import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { UseCases } from '@/components/landing/UseCases';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ChatDemo } from '@/components/landing/ChatDemo';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { TrustScores } from '@/components/landing/TrustScores';
import { QuickStart } from '@/components/landing/QuickStart';
import { AgentFuture } from '@/components/landing/AgentFuture';
import { AgentDemo } from '@/components/landing/AgentDemo';
import { X402Section } from '@/components/landing/X402Section';
import { EscrowTemplates } from '@/components/landing/EscrowTemplates';
import { Analytics } from '@/components/landing/Analytics';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { DeveloperSection } from '@/components/landing/DeveloperSection';
import { CommandsShowcase } from '@/components/landing/CommandsShowcase';
import { SupportSection } from '@/components/landing/SupportSection';
import { CreditScore } from '@/components/landing/CreditScore';
import { SkillInstall } from '@/components/landing/SkillInstall';
import { CTASection } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-darker">
      <HeroSection />
      <ChatDemo />
      <StatsBar />
      <UseCases />
      <HowItWorks />
      <InteractiveDemo />
      <TrustScores />
      <CreditScore />
      <QuickStart />
      <AgentFuture />
      <AgentDemo />
      <X402Section />
      <EscrowTemplates />
      <Analytics />
      <FeatureGrid />
      <SkillInstall />
      <DeveloperSection />
      <CommandsShowcase />
      <SupportSection />
      <CTASection />
    </main>
  );
}

import { LandingNav } from './components/LandingNav'
import { HeroSection } from './components/HeroSection'
import { ProblemSection } from './components/ProblemSection'
import { FeaturesSection } from './components/FeaturesSection'
import { DashboardPreview } from './components/DashboardPreview'
import { TeamSection } from './components/TeamSection'
import { LandingFooter } from './components/LandingFooter'

export default function LandingPage() {
  return (
    <div className='portal-shell font-dm-sans relative min-h-dvh overflow-x-hidden bg-background'>
      <LandingNav />

      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <DashboardPreview />
        <TeamSection />
      </main>

      <LandingFooter />
    </div>
  )
}

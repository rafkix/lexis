'use client'

import HeroSection from './HeroSection'
import PlatformSection from './PlatformSection'
import ConnectedSection from './ConnectedSection'
import SkillsSection from './SkillsSection'
import RouteSection from './RouteSection'
import ResultsSection from './ResultsSection'
import PlanSection from './PlanSection'
import { useModeTransition } from './useModeTransition'

export default function LandingPage() {
  const { mode, switchMode } = useModeTransition('ielts')

  return (
    <main
      className="min-h-screen w-full max-w-full overflow-x-hidden"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'rgb(250, 249, 255)',
        color: 'rgb(26, 19, 40)',
      }}
    >
      <HeroSection mode={mode} switchMode={switchMode} />
      <PlatformSection mode={mode} />
      <ConnectedSection mode={mode} />
      <SkillsSection mode={mode} />
      <RouteSection mode={mode} />
      <ResultsSection mode={mode} />
      <PlanSection mode={mode} />
    </main>
  )
}

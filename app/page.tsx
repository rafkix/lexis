import Header from '@/components/Header'
import Hero from '@/components/landing/Hero'
import Problems from '@/components/landing/Problems'
import Solution from '@/components/landing/Solution'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import SocialProof from '@/components/landing/SocialProof'
import Pricing from '@/components/landing/Pricing'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">

      {/* 🔴 GLOBAL GRID BACKGROUND */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(239,68,68,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(239,68,68,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '42px 42px'
        }}
      />

      {/* 🔥 GLOBAL NOISE */}
      <div className="fixed inset-0 z-0 opacity-[0.04] bg-[url('/noise.png')]" />

      {/* 🔥 GLOBAL GLOW (3 ta) */}
      <div className="fixed top-[-150px] left-[-100px] w-[350px] h-[350px] bg-red-500/10 blur-[140px]" />
      <div className="fixed bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-red-500/10 blur-[140px]" />
      <div className="fixed top-[40%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[160px]" />

      {/* 🔥 CONTENT */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <Problems />
        <Solution />
        <Features />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <FinalCTA />
        <Footer />
      </div>

    </div>
  )
}
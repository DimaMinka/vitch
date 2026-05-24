import React from 'react';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import LandingCapabilities from './LandingCapabilities';
import LandingRunbook from './LandingRunbook';
import LandingFooter from './LandingFooter';

interface LandingPageProps {
  onLaunchApplet: () => void;
  children: React.ReactNode;
}

export default function LandingPage({ onLaunchApplet, children }: LandingPageProps) {
  return (
    <div className="bg-[#06080d] text-gray-200 font-sans selection:bg-emerald-500/20 selection:text-white antialiased min-h-screen relative overflow-x-hidden">
      
      {/* Ambient Grid Backdrop decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Ambient subtle sunset color mesh */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <LandingHeader onLaunchApplet={onLaunchApplet} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Hero */}
        <LandingHero />

        {/* Capabilities */}
        <LandingCapabilities />

        {/* Main interactive TUI compiler */}
        <section id="interactive-simulator" className="mb-20">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <div className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex rounded-full px-3 py-1 font-mono uppercase tracking-wider mb-3">
              Interactive Showcase
            </div>
            <h3 className="text-2xl font-display font-bold text-white tracking-tight">The Live Compilation Playground</h3>
            <p className="text-gray-400 font-mono text-[11px] leading-relaxed mt-1">
              Configure clips, stage custom settings, and generate valid FFmpeg bash statements dynamically below!
            </p>
          </div>

          {/* Mount real interactive applet inside here */}
          <div className="w-full">
            {children}
          </div>
        </section>

        {/* Runbook */}
        <LandingRunbook />

        {/* Footer */}
        <LandingFooter onLaunchApplet={onLaunchApplet} />

      </main>
    </div>
  );
}

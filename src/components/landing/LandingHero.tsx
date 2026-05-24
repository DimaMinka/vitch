import { SlidersHorizontal, Terminal } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="text-center max-w-3xl mx-auto mb-16 relative">
      {/* Decorative glows */}
      <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1] mb-6">
        Rapid FFmpeg Stream <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500">
          Stitching & Color Grading
        </span>
      </h2>
      
      <p className="text-gray-400 font-mono text-xs md:text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
        Configure, preview, and export high-performance video compilation pipelines directly configured in a retro-terminal macOS desktop framework. Frame-perfect cuts, lossless multiplexing copy, looping music tracks, and 3D LUT lookups.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a 
          href="#interactive-simulator" 
          className="px-5 py-3 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-lg transition flex items-center space-x-2"
        >
          <SlidersHorizontal size={16} className="text-amber-400" />
          <span>Interactive Workspace Sim</span>
        </a>
        <a 
          href="#mac-runbook" 
          className="px-5 py-3 border border-[#2d3748] bg-slate-900/30 text-gray-300 hover:text-white hover:bg-slate-900/50 text-xs font-mono font-medium rounded-lg transition flex items-center space-x-2"
        >
          <Terminal size={16} className="text-gray-400" />
          <span>macOS Runbook</span>
        </a>
      </div>
    </section>
  );
}

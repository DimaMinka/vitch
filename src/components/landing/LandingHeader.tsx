import { Play } from 'lucide-react';

interface LandingHeaderProps {
  onLaunchApplet?: () => void;
}

export default function LandingHeader({ onLaunchApplet }: LandingHeaderProps) {
  return (
    <header className="border-b border-[#2d3748]/50 bg-[#06080d]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 flex items-center justify-center">
            <span className="font-display font-extrabold text-amber-500 text-lg tracking-wider">V</span>
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-lg tracking-tight flex items-center space-x-2">
              <span>VITCH</span> 
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono font-medium px-1.5 py-0.5 rounded border border-amber-500/30 tracking-widest uppercase ml-2">macOS TUI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">FFmpeg Assembler Workspace</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#key-capabilities" className="text-xs font-mono text-gray-400 hover:text-amber-400 transition">/capabilities</a>
          <a href="#interactive-simulator" className="text-xs font-mono text-gray-400 hover:text-amber-400 transition">/live-compiler</a>
          <a href="#mac-runbook" className="text-xs font-mono text-gray-400 hover:text-amber-400 transition">/macos_runbook</a>
        </nav>

        <div className="flex items-center space-x-3">
          {onLaunchApplet ? (
            <button 
              onClick={onLaunchApplet}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#06080d] text-xs font-mono font-bold rounded-lg transition inline-flex items-center space-x-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Play size={14} className="fill-[#06080d]" />
              <span>Launch Applet</span>
            </button>
          ) : (
            <a 
              href="./app.html" 
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#06080d] text-xs font-mono font-bold rounded-lg transition inline-flex items-center space-x-1.5 shadow-lg shadow-amber-500/10"
            >
              <Play size={14} className="fill-[#06080d]" />
              <span>Launch Applet</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

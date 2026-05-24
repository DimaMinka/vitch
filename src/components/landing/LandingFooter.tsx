import { Zap } from 'lucide-react';

interface LandingFooterProps {
  onLaunchApplet?: () => void;
}

export default function LandingFooter({ onLaunchApplet }: LandingFooterProps) {
  return (
    <section className="text-center py-12 border-t border-[#2d3748]/40">
      <div className="bg-amber-500/5 p-8 rounded-2xl border border-amber-500/20 max-w-4xl mx-auto flex flex-col items-center">
        <h3 className="text-2xl font-display font-extrabold text-white mb-3">Deploy high performance video rendering today</h3>
        <p className="text-gray-400 text-[11px] font-mono leading-relaxed mb-6 max-w-xl">
          Experience Vitch. Adjust codec settings, generate clean 3D look-up filter matrices, bind audio tracks, and copy or download fully functional shell scripts to run in macOS Command line.
        </p>
        {onLaunchApplet ? (
          <button 
            onClick={onLaunchApplet}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#06080d] text-xs font-mono font-bold rounded-lg transition inline-flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Zap size={16} className="fill-[#06080d]" />
            <span>Open Vitch Interactive Applet</span>
          </button>
        ) : (
          <a 
            href="./app.html" 
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#06080d] text-xs font-mono font-bold rounded-lg transition inline-flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Zap size={16} className="fill-[#06080d]" />
            <span>Open Vitch Interactive Applet</span>
          </a>
        )}
      </div>
      
      <p className="text-[10px] font-mono text-gray-600 mt-12">
        © 2026 Vitch. Deep engineering. Standardized POSIX / UNIX compilation engine.
      </p>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Terminal, Shield, Cpu, Clock, HardDrive } from 'lucide-react';

interface TerminalHeaderProps {
  activeTab: number;
  totalDuration: number;
  totalSize: number;
  fileCount: number;
}

export default function TerminalHeader({
  activeTab,
  totalDuration,
  totalSize,
  fileCount,
}: TerminalHeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-[#2d3748] bg-[#0b0f19] p-4 font-mono select-none" id="tui-header">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Terminal size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-extrabold tracking-widest text-base">
                VITCH // TUI PIPELINE
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded uppercase font-bold tracking-wider animate-pulse">
                macOS DARWIN
              </span>
            </div>
            <div className="text-[10px] text-gray-500 flex items-center gap-2">
              <span>v1.2.0-Darwin</span>
              <span>•</span>
              <span className="text-[#38bdf8] flex items-center gap-0.5">
                <Shield size={10} /> sandboxed
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0a0e17] border border-[#1a202c] rounded px-4 py-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Cpu size={12} className="text-[#a855f7]" />
            <div>
              <p className="text-[9px] text-gray-500 uppercase leading-none">System</p>
              <p className="font-semibold text-gray-300">Apple Silicon</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <HardDrive size={12} className="text-[#e11d48]" />
            <div>
              <p className="text-[9px] text-gray-500 uppercase leading-none">Queue Size</p>
              <p className="font-semibold text-gray-300">
                {fileCount} Clips ({totalSize.toFixed(1)} MB)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={12} className="text-[#10b981]" />
            <div>
              <p className="text-[9px] text-gray-500 uppercase leading-none">Audio Sync Length</p>
              <p className="font-semibold text-gray-300">{totalDuration.toFixed(1)}s</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 cursor-blink"></span>
            <div>
              <p className="text-[9px] text-gray-500 uppercase leading-none">Local Time</p>
              <p className="font-mono text-[10px] text-gray-300 leading-none mt-0.5">{time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts help status bar */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 border-t border-[#1a202c]/50 pt-2">
        <span className="text-gray-500 text-[10px] uppercase font-bold mr-1">Hotkeys:</span>
        <span className="px-1.5 py-0.5 bg-[#171e2e] border border-[#2d3748] rounded text-emerald-400 font-semibold">
          1-5
        </span>
        <span className="mr-3">Switch tabs</span>

        <span className="px-1.5 py-0.5 bg-[#171e2e] border border-[#2d3748] rounded text-emerald-400 font-semibold">
          A
        </span>
        <span className="mr-3">Add video</span>

        <span className="px-1.5 py-0.5 bg-[#171e2e] border border-[#2d3748] rounded text-emerald-400 font-semibold">
          C
        </span>
        <span className="mr-3">Clear assembler</span>

        <span className="px-1.5 py-0.5 bg-[#171e2e] border border-[#2d3748] rounded text-emerald-400 font-semibold">
          R
        </span>
        <span className="mr-3">Run compile</span>

        <span className="px-1.5 py-0.5 bg-[#171e2e] border border-[#2d3748] rounded text-[#38bdf8] font-semibold">
          D
        </span>
        <span>Download .sh script</span>
      </div>
    </header>
  );
}

import { Terminal, Key, PlayCircle } from 'lucide-react';

export default function LandingRunbook() {
  return (
    <section id="mac-runbook" className="bg-[#0b0f19] border border-[#2d3748]/60 rounded-xl p-8 mb-16 relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#2d3748]/60 pb-5 mb-6 gap-4">
        <div>
          <h3 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Terminal size={20} className="text-amber-500 animate-pulse" />
            <span>macOS Darwin Direct Terminal Execution Guide</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-mono mt-1">Deploy and execute the built POSIX assembly stack natively downstream in milliseconds.</p>
        </div>
        <div className="flex space-x-2">
          <span className="px-2.5 py-1 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold rounded">zsh/bash</span>
          <span className="px-2.5 py-1 text-[10px] bg-[#1a2f23] text-emerald-400 border border-emerald-500/20 font-bold rounded">Fast Stream</span>
        </div>
      </div>

      {/* Steps timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {/* Step 1 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">01</span>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Export Build Payload</h4>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Configure clips and filters, then click the <b>Assemble Exporter</b> to compile a high-fidelity <code className="text-amber-300">assemble.sh</code>. Store it directly under the folder where your source clips are situated structure-wise.
          </p>
        </div>

        {/* Step 2 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">02</span>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Set Permissions</h4>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Open macOS <b>Terminal.app</b>. Navigate inside your project directory and execute the POSIX binary permission state command to permit raw shell execution:
          </p>
          <div className="bg-[#05080e] rounded p-3 text-[10px] text-gray-300 border border-gray-900 border-l-2 border-l-amber-500 flex items-center justify-between">
            <code className="select-all">chmod +x assemble.sh</code>
            <Key size={14} className="text-gray-500" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">03</span>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Launch Compiler</h4>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Run our custom built FFmpeg stitch wrapper natively. The compilation runs losslessly or apply grades while routing verbose parameters directly to audit logging:
          </p>
          <div className="bg-[#05080e] rounded p-3 text-[10px] text-gray-300 border border-gray-900 border-l-2 border-l-emerald-500 flex items-center justify-between">
            <code className="select-all">./assemble.sh</code>
            <PlayCircle size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Terminal output file monitoring box in book */}
      <div className="mt-8 bg-[#05080e] border border-gray-900 rounded-lg p-4 font-mono text-[10px] text-gray-500">
        <span className="text-gray-400 font-bold block mb-2 uppercase tracking-widest text-[9px]">Local Log Tracking command:</span>
        <p className="mb-3 text-[11px] text-gray-300 select-all bg-[#0a0f18] p-2 rounded border border-gray-800 max-w-xs font-semibold">tail -f vitch_pipeline.log</p>
        <div className="space-y-1 text-gray-600">
          <p>[2026-05-24 12:45:01] INFO: Log File initialized inside target folder /Movies/RawBroll/</p>
          <p>[2026-05-24 12:45:02] INFO: Confirmed 3 source MP4 video files have shared resolution constraints.</p>
          <p>[2026-05-24 12:45:03] SUCCESS: Concatenation completed perfectly (Lossless 0% CPU recode copy).</p>
        </div>
      </div>
    </section>
  );
}

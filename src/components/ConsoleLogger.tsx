import { LogLine } from '../types';
import { Terminal, ShieldCheck, Download, Trash, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ConsoleLoggerProps {
  logs: LogLine[];
  onClearLogs: () => void;
  onDownloadScript: () => void;
  isCompiling: boolean;
  compileProgress: number;
}

export default function ConsoleLogger({
  logs,
  onClearLogs,
  onDownloadScript,
  isCompiling,
  compileProgress,
}: ConsoleLoggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll down on new logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isCompiling, compileProgress]);

  // Generate ASCII progress bar
  const renderProgressBar = () => {
    const totalBlocks = 30;
    const filledBlocks = Math.floor((compileProgress / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    
    const bar = '='.repeat(filledBlocks) + '>' + ' '.repeat(Math.max(0, emptyBlocks - 1));
    return `[${bar}] ${compileProgress}%`;
  };

  return (
    <div className="border border-[#2d3748] bg-[#02050a] rounded-lg overflow-hidden flex flex-col font-mono text-[11px] h-full select-none" id="console-logger">
      {/* Console log header bar */}
      <div className="bg-[#0b0e14] px-4 py-2.5 border-b border-[#2d3748] flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Terminal size={14} className="animate-pulse" />
          <span className="font-extrabold uppercase tracking-wide">
            macOS Terminal Output Simulator & Executable Installer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1 px-2 text-[10px] bg-gray-800 text-gray-400 border border-gray-700 rounded hover:bg-gray-750 hover:text-white transition cursor-pointer flex items-center space-x-1"
              title="Clear Console Buffer"
            >
              <Trash size={11} />
              <span>Clear logs</span>
            </button>
          )}
          <button
            onClick={onDownloadScript}
            className="p-1 px-2.5 text-[10px] bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 rounded hover:bg-emerald-600/25 transition cursor-pointer flex items-center space-x-1 font-bold shadow-lg shadow-emerald-500/5"
            title="Download the compiled .sh script file for native execution"
          >
            <Download size={11} />
            <span>Download assemble.sh</span>
          </button>
        </div>
      </div>

      {/* Logger Body content */}
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/95 text-gray-300 min-h-[160px] font-mono leading-relaxed space-y-1 select-text"
      >
        {/* System initial terminal banner */}
        <div className="text-gray-600 text-[10px] border-b border-[#111c2e]/70 pb-2 mb-2 select-none">
          <p>Last login: {new Date().toLocaleDateString()} on ttys001</p>
          <p className="text-emerald-500/60 font-semibold mt-0.5">✔ Host architecture certified (macOS Darwin x86_64 / arm64)</p>
        </div>

        {/* Live Logs Stream */}
        {logs.length === 0 && !isCompiling ? (
          <div className="h-28 flex flex-col items-center justify-center text-center text-gray-600 italic select-none">
            <span className="text-2xl mb-1.5 opacity-45">⌨️</span>
            <p>Terminal Buffer Empty</p>
            <p className="text-[9px] mt-0.5 max-w-[340px]">
              Perform customizations then click <b className="text-emerald-400 uppercase">Compile Script</b> to trigger automated test builds and generate local executable payloads.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            let prefixColor = 'text-green-500';
            let textColor = 'text-gray-300';

            switch (log.type) {
              case 'info':
                prefixColor = 'text-cyan-400';
                break;
              case 'warn':
                prefixColor = 'text-amber-400 font-bold';
                textColor = 'text-amber-200';
                break;
              case 'success':
                prefixColor = 'text-emerald-400 font-bold';
                textColor = 'text-emerald-100 font-semibold';
                break;
              case 'error':
                prefixColor = 'text-red-500 font-bold';
                textColor = 'text-red-300 font-semibold';
                break;
              case 'cmd':
                prefixColor = 'text-blue-400 font-bold';
                textColor = 'text-sky-300 font-semibold';
                break;
            }

            return (
              <div key={log.id} className="flex hover:bg-[#111827]/40 py-0.5 px-1 rounded transition-colors">
                <span className="text-gray-600 text-[9px] mr-2.5 select-none">{log.timestamp}</span>
                <span className={`mr-2 font-bold select-none ${prefixColor}`}>
                  {log.type === 'cmd' ? '$' : `[${log.type.toUpperCase()}]`}
                </span>
                <span className={`flex-1 break-all ${textColor}`}>{log.text}</span>
              </div>
            );
          })
        )}

        {/* Animated Compilation Terminal Line */}
        {isCompiling && (
          <div className="bg-[#10b981]/5 border border-[#10b981]/10 p-3 mt-3 rounded-md space-y-2 animate-pulse select-none">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin text-emerald-400" />
                <span>Simulated FFmpeg Rendering Task Staged...</span>
              </span>
              <span>{compileProgress}%</span>
            </div>
            
            {/* ProgressBar */}
            <div className="text-emerald-500 text-[11px] font-mono whitespace-pre font-bold">
              {renderProgressBar()}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 pt-0.5 border-t border-emerald-500/10 font-mono">
              <div>Bitrate: <span className="text-gray-300 font-bold">14.8 Mb/s</span></div>
              <div>Frame Render Speed: <span className="text-gray-300 font-bold">3.8x (96 fps)</span></div>
              <div>Buffer Alloc: <span className="text-[#38bdf8] font-bold">Metal v3</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Script copy alert instructions */}
      <div className="border-t border-[#2d3748] bg-[#0c1221] px-4 py-3 text-xs text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <p className="text-[10px] leading-relaxed max-w-[500px]">
            To execute natively on macOS, click <b className="text-emerald-400">Download assemble.sh</b>, move file to movie folder, open native macOS terminal and run: <code className="bg-black border border-gray-800 px-1 py-0.5 rounded text-sky-400 select-all font-bold">chmod +x assemble.sh && ./assemble.sh</code>
          </p>
        </div>
      </div>
    </div>
  );
}

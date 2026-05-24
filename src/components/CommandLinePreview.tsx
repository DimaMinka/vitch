import { VideoFile, AudioTrack, LutConfig, FfmpegConfig } from '../types';
import { buildFfmpegCommand } from '../utils';
import { Copy, Check, Terminal, Share2 } from 'lucide-react';
import { useState } from 'react';

interface CommandLinePreviewProps {
  videos: VideoFile[];
  audio: AudioTrack;
  lut: LutConfig;
  config: FfmpegConfig;
}

export default function CommandLinePreview({
  videos,
  audio,
  lut,
  config,
}: CommandLinePreviewProps) {
  const [copied, setCopied] = useState(false);

  const command = buildFfmpegCommand(videos, audio, lut, config);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#2d3748] bg-[#070b12] rounded-lg overflow-hidden flex flex-col font-mono text-xs select-none" id="cmd-preview">
      {/* Terminal Title Bar */}
      <div className="bg-[#111726]/80 px-3 py-2 border-b border-[#2d3748] flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sky-400">
          <Terminal size={14} />
          <span className="text-xs uppercase font-extrabold tracking-wide">
            Live macOS FFmpeg Command Output
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-[10px] rounded flex items-center space-x-1.5 cursor-pointer transition ${
            copied
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? 'Copied CLI Command!' : 'Copy Statement'}</span>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-3 bg-black/95 overflow-x-auto min-h-[140px] max-h-[300px] custom-scrollbar text-emerald-400 leading-snug font-mono text-[11px] h-full">
        {videos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 italic py-8">
            # Queue is empty. Add video clips to draft real-time FFmpeg statements.
          </div>
        ) : (
          <pre className="whitespace-pre select-all text-left">
            {command.split('\n').map((line, idx) => {
              const isComment = line.trim().startsWith('#');
              const isFlag = line.trim().startsWith('-');
              let colorClass = 'text-gray-100';
              if (isComment) colorClass = 'text-gray-500 italic';
              else if (isFlag) colorClass = 'text-cyan-400';
              else if (line.includes('ffmpeg')) colorClass = 'text-emerald-400 font-bold';

              return (
                <div key={idx} className="flex hover:bg-[#111827]/30 px-1 py-0.5 rounded">
                  <span className="w-8 select-none text-gray-700 text-right pr-3">{idx + 1}</span>
                  <span className={colorClass}>{line}</span>
                </div>
              );
            })}
          </pre>
        )}
      </div>

      {/* Flag Highlights bar */}
      <div className="bg-[#0b0e14] border-t border-[#2d3748]/60 px-3 py-2 text-[10px] text-gray-500 flex justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            <span className="text-gray-400">c:v copy (Lossless)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            <span className="text-gray-400">lut3d (Grading)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            <span className="text-gray-400">shortest (Loop sync)</span>
          </span>
        </div>
        <span>POSIX Compliant</span>
      </div>
    </div>
  );
}

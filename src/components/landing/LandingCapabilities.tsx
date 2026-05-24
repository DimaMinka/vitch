import { Zap, Palette, Music } from 'lucide-react';

export default function LandingCapabilities() {
  return (
    <section id="key-capabilities" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      {/* Pillar 1 */}
      <div className="bg-[#0b0f19] border border-[#2d3748]/60 rounded-xl p-6 relative group overflow-hidden hover:border-amber-500/40 transition duration-300">
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition duration-300"></div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#1c2e1f] text-emerald-400 border border-emerald-500/20">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <h3 className="font-display font-black text-white text-md tracking-tight">Stream Copy Concat</h3>
        </div>
        <p className="text-gray-400 font-mono text-[11px] leading-relaxed mb-4">
          Instantly merge multi-segment movie shots in milliseconds. By keeping standard codec streams untouched, your CPU copy pipeline renders immediately with zero generational quality degradation inside a lossless demux wrapper.
        </p>
        <div className="bg-[#05070c] border border-gray-800/40 rounded p-3 font-mono text-[9px] text-gray-500 select-all overflow-x-auto whitespace-nowrap">
          ffmpeg -f concat -safe 0 -i inputs.txt -c copy output.mp4
        </div>
      </div>

      {/* Pillar 2 */}
      <div className="bg-[#0b0f19] border border-[#2d3748]/60 rounded-xl p-6 relative group overflow-hidden hover:border-amber-500/40 transition duration-300">
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition duration-300"></div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#2e261c] text-amber-400 border border-amber-500/20">
            <Palette size={20} className="text-amber-400" />
          </div>
          <h3 className="font-display font-black text-white text-md tracking-tight">3D LUT Cinematic Grading</h3>
        </div>
        <p className="text-gray-400 font-mono text-[11px] leading-relaxed mb-4">
          Map standard raw S-Log, flat profiles, or Rec.709 frames onto tetrahedral color lookup matrix matrices (.cube). Adjust exact overlay transparency filters dynamically directly within your local FFmpeg filter chains.
        </p>
        <div className="bg-[#05070c] border border-gray-800/40 rounded p-3 font-mono text-[9px] text-gray-500 select-all overflow-x-auto whitespace-nowrap">
          lut3d='fuji_50.cube':interp=tetrahedral
        </div>
      </div>

      {/* Pillar 3 */}
      <div className="bg-[#0b0f19] border border-[#2d3748]/60 rounded-xl p-6 relative group overflow-hidden hover:border-amber-500/40 transition duration-300">
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition duration-300"></div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#1c232e] text-blue-400 border border-blue-500/20">
            <Music size={20} className="text-blue-400" />
          </div>
          <h3 className="font-display font-black text-white text-md tracking-tight">Looping Backtrack Sync</h3>
        </div>
        <p className="text-gray-400 font-mono text-[11px] leading-relaxed mb-4">
          Overlay customized, rich audio tracks and master backing tracks over stitched movie vectors. Automatically configure persistent audio repeats and clip duration calculations to achieve a professional final layout.
        </p>
        <div className="bg-[#05070c] border border-gray-800/40 rounded p-3 font-mono text-[9px] text-gray-500 select-all overflow-x-auto whitespace-nowrap">
          -stream_loop -1 -i music.flac -shortest
        </div>
      </div>
    </section>
  );
}

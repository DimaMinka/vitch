import { VideoFile } from '../types';
import { Play, Trash2, ArrowUp, ArrowDown, FolderOpen, Plus, Sparkles, Film } from 'lucide-react';
import React, { useState } from 'react';

interface FileWorkspaceProps {
  videos: VideoFile[];
  onAddVideo: (video: VideoFile) => void;
  onRemoveVideo: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onClearQueue: () => void;
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;
}

const SAMPLE_PRESETS: Omit<VideoFile, 'id'>[] = [
  { name: 'broll_shibuya_foggy_1080p.mov', duration: 12.4, size: 84.2, resolution: '1920x1080', fps: 29.97, codec: 'ProRes 422' },
  { name: 'a_roll_speech_narration.mp4', duration: 45.1, size: 124.7, resolution: '1920x1080', fps: 23.98, codec: 'h264' },
  { name: 'broll_tokyo_underground_raw.mp4', duration: 8.3, size: 61.2, resolution: '1920x1080', fps: 23.98, codec: 'h264' },
  { name: 'drone_landscape_mountains.mov', duration: 18.0, size: 240.5, resolution: '3840x2160', fps: 59.94, codec: 'ProRes 422 HQ' },
  { name: 'street_market_neon_night.mp4', duration: 14.5, size: 34.1, resolution: '1920x1080', fps: 24.00, codec: 'h265' },
];

export default function FileWorkspace({
  videos,
  onAddVideo,
  onRemoveVideo,
  onMoveUp,
  onMoveDown,
  onClearQueue,
  selectedVideoId,
  setSelectedVideoId,
}: FileWorkspaceProps) {
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState('15');
  const [customSize, setCustomSize] = useState('50');
  const [customRes, setCustomRes] = useState('1920x1080');
  const [customFps, setCustomFps] = useState('24');
  const [customCodec, setCustomCodec] = useState('h264');

  // Trigger file dialog simulator
  const handleAddPreset = (preset: Omit<VideoFile, 'id'>) => {
    onAddVideo({
      id: crypto.randomUUID(),
      ...preset,
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    // Ensure extension
    let filename = customName;
    if (!filename.includes('.')) {
      filename += customCodec === 'prores' ? '.mov' : '.mp4';
    }

    onAddVideo({
      id: crypto.randomUUID(),
      name: filename,
      duration: parseFloat(customDuration) || 10,
      size: parseFloat(customSize) || 45,
      resolution: customRes,
      fps: parseFloat(customFps) || 24,
      codec: customCodec,
    });
    setCustomName('');
  };

  const loadAllPresets = () => {
    SAMPLE_PRESETS.forEach(preset => {
      onAddVideo({
        id: crypto.randomUUID(),
        ...preset,
      });
    });
  };

  return (
    <div className="border border-[#2d3748] bg-[#0c101b] rounded-lg overflow-hidden flex flex-col h-full font-mono select-none" id="file-workspace">
      {/* Directory Scanner Header */}
      <div className="bg-[#111726]/80 p-3 border-b border-[#2d3748] flex justify-between items-center">
        <div className="flex items-center space-x-2 text-emerald-400">
          <FolderOpen size={14} />
          <span className="text-xs uppercase font-extrabold tracking-wide">
            macOS Directory Scanner & Assembler Queue
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllPresets}
            className="px-2 py-1 text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded hover:bg-indigo-500/25 transition cursor-pointer flex items-center space-x-1"
            title="Scan workspace directory and preload test assets"
          >
            <Sparkles size={11} />
            <span>Mock Directory Scan</span>
          </button>
          <button
            onClick={onClearQueue}
            className="px-2 py-1 text-[10px] bg-red-500/10 border border-red-500/30 text-red-300 rounded hover:bg-red-500/25 transition cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Directory Path Details */}
      <div className="bg-[#080b12] px-3 py-1.5 border-b border-[#2d3748]/60 text-[10px] text-gray-400 flex justify-between">
        <span className="text-[#a0aec0]">
          Scanning: <span className="text-[#38bdf8]">~/Movies/RawProjects/Project_Alpha_Stitch/</span>
        </span>
        <span className="text-gray-500">{videos.length} videos queued</span>
      </div>

      {/* Video Files Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[220px]">
        {videos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#070a12]/30">
            <Film size={28} className="text-gray-600 mb-2 animate-pulse" />
            <p className="text-xs text-gray-400 font-semibold">Workspace Directory is Empty</p>
            <p className="text-[10px] text-gray-500 mt-1 max-w-[280px]">
              Perform a <b className="text-indigo-400">Mock Directory Scan</b> above to populate high-fidelity video samples, or fill the manually-compiled form below.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-left text-xs text-gray-300">
              <thead>
                <tr className="bg-[#0c1221] border-b border-[#1c2436] text-[10px] text-gray-500 uppercase">
                  <th className="py-2 px-3 text-center w-8">#</th>
                  <th className="py-2 px-3">File Name</th>
                  <th className="py-2 px-2 text-right">Duration</th>
                  <th className="py-2 px-2 text-right">Size</th>
                  <th className="py-2 px-3">Specs</th>
                  <th className="py-2 px-2 text-center w-12">Move</th>
                  <th className="py-2 px-3 text-center w-10">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182235]/40">
                {videos.map((video, index) => {
                  const isSelected = selectedVideoId === video.id;
                  return (
                    <tr
                      key={video.id}
                      onClick={() => setSelectedVideoId(video.id)}
                      className={`hover:bg-[#111726]/40 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-500/10 border-l-2 border-l-emerald-400' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-[10px] font-bold text-gray-500">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-100 truncate max-w-[150px]">
                        <div className="flex items-center space-x-1.5" title={video.name}>
                          <span className="text-gray-400">🎞️</span>
                          <span className="truncate">{video.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-emerald-400 text-[11px] font-semibold">
                        {video.duration.toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-400 text-[11px]">
                        {video.size.toFixed(1)} MB
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col text-[10px] space-y-0.5">
                          <span className="text-blue-400 font-semibold">{video.resolution}</span>
                          <span className="text-gray-500">
                            {video.fps} FPS • <span className="uppercase text-gray-400 text-[9px]">{video.codec}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveUp(index);
                            }}
                            disabled={index === 0}
                            className={`p-1 rounded transition cursor-pointer ${
                              index === 0 ? 'text-gray-700' : 'text-gray-400 hover:text-emerald-400 hover:bg-[#1a202c]'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveDown(index);
                            }}
                            disabled={index === videos.length - 1}
                            className={`p-1 rounded transition cursor-pointer ${
                              index === videos.length - 1
                                ? 'text-gray-700'
                                : 'text-gray-400 hover:text-emerald-400 hover:bg-[#1a202c]'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveVideo(video.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition cursor-pointer"
                          title="Discard Clip"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Clip Inserter Widget */}
      <div className="border-t border-[#2d3748] bg-[#090d16] p-3 text-xs">
        <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wide flex items-center justify-between">
          <span>Manual Input Vector (Create custom clips)</span>
          <span className="text-gray-600">Simulate file descriptor specs</span>
        </div>
        <form onSubmit={handleAddCustom} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">Clip File Name</label>
              <input
                type="text"
                placeholder="e.g. drone_city_sunset"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1 text-gray-200 outline-none focus:border-emerald-500 transition text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">Scale Preset</label>
              <select
                value={customRes}
                onChange={(e) => setCustomRes(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1 text-gray-200 outline-none focus:border-emerald-500 transition text-[11px]"
              >
                <option value="1920x1080">1920x1080 (HD 1085)</option>
                <option value="3840x2160">3840x2160 (4K UHD)</option>
                <option value="1280x720">1280x720 (Standard HD)</option>
                <option value="1080x1350">1080x1350 (Dynamic Vertical)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">Length (s)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1 text-gray-200 text-center outline-none focus:border-emerald-500 transition text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">Size (MB)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1 text-gray-200 text-center outline-none focus:border-emerald-500 transition text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">FPS</label>
              <select
                value={customFps}
                onChange={(e) => setCustomFps(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-1 py-1 text-gray-200 outline-none focus:border-emerald-500 transition text-[11px]"
              >
                <option value="23.976">23.98</option>
                <option value="24">24.0</option>
                <option value="29.97">29.97</option>
                <option value="30">30.0</option>
                <option value="59.94">59.94</option>
                <option value="60">60.0</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">Format</label>
              <select
                value={customCodec}
                onChange={(e) => setCustomCodec(e.target.value)}
                className="w-full bg-[#05080e] border border-[#2d3748] rounded px-1 py-1 text-gray-200 outline-none focus:border-emerald-500 transition text-[11px]"
              >
                <option value="h264">H.264 (MP4)</option>
                <option value="h265">H.265 (HEVC)</option>
                <option value="prores">ProRes C8</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 mt-1 bg-emerald-600 border border-emerald-500 text-white rounded hover:bg-emerald-500 transition font-bold tracking-wider text-[11px] cursor-pointer inline-flex items-center justify-center space-x-1.5"
          >
            <Plus size={12} />
            <span>Stitch Clip To Queue</span>
          </button>
        </form>
      </div>
    </div>
  );
}

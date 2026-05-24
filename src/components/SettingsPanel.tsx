import { AudioTrack, LutConfig, FfmpegConfig } from '../types';
import { Settings, Film, Palette, Music, Cpu, Play, Music4, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

const LUT_DIR = ((import.meta as any).env?.VITE_LUT_DIR || '').trim();
const AUDIO_DIR = ((import.meta as any).env?.VITE_AUDIO_DIR || '').trim();

interface SettingsPanelProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  audio: AudioTrack;
  setAudio: (audio: AudioTrack) => void;
  lut: LutConfig;
  setLut: (lut: LutConfig) => void;
  config: FfmpegConfig;
  setConfig: (config: FfmpegConfig) => void;
  onRunCompile: () => void;
  isCompiling: boolean;
  compileProgress: number;
}

export default function SettingsPanel({
  activeTab,
  setActiveTab,
  audio,
  setAudio,
  lut,
  setLut,
  config,
  setConfig,
  onRunCompile,
  isCompiling,
  compileProgress,
}: SettingsPanelProps) {
  const getInitialPath = (dir: string) => {
    if (!dir) return '';
    // If it's a file (ends in an extension like .cube, .flac, .mp3, etc.)
    if (/\.[a-zA-Z0-9]+$/.test(dir)) return dir;
    return dir.endsWith('/') ? dir : `${dir}/`;
  };

  const [customLutInput, setCustomLutInput] = useState(getInitialPath(LUT_DIR));
  const [simulatedAudioUpload, setSimulatedAudioUpload] = useState<string>(getInitialPath(AUDIO_DIR));

  const handleCustomLutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = customLutInput.trim();
    if (!value || value.endsWith('/')) return;

    let filename = value;
    if (!filename.includes('.')) {
      filename += '.cube';
    }

    setLut({
      ...lut,
      active: true,
      fileName: filename,
    });
    if (config.outputCodec === 'copy') {
      setConfig({ ...config, outputCodec: 'libx264' });
    }
    setCustomLutInput(getInitialPath(LUT_DIR));
  };

  const handleAudioUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const value = simulatedAudioUpload.trim();
    if (!value || value.endsWith('/')) return;

    let filename = value;
    if (!filename.endsWith('.mp3') && !filename.endsWith('.flac')) {
      filename += '.flac';
    }

    setAudio({
      ...audio,
      name: filename,
      duration: 180, // Default 3 mins track
      syncToVideo: true,
    });
    setSimulatedAudioUpload(getInitialPath(AUDIO_DIR));
  };

  const removeAudioTrack = () => {
    setAudio({
      ...audio,
      name: 'None',
      duration: 0,
      syncToVideo: false,
    });
  };

  return (
    <div className="border border-[#2d3748] bg-[#0c101b] rounded-lg overflow-hidden flex flex-col h-full font-mono select-none" id="settings-panel">
      {/* Configuration Hub Tabs Header */}
      <div className="bg-[#111726]/80 flex border-b border-[#2d3748] items-center justify-between p-1 overflow-x-auto text-xs">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 font-bold ${
              activeTab === 1
                ? 'bg-[#1a2336] border border-[#2d3748] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu size={12} />
            <span>[1: FFmpeg]</span>
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 font-bold ${
              activeTab === 2
                ? 'bg-[#1a2336] border border-[#2d3748] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Palette size={12} />
            <span>[2: LUT Grade]</span>
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 font-bold ${
              activeTab === 3
                ? 'bg-[#1a2336] border border-[#2d3748] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Music size={12} />
            <span>[3: Audio Sync]</span>
          </button>
          <button
            onClick={() => setActiveTab(4)}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 font-bold ${
              activeTab === 4
                ? 'bg-[#1a2336] border border-[#2d3748] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Settings size={12} />
            <span>[4: Batch Specs]</span>
          </button>
        </div>
        <button
          onClick={onRunCompile}
          disabled={isCompiling}
          className={`mx-2 px-3 py-1 font-bold rounded text-[11px] uppercase transition cursor-pointer flex items-center space-x-1 shadow-lg ${
            isCompiling
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5'
              : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
          }`}
        >
          {isCompiling ? (
            <>
              <RefreshCw size={10} className="animate-spin text-emerald-400" />
              <span>Compiling {compileProgress}%</span>
            </>
          ) : (
            <>
              <Play size={10} fill="currentColor" />
              <span>Compile Script</span>
            </>
          )}
        </button>
      </div>

      {/* Screen container */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-xs text-gray-300">
        
        {/* TAB 1: FFmpeg CODEC & STREAM COPY OPERATIONS */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h3 className="text-white font-bold mb-1 flex items-center space-x-1.5 text-xs uppercase text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                <span>Video Stitching Strategy</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                Select your stream copy logic. Lossless copy maintains 100% video source bitstreams without re-encoding but requires identical resolution and frame rates.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <label
                  onClick={() => {
                    setConfig({ ...config, outputCodec: 'copy' });
                    if (lut.active) {
                      setLut({ ...lut, active: false, fileName: '' });
                    }
                  }}
                  className={`border p-2.5 rounded cursor-pointer transition flex flex-col justify-between ${
                    config.outputCodec === 'copy'
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-300'
                      : 'border-[#2d3748] text-gray-400 hover:border-gray-600 hover:bg-gray-800/20'
                  }`}
                >
                  <div className="font-extrabold flex items-center justify-between">
                    <span>Lossless Copy</span>
                    <span className="px-1 text-[8px] bg-emerald-500/20 text-emerald-400 rounded">0% Recode</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold leading-tight">
                    Instant Concat (-c copy). No resolution or LUT alterations.
                  </span>
                </label>

                <label
                  onClick={() => setConfig({ ...config, outputCodec: 'libx264' })}
                  className={`border p-2.5 rounded cursor-pointer transition flex flex-col justify-between ${
                    config.outputCodec === 'libx264' || config.outputCodec === 'libx265' || config.outputCodec === 'prores'
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-300'
                      : 'border-[#2d3748] text-gray-400 hover:border-gray-600 hover:bg-gray-800/20'
                  }`}
                >
                  <div className="font-extrabold flex items-center justify-between">
                    <span>Graded Transcode</span>
                    <span className="px-1 text-[8px] bg-indigo-500/20 text-indigo-400 rounded">On-the-fly Filter</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold leading-tight">
                    Custom scale sizes, LUT tetrahedral grades or sync loops.
                  </span>
                </label>
              </div>
            </div>

            {config.outputCodec !== 'copy' && (
              <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded space-y-3 animate-fade-in">
                <h3 className="text-[#38bdf8] font-bold text-xs uppercase flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full"></span>
                  <span>Transcode & Quality Matrices</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Format Choice */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Target Output Codec</label>
                    <select
                      value={config.outputCodec}
                      onChange={(e) => setConfig({ ...config, outputCodec: e.target.value as any })}
                      className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1.5 text-gray-200 outline-none focus:border-indigo-500 transition text-[11px]"
                    >
                      <option value="libx264">H.264 High-Profile (libx264)</option>
                      <option value="libx265">H.265 Space-Save (libx265/HEVC)</option>
                      <option value="prores">Apple ProRes 422 HQ (prores_ks)</option>
                    </select>
                  </div>

                  {/* Preset Choice */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">FFmpeg Speed Preset</label>
                    <select
                      value={config.preset}
                      onChange={(e) => setConfig({ ...config, preset: e.target.value as any })}
                      className="w-full bg-[#05080e] border border-[#2d3748] rounded px-2 py-1.5 text-gray-200 outline-none focus:border-indigo-500 transition text-[11px]"
                    >
                      <option value="ultrafast">Ultrafast (Brute Draft)</option>
                      <option value="fast">Fast (Average Render)</option>
                      <option value="medium">Medium (Standard Balance)</option>
                      <option value="slow">Slow (Max Bitrate Density)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* CRF (Quality factor) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-gray-500 block uppercase font-bold">CRF (Constant Rate Factor)</label>
                      <span className="text-indigo-400 font-bold text-[11px]">{config.crf}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="51"
                        value={config.crf}
                        onChange={(e) => setConfig({ ...config, crf: parseInt(e.target.value) })}
                        className="w-full h-1 bg-[#20293d] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-600 mt-1 uppercase">
                      <span>0 (Lossless)</span>
                      <span>23 (Default)</span>
                      <span>51 (Worst)</span>
                    </div>
                  </div>

                  {/* Resolution Target Output */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Rescale Conforming Box</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={config.scaleWidth}
                        onChange={(e) => setConfig({ ...config, scaleWidth: e.target.value === 'source' ? 'source' : parseInt(e.target.value) })}
                        className="w-full bg-[#05080e] border border-[#2d3748] rounded px-1 py-1.5 text-gray-200 outline-none focus:border-indigo-500 text-[10px]"
                      >
                        <option value="source">Scale Codec Width</option>
                        <option value="1920">1920 (FHD)</option>
                        <option value="3840">3840 (4K)</option>
                        <option value="1280">1280 (HD)</option>
                      </select>
                      <select
                        value={config.scaleHeight}
                        onChange={(e) => setConfig({ ...config, scaleHeight: e.target.value === 'source' ? 'source' : parseInt(e.target.value) })}
                        className="w-full bg-[#05080e] border border-[#2d3748] rounded px-1 py-1.5 text-gray-200 outline-none focus:border-indigo-500 text-[10px]"
                      >
                        <option value="source">Scale Codec Height</option>
                        <option value="1080">1080 (FHD)</option>
                        <option value="2160">2160 (4K)</option>
                        <option value="720">720 (HD)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h3 className="text-gray-400 font-bold mb-1 text-[11px] uppercase flex items-center space-x-1.5">
                <span>FFmpeg Global System Status</span>
              </h3>
              <div className="text-[10px] text-gray-500 space-y-1.5 font-mono">
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span>Hardware Accel macOS:</span>
                  <span className="text-[#38bdf8] font-bold">Videotoolbox (VT) Auto</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span>Threads Allocated:</span>
                  <span className="text-white">Apple Core Affinity (-threads 0)</span>
                </div>
                <div className="flex justify-between">
                  <span>Multipass Profile:</span>
                  <span className="text-white">Auto Quality Factor (QP Level True)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LUT GRADE & COLOR SPACES */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h3 className="text-white font-bold mb-1 flex items-center space-x-1.5 text-xs uppercase text-amber-400">
                <Palette size={13} />
                <span>Cinematic LUT Tetrahedral Interpolator</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                Upload or select an external 3D Look-Up Table (`.cube` format). FFmpeg scales color spaces with sub-pixel high fidelity on the fly. <b className="text-[#e2e8f0]">Graded Transcode Mode</b> will trigger automatically.
              </p>

              {/* LUT Active Status Card */}
              {lut.active && lut.fileName ? (
                <div className="border border-amber-500/30 p-3 rounded mb-3 bg-[#1b150c] flex items-center justify-between animate-fade-in">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-3 h-3 rounded bg-amber-500 animate-pulse flex-shrink-0"></span>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[11px] text-amber-300 truncate font-mono">
                        ★ Custom Staged 3D LUT Cube Active
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">
                        {lut.fileName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLut({ ...lut, active: false, fileName: '' })}
                    className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 text-red-300 rounded hover:bg-red-950/80 transition cursor-pointer text-[10px] font-bold uppercase flex-shrink-0"
                  >
                    Bypass LUT
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-[#2d3748] p-4 rounded text-center mb-3 bg-[#070b12] animate-fade-in">
                  <p className="text-gray-500 text-[11px] mb-1 font-semibold">No Custom 3D LUT Staged</p>
                  <p className="text-[9px] text-gray-600">Bypass mode active. Videos will be stitched losslessly without grading.</p>
                </div>
              )}

              {/* Slider for intensity */}
              {lut.active && (
                <div className="bg-[#111726]/80 p-3 rounded border border-[#2d3748]/40 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-gray-400">LUT Grade Blend Intensity:</span>
                    <span className="text-amber-400 font-extrabold text-[12px]">{Math.round(lut.intensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={lut.intensity}
                    onChange={(e) => setLut({ ...lut, intensity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[8px] text-gray-600 uppercase">
                    <span>0% (Flat Source)</span>
                    <span>50% (Mixed Tone)</span>
                    <span>100% (Full Grade)</span>
                  </div>

                  <div className="mt-3 flex items-center space-x-2 border-t border-[#2d3748]/30 pt-2 text-[10px] text-gray-400">
                    <span className="text-gray-500 font-bold uppercase">Color Profile:</span>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="colorspace"
                        checked={lut.colorSpace === 'bt709'}
                        onChange={() => setLut({ ...lut, colorSpace: 'bt709' })}
                        className="accent-amber-500"
                      />
                      <span>Rec.709</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="colorspace"
                        checked={lut.colorSpace === 'srgb'}
                        onChange={() => setLut({ ...lut, colorSpace: 'srgb' })}
                        className="accent-amber-500"
                      />
                      <span>sRGB Web</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="colorspace"
                        checked={lut.colorSpace === 'bt2020'}
                        onChange={() => setLut({ ...lut, colorSpace: 'bt2020' })}
                        className="accent-amber-500"
                      />
                      <span>Wide BT.2020</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form to feed customized LUT filename/path */}
              <form onSubmit={handleCustomLutSubmit} className="mt-3 bg-[#0c1221]/40 border border-[#2d3748]/20 p-2.5 rounded">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-gray-500 block uppercase font-bold">Stage Custom 3D LUT (.cube) Path</label>
                  {LUT_DIR && (
                    <span className="text-amber-400 font-bold select-none border border-amber-500/20 px-1.5 py-0.5 rounded bg-amber-500/5 uppercase text-[8px] font-mono">
                      env: {LUT_DIR}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. ~/LUTs/fuji_velvia_50.cube"
                    value={customLutInput}
                    onChange={(e) => setCustomLutInput(e.target.value)}
                    className="flex-1 bg-[#05080e] border border-[#2d3748] rounded px-2.5 py-1 text-gray-200 outline-none focus:border-amber-500 transition text-[11px]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#78350f] text-[#fcd34d] border border-[#92400e] rounded font-bold hover:bg-[#92400e] transition cursor-pointer text-[10px] uppercase whitespace-nowrap"
                  >
                    Stage LUT
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">
                  Typing a custom LUT file path will load it into the FFmpeg filter graph (e.g. <code className="text-amber-400">lut3d='my_file.cube'</code>).
                </p>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO SYNC & LOOPING ENGINE */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h3 className="text-white font-bold mb-1 flex items-center space-x-1.5 text-xs uppercase text-indigo-400">
                <Music4 size={14} className="text-[#a855f7]" />
                <span>Overlay Musical Accompaniment (FLAC / MP3)</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                Overwrite original video clip commentary or multiplex backing audio. The script handles hardware audio looping (`-stream_loop -1`) to seamlessly fill videographic durations without cutouts.
              </p>

              {audio.name !== 'None' ? (
                <div className="bg-[#131929]/80 p-3 rounded border border-indigo-500/20 space-y-2 animate-fade-in text-[11px]">
                  <div className="flex items-center justify-between border-b border-[#2d3748]/30 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[16px]">🎵</span>
                      <div>
                        <p className="font-extrabold text-gray-200">{audio.name}</p>
                        <p className="text-[9px] text-[#805ad5] uppercase font-bold">Custom Audio Stream Active</p>
                      </div>
                    </div>
                    <button
                      onClick={removeAudioTrack}
                      className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded hover:bg-red-500/25 transition cursor-pointer text-[10px]"
                    >
                      Bypass Audio
                    </button>
                  </div>

                  {/* Audio settings */}
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="uppercase text-gray-500 font-bold">Audio Sync Engine Option:</span>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={audio.syncToVideo}
                          onChange={(e) => setAudio({ ...audio, syncToVideo: e.target.checked })}
                          className="accent-indigo-500"
                        />
                        <span className="text-indigo-400 font-bold">Continuous Loop/Pad</span>
                      </label>
                    </div>

                    {/* Audio Volume Mixer slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Mixer Gain / Volume:</span>
                        <span className="text-indigo-300 font-extrabold">{Math.round(audio.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audio.volume}
                        onChange={(e) => setAudio({ ...audio, volume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#2d3748] p-4 rounded text-center mb-3 bg-[#070b12] animate-fade-in">
                  <p className="text-gray-500 text-[11px] mb-1 font-semibold">No Audio Backtrack Staged</p>
                  <p className="text-[9px] text-gray-600">Bypass mode active. Original video audio streams will be maintained.</p>
                </div>
              )}

              {/* Form to feed customized audio filename */}
              <form onSubmit={handleAudioUploadSimulate} className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-gray-500 block uppercase font-semibold">Stage Custom macOS Backtrack Path</label>
                  {AUDIO_DIR && (
                    <span className="text-indigo-400 font-bold select-none border border-indigo-500/20 px-1.5 py-0.5 rounded bg-indigo-500/5 uppercase text-[8px] font-mono">
                      env: {AUDIO_DIR}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. ~/Audio/scores/mood_synth.mp3"
                    value={simulatedAudioUpload}
                    onChange={(e) => setSimulatedAudioUpload(e.target.value)}
                    className="flex-1 bg-[#05080e] border border-[#2d3748] rounded px-2.5 py-1 text-gray-200 outline-none focus:border-indigo-500 transition text-[11px]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#4c1d95] text-[#d8b4fe] border border-[#6b21a8] rounded font-bold hover:bg-[#5b21b6] transition cursor-pointer text-[10px] uppercase"
                  >
                    Stage Audio
                  </button>
                </div>
              </form>
            </div>

            {/* Timings Sync Box details */}
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                Loop Synchronization Diagnostics
              </h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                When "Continuous Loop/Pad" is active, FFmpeg will map the audio stream natively, using the source stream as the timing master. Short music clips are automatically looped continuously, and the output file is instantly closed and truncated the moment the video file list runs dry (`-shortest` flag).
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: BATCH AND KEYBOARD COMMAND SPECIFICATIONS */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h3 className="text-white font-bold mb-1 flex items-center space-x-1.5 text-xs uppercase text-[#38bdf8]">
                <Settings size={13} className="text-[#38bdf8]" />
                <span>Batch processing specs & macOS Pipeline automation</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                When compiled, the generated command script handles the full queue dynamically. But you can inspect batch options used by industrial CLI pipelines under Apple Silicon:
              </p>

              <div className="space-y-2 text-[10px] font-mono">
                <div className="bg-[#05080e] border border-[#1e293b] p-2 rounded flex items-start space-x-2">
                  <span className="px-1 text-[#f43f5e] font-bold select-none">[v]</span>
                  <div>
                    <h5 className="font-extrabold text-white">Apple VideoToolbox (VT) Accelerator</h5>
                    <p className="text-gray-500">Activates h264_videotoolbox / hevc_videotoolbox API to utilize macOS silicon integrated encoders for up to 10x faster grading speeds.</p>
                  </div>
                </div>

                <div className="bg-[#05080e] border border-[#1e293b] p-2 rounded flex items-start space-x-2">
                  <span className="px-1 text-[#38bdf8] font-bold select-none">[v]</span>
                  <div>
                    <h5 className="font-extrabold text-white">Lossless Concat Demuxer</h5>
                    <p className="text-gray-500">Automatically creates a "mylist.txt" file configuration and utilizes ffmpeg's copy mode to avoid pixel recoding entirely.</p>
                  </div>
                </div>

                <div className="bg-[#05080e] border border-[#1e293b] p-2 rounded flex items-start space-x-2">
                  <span className="px-1 text-[#10b981] font-bold select-none">[v]</span>
                  <div>
                    <h5 className="font-extrabold text-white">Sub-pixel Tetrahedral Interpolations</h5>
                    <p className="text-gray-500">Standard LUT configurations utilize tetrahedral matrix math inside FFmpeg which avoids any chromatic artifact banding in highlights.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Guides and Shortcuts Panel */}
            <div className="border border-[#1e293b] bg-[#070b12] p-3 rounded">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                Available Terminal Nav Panel Shortcuts
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span className="text-gray-400 font-bold">1, 2, 3, 4, 5</span>
                  <span className="text-gray-500">Tabs navigation</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span className="text-gray-400 font-bold">A</span>
                  <span className="text-gray-500">Add sample file</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span className="text-gray-400 font-bold">C</span>
                  <span className="text-gray-500">Reset whole list</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1">
                  <span className="text-gray-400 font-bold">R</span>
                  <span className="text-gray-500">Trigger script run</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3748]/30 pb-1 col-span-2">
                  <span className="text-gray-400 font-bold">D</span>
                  <span className="text-gray-500">Download macOS Terminal executable `.sh`</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

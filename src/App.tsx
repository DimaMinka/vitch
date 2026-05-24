/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { VideoFile, AudioTrack, LutConfig, FfmpegConfig, LogLine } from './types';
import { buildMacOsScript } from './utils';

// Import sub-components
import TerminalHeader from './components/TerminalHeader';
import FileWorkspace from './components/FileWorkspace';
import SettingsPanel from './components/SettingsPanel';
import CommandLinePreview from './components/CommandLinePreview';
import ConsoleLogger from './components/ConsoleLogger';

// Helper to assemble mock initial videos
const INITIAL_VIDEOS: VideoFile[] = [
  {
    id: '1',
    name: 'clip_01_tokyo_broll.mov',
    duration: 15.2,
    size: 94.6,
    resolution: '1920x1080',
    fps: 23.98,
    codec: 'ProRes 422',
  },
  {
    id: '2',
    name: 'clip_02_narrator_intro.mp4',
    duration: 28.5,
    size: 61.2,
    resolution: '1920x1080',
    fps: 23.98,
    codec: 'h264',
  },
  {
    id: '3',
    name: 'clip_03_temple_sunset.mov',
    duration: 11.4,
    size: 160.4,
    resolution: '3840x2160',
    fps: 29.97,
    codec: 'ProRes 422 HQ',
  },
];

const PRESET_TILES: Omit<VideoFile, 'id'>[] = [
  { name: 'broll_shibuya_foggy_1080p.mov', duration: 12.4, size: 84.2, resolution: '1920x1080', fps: 29.97, codec: 'ProRes 422' },
  { name: 'a_roll_speech_narration.mp4', duration: 45.1, size: 124.7, resolution: '1920x1080', fps: 23.98, codec: 'h264' },
  { name: 'broll_tokyo_underground_raw.mp4', duration: 8.3, size: 61.2, resolution: '1920x1080', fps: 23.98, codec: 'h264' },
  { name: 'drone_landscape_mountains.mov', duration: 18.0, size: 240.5, resolution: '3840x2160', fps: 59.94, codec: 'ProRes 422 HQ' },
];

export default function App() {
  // State variables for core configurations
  const [videos, setVideos] = useState<VideoFile[]>(INITIAL_VIDEOS);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>('1');
  const [activeTab, setActiveTab] = useState<number>(1);

  const [audio, setAudio] = useState<AudioTrack>({
    name: 'background_cinematic_pulse.flac',
    duration: 180,
    loop: true,
    volume: 0.6,
    syncToVideo: true,
  });

  const [lut, setLut] = useState<LutConfig>({
    active: true,
    fileName: 'hollywood_teal_orange_3d.cube',
    intensity: 0.8,
    colorSpace: 'bt709',
  });

  const [config, setConfig] = useState<FfmpegConfig>({
    outputCodec: 'libx264',
    preset: 'medium',
    crf: 23,
    scaleWidth: 'source',
    scaleHeight: 'source',
    audioSyncEnabled: true,
  });

  // Simulator Logs state
  const [logs, setLogs] = useState<LogLine[]>([
    {
      id: 'log-1',
      timestamp: '11:45:00',
      type: 'info',
      text: 'Initializing TUI video compiler engine...',
    },
    {
      id: 'log-2',
      timestamp: '11:45:01',
      type: 'success',
      text: 'Detected macOS operating environment. Terminal buffers ready.',
    },
    {
      id: 'log-3',
      timestamp: '11:45:02',
      type: 'info',
      text: 'Directory scan completed. Found 3 media descriptors in target folder ~/Movies/...',
    },
  ]);

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<number>(0);

  // Helper log emitter
  const logMessage = (type: LogLine['type'], text: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${crypto.randomUUID()}`,
        timestamp,
        type,
        text,
      },
    ]);
  };

  // ──────────────────────────────────────────────
  // KEYBOARD SHORTCUTS CONTROLLER
  // ──────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is inside form input elements
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')) {
        return;
      }

      const key = e.key.toUpperCase();

      if (['1', '2', '3', '4'].includes(key)) {
        const tabNum = parseInt(key);
        setActiveTab(tabNum);
        logMessage('info', `Hotkey triggered: Switch viewport panel to TAB [${tabNum}]`);
      } else if (key === 'A') {
        // Add random video
        const randomPreset = PRESET_TILES[Math.floor(Math.random() * PRESET_TILES.length)];
        const newVideo: VideoFile = {
          id: crypto.randomUUID(),
          ...randomPreset,
          name: `hotkey_${Math.floor(Math.random() * 900) + 100}_${randomPreset.name}`,
        };
        setVideos((prev) => [...prev, newVideo]);
        logMessage('cmd', `Hotkey [A]: Added clip descriptor: ${newVideo.name}`);
      } else if (key === 'C') {
        setVideos([]);
        logMessage('warn', `Hotkey [C]: Resetting current stitch queue to initial empty state.`);
      } else if (key === 'R') {
        logMessage('info', `Hotkey [R]: Staging compilation chain build!`);
        handleRunCompile();
      } else if (key === 'D') {
        logMessage('success', `Hotkey [D]: Compiling shell bundle and preparing local download payload...`);
        handleDownloadScript();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videos, audio, lut, config, isCompiling]);

  // Calculations for general headers
  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);
  const totalSize = videos.reduce((acc, v) => acc + v.size, 0);

  // ──────────────────────────────────────────────
  // CORE FUNCTIONS
  // ──────────────────────────────────────────────

  const handleAddVideo = (newVideo: VideoFile) => {
    setVideos((prev) => [...prev, newVideo]);
    logMessage('info', `Appended new movie element to timeline: ${newVideo.name}`);
  };

  const handleRemoveVideo = (id: string) => {
    const file = videos.find((v) => v.id === id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedVideoId === id) {
      setSelectedVideoId(null);
    }
    if (file) {
      logMessage('warn', `Removed clip descriptor from compilation timeline: ${file.name}`);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setVideos((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    logMessage('info', `Reordered timeline clip precedence. Shuffled item [index: ${index}] higher.`);
  };

  const handleMoveDown = (index: number) => {
    if (index === videos.length - 1) return;
    setVideos((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    logMessage('info', `Reordered timeline clip precedence. Shuffled item [index: ${index}] lower.`);
  };

  const handleClearQueue = () => {
    setVideos([]);
    logMessage('warn', `Stitch queue is cleared. Compilation is now offline until files are matched.`);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Triggers compilation simulator
  const handleRunCompile = () => {
    if (videos.length === 0) {
      logMessage('error', 'Cannot compile! Stitch timeline queue is completely empty. Add elements first.');
      return;
    }
    if (isCompiling) return;

    setIsCompiling(true);
    setCompileProgress(0);
    logMessage('cmd', 'Initializing FFmpeg stitching assembler pipeline...');

    const isLossless = config.outputCodec === 'copy' && !lut.active;

    // Log step stages
    setTimeout(() => logMessage('info', 'Auditing source streams & file format parameters...'), 300);
    setTimeout(() => {
      if (isLossless) {
        logMessage('success', 'Optimal parameters captured: Direct Lossless Stream Copy active.');
      } else {
        logMessage('info', 'Generating tetrahedral interpolations matrices. Allocating Apple cores...');
      }
    }, 800);

    setTimeout(() => {
      if (audio.name !== 'None') {
        logMessage('info', `Staging flac music background loop: ${audio.name} (Multiplex shortests)`);
      }
    }, 1400);

    // Timer logic to tick progress
    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 10;
      setCompileProgress(currentProg);

      // Print status at various percentage ticks
      if (currentProg === 30) {
        logMessage('info', isLossless ? 'Checking directory file blocks...' : 'Encoding frame buffers with CRF quality...');
      } else if (currentProg === 60) {
        logMessage('info', isLossless ? 'Combining bitstreams on local sectors...' : 'Multiplexing audio backing vectors...');
      } else if (currentProg === 90) {
        logMessage('info', 'Writing target container parameters... [Completed container: MP4]');
      }

      if (currentProg >= 100) {
        clearInterval(interval);
        setIsCompiling(false);
        logMessage('success', isLossless 
          ? 'SUCCESS! Stream-copy stitched video generated instant file under ~/Movies/merged_output.mp4 (Lossless Mode)' 
          : 'SUCCESS! Graded cinematic stitched video render ready. Saved file under ~/Movies/output_graded_assembler.mp4'
        );
      }
    }, 250);
  };

  // Triggers physical file download of bash script
  const handleDownloadScript = () => {
    if (videos.length === 0) {
      logMessage('error', 'Cannot compile executable! Add video files to queue first.');
      return;
    }

    const scriptContent = buildMacOsScript(videos, audio, lut, config);
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assemble.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logMessage('success', 'Generated Apple Silicon execution payload wrapper: assemble.sh. Check Downloads/ folder!');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-gray-200 font-mono flex flex-col antialiased selection:bg-emerald-500/30 selection:text-white" id="main-tui-wrapper">
      
      {/* Visual background lines to amplify retro TUI / Terminal feel */}
      <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none bg-gradient-to-b from-[#0e1628]/40 to-transparent"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-[1380px] mx-auto p-4 flex flex-col flex-1 z-10 space-y-4">
        
        {/* Retro Header with status indicators */}
        <TerminalHeader
          activeTab={activeTab}
          totalDuration={totalDuration}
          totalSize={totalSize}
          fileCount={videos.length}
        />

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left panel (File Workspace / Directory Scan Simulator) */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <FileWorkspace
              videos={videos}
              onAddVideo={handleAddVideo}
              onRemoveVideo={handleRemoveVideo}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onClearQueue={handleClearQueue}
              selectedVideoId={selectedVideoId}
              setSelectedVideoId={setSelectedVideoId}
            />
          </div>

          {/* Right panel (Settings hub & tab configurations) */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-[480px]">
            <SettingsPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              audio={audio}
              setAudio={setAudio}
              lut={lut}
              setLut={setLut}
              config={config}
              setConfig={setConfig}
              onRunCompile={handleRunCompile}
            />
          </div>
        </div>

        {/* FFmpeg live statements output code block */}
        <CommandLinePreview
          videos={videos}
          audio={audio}
          lut={lut}
          config={config}
        />

        {/* Simulated Command Output log frame */}
        <ConsoleLogger
          logs={logs}
          onClearLogs={handleClearLogs}
          onDownloadScript={handleDownloadScript}
          isCompiling={isCompiling}
          compileProgress={compileProgress}
        />

      </div>
    </div>
  );
}

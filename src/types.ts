export interface VideoFile {
  id: string;
  name: string;
  duration: number; // in seconds
  size: number; // in MB
  resolution: string;
  fps: number;
  codec: string;
}

export interface AudioTrack {
  name: string;
  duration: number; // in seconds
  loop: boolean;
  volume: number; // 0 to 1
  syncToVideo: boolean;
}

export interface LutConfig {
  active: boolean;
  fileName: string;
  intensity: number; // 0 to 1
  colorSpace: 'srgb' | 'bt709' | 'bt2020';
}

export interface FfmpegConfig {
  outputCodec: 'copy' | 'libx264' | 'libx265' | 'prores';
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  crf: number; // 0-51 (lower is better, e.g. 18-23 or copy for lossless)
  scaleWidth: number | 'source';
  scaleHeight: number | 'source';
  audioSyncEnabled: boolean;
}

export interface LogLine {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'success' | 'error' | 'cmd';
  text: string;
}

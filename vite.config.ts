import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import { defineConfig } from 'vite';

function getMediaMetadata(filePath: string) {
  const defaults = {
    resolution: '1920x1080',
    fps: 24,
    codec: filePath.toLowerCase().endsWith('.mov') ? 'prores' : 'h264',
    duration: 15.0
  };

  try {
    const result = spawnSync('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name,width,height,avg_frame_rate,duration',
      '-show_entries', 'format=duration',
      '-of', 'json',
      filePath
    ], { encoding: 'utf8', timeout: 3000 });
    
    if (result.status !== 0 || !result.stdout) {
      return defaults;
    }
    
    const metadata = JSON.parse(result.stdout);
    const stream = metadata.streams?.[0] || {};
    const format = metadata.format || {};
    
    // 1. Duration
    let duration = parseFloat(stream.duration || format.duration || '');
    if (isNaN(duration) || duration <= 0) {
      duration = defaults.duration;
    } else {
      duration = parseFloat(duration.toFixed(1));
    }
    
    // 2. Resolution
    let resolution = defaults.resolution;
    if (stream.width && stream.height) {
      resolution = `${stream.width}x${stream.height}`;
    }
    
    // 3. FPS
    let fps = defaults.fps;
    if (stream.avg_frame_rate && stream.avg_frame_rate !== '0/0') {
      const parts = stream.avg_frame_rate.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (den > 0) {
          fps = parseFloat((num / den).toFixed(2));
        }
      }
    }
    
    // 4. Codec
    let codec = stream.codec_name || defaults.codec;
    if (codec.toLowerCase().includes('prores')) {
      codec = 'prores';
    } else if (codec.toLowerCase().includes('hevc') || codec.toLowerCase().includes('h265')) {
      codec = 'h265';
    } else if (codec.toLowerCase().includes('h264')) {
      codec = 'h264';
    }
    
    return { resolution, fps, codec, duration };
  } catch (e) {
    return defaults;
  }
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'directory-scanner-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api/scan')) {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const dirPath = url.searchParams.get('path');
              
              if (!dirPath) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Path parameter is required' }));
                return;
              }
              
              try {
                // Resolve tilde if present
                let resolvedPath = dirPath;
                if (dirPath.startsWith('~')) {
                  resolvedPath = path.join(process.env.HOME || '', dirPath.slice(1));
                }
                
                if (!fs.existsSync(resolvedPath)) {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Directory does not exist' }));
                  return;
                }
                
                const stats = fs.statSync(resolvedPath);
                if (!stats.isDirectory()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Path is not a directory' }));
                  return;
                }
                
                const files = fs.readdirSync(resolvedPath);
                // Filter video files
                const videoExtensions = ['.mp4', '.mov', '.m4v', '.mkv', '.avi', '.MOV', '.MP4'];
                const videoFiles = [];
                
                for (const file of files) {
                  const ext = path.extname(file).toLowerCase();
                  if (videoExtensions.includes(ext)) {
                    const fullFilePath = path.join(resolvedPath, file);
                    const fileStats = fs.statSync(fullFilePath);
                    
                    const metadata = getMediaMetadata(fullFilePath);
                    
                    videoFiles.push({
                      name: file,
                      size: parseFloat((fileStats.size / (1024 * 1024)).toFixed(2)), // in MB
                      ...metadata
                    });
                  }
                }
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ path: resolvedPath, files: videoFiles }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

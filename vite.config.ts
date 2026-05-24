import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

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
                    
                    videoFiles.push({
                      name: file,
                      size: parseFloat((fileStats.size / (1024 * 1024)).toFixed(2)), // in MB
                      resolution: '1920x1080', // Default fallback
                      fps: 24, // Default fallback
                      codec: ext.slice(1) === 'mov' ? 'prores' : 'h264', // Estimate
                      duration: 15.0 // Default fallback duration
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

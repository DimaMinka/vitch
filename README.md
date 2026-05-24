# Vitch 🎬

An interactive terminal-styled macOS desktop workspace to configure, preview, and build high-performance FFmpeg video compilation commands and executable scripts (`.sh`). Optimize on-the-fly cinematic color corrections, audio backing loops, and lossless multi-file stitching.

---

## 🚀 Key Capabilities & Processing Strategies

### 1. Zero-Loss Stream Stitching (Lossless Demux Concat)
* **Goal**: Assemble video segments in milliseconds without decoding or re-compressing streams (0% CPU quality degradation).
* **Command Pattern**:
  ```bash
  ffmpeg -f concat -safe 0 -i list.txt -c copy -y merged_output.mp4
  ```
* **Constraint**: Source video file vectors must share matching aspects, resolutions, pixel-formats, and frame rates.

### 2. On-the-Fly Cinematic grading (LUT Tetrahedral Interpolation)
* **Goal**: Converts Log profile flat gamas / S-Log to Rec.709 with professional Cinematic 3D LUT look-up filters (`.cube`).
* **Technical filter formulation**:
  ```bash
  ffmpeg -i [inputs] -filter_complex "[v]scale=iw:ih,lut3d='vintage_gold.cube':interp=tetrahedral,blend=all_expr='A*(1-intensity)+B*(intensity)'"
  ```

### 3. Integrated Looping backtrack Sync
* **Goal**: Overlays customized WAV / FLAC / MP3 music beds over combined videos, automatically repeating to prevent early silence.
* **Technique**: Employs `-stream_loop -1` together with `-shortest` to seal target envelopes precisely at matching seconds.

---

## 🛠️ Core Compiler Architecture Improvements

### 1. Robust Path Resolution Engine (`resolvePath`)
* **Auto-Quoting Sanitization**: Automatically strips surrounding single (`'`) and double (`"`) quotes from custom user paths.
* **Absolute Path Priority**: Seamlessly detects fully qualified paths (starting with `/`, `~`, `./` or Windows drive roots) and prioritizes them, completely ignoring defaults from `.env`.
* **File-to-Directory Fallbacks**: If environment variables (like `VITE_LUT_DIR`) point directly to a file instead of a directory, the engine extracts the parent directory path automatically to resolve filenames.

### 2. High-Performance Filter Chain (Zero-Copy Pass-Through)
* **Stream-Mapping Correction**: Eliminated redundant `split` filters in FFmpeg that previously duplicated video tracks, enabling correct playback in QuickTime and other native macOS players.
* **Speed & Compression Optimization**: Removed parallel stream encoding, saving up to 50% CPU encoding cycles and halving output file size with zero quality loss.
* **Core Pass-Through**: Employs FFmpeg's standard `null` video filter for safe stream pad renaming without duplication.

### 3. Dynamic Command Assembly Engine
* **Syntactic Safety**: Command assembly is executed procedurally in TypeScript prior to Bash template interpolation.
* **Dangling Backslash Prevention**: Eliminates bash newline compilation bugs (such as `./assemble.sh: -c:v: command not found`) under extreme pipeline configuration states (e.g., combining silent drone footage with bypassed backing audio).

---

## ⌨️ Dashboard Interactive Keyboard Shortcuts

To navigate the terminal wrapper with lightning efficiency, use standard native Hotkeys:

| Key | Core Action | Area of Control |
|---|---|---|
| **`1`** | Focus **[1: FFmpeg Codec]** tab | Quality & presets settings |
| **`2`** | Focus **[2: LUT Grade]** tab | Cinematic 3D grading matrices |
| **`3`** | Focus **[3: Audio Sync]** tab | Audio overlay & volumes controls |
| **`4`** | Focus **[4: Batch Specs]** tab | High throughput CLI guidelines |
| **`A`** | **Add Random Sim Clip** | Timelines |
| **`C`** | **Reset Timeline Queue** | Purges active files workspace |
| **`R`** | **Simulate Process Render** | Toggles simulated CLI encoding task |
| **`D`** | **Download `assemble.sh`** | Emits a native executable macOS shell script |

---

## 💻 Native macOS Darwin Execution Runbook

Once your sequence parameters are compiled, export the fully integrated POSIX script directly:

1. Click **`Download assemble.sh`** inside the app.
2. Put `assemble.sh` inside the directory containing your source MP4/MOV files.
3. Launch macOS **Terminal.app** and navigate to your directory:
   ```bash
   cd ~/Movies/RawProjects/MyFolder/
   ```
4. Modify permissions to allow execution:
   ```bash
   chmod +x assemble.sh
   ```
5. Dispatch the compiler pipeline:
   ```bash
   ./assemble.sh
   ```

### 📋 Output Process Logs Auditor
The macOS script targets all operation parameters and system validations directly to a local log, ensuring error tracking:
```bash
tail -f tui_video_assembler.log
```
Each entry captures exact timelines, verification status of inputs, loaded audio samples, and standard FFmpeg compiler metrics.

# Vitch 🎬

An interactive terminal-styled macOS desktop workspace to configure, preview, and build high-performance FFmpeg video compilation commands and executable scripts (`.sh`). Optimize on-the-fly cinematic color corrections, audio backing loops, and lossless multi-file stitching.

---

## 🚀 GitHub Pages Deployment

We have configured two robust options to deploy **Vitch** to GitHub Pages:

### Option A: Automated Build & Deploy via GitHub Actions (Recommended)
We have integrated a fully automated GitHub Actions workflow (`deploy.yml`) that compiles the full React + Vite application every time you push code to GitHub.

1. **Push your code** to your repository's main branch (`main` or `master`). This automatically runs the GitHub Action to build and export the production app into a new branch called `gh-pages`.
2. Go to your **GitHub Repository page** on the web.
3. Click on **Settings** (the gear icon) at the top menu.
4. Navigate to **Pages** on the left sidebar under the *Code and automation* section.
5. Under **Build and deployment**, locate the **Source** dropdown and select **Deploy from a branch**.
6. In the **Branch** selection, choose `gh-pages` and select `/ (root)` folder, then click **Save**.
7. GitHub will deploy the interactive, fully featured Vitch app immediately! (This takes about 1-2 minutes).

### Option B: Hand-crafted Standalone HTML Single-file App (Fall-back)
If you prefer a lightweight deployment without automated steps:
1. Find the local file `/github-pages-index.html` in your project folder.
2. Direct-upload it to your primary branch or copy the content and write it into a file named exactly `index.html`.
3. Set your GitHub Pages branch source to point directly to that branch, under **Repository Settings > Pages**.

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

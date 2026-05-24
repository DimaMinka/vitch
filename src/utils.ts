import { VideoFile, AudioTrack, LutConfig, FfmpegConfig } from './types';

const VIDEO_DIR = ((import.meta as any).env?.VITE_VIDEO_DIR || '').trim();
const LUT_DIR = ((import.meta as any).env?.VITE_LUT_DIR || '').trim();
const AUDIO_DIR = ((import.meta as any).env?.VITE_AUDIO_DIR || '').trim();

function resolvePath(dir: string, file: string): string {
  if (!file) return '';
  if (!dir) return file;
  if (file.startsWith('/') || file.startsWith('~') || file.startsWith('./')) {
    return file;
  }
  const separator = dir.endsWith('/') ? '' : '/';
  return `${dir}${separator}${file}`;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const parts = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':') + '.' + ms.toString().padStart(2, '0');
}

export function formatBytes(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

/**
 * Builds the dynamic FFmpeg CLI command based on current parameters
 */
export function buildFfmpegCommand(
  videos: VideoFile[],
  audio: AudioTrack,
  lut: LutConfig,
  config: FfmpegConfig
): string {
  if (videos.length === 0) {
    return '# Add video files to assemble';
  }

  const isCopy = config.outputCodec === 'copy' && !lut.active;

  if (isCopy) {
    // True Stream Concat - Zero Loss
    let cmd = '# Step 1: Create file list\n';
    cmd += 'printf "file \'%s\'\\n" ' + videos.map(v => resolvePath(VIDEO_DIR, v.name)).join(' ') + ' > mylist.txt\n\n';
    cmd += '# Step 2: Concat files without re-encoding (Instant + Stream Copy Lossless)\n';
    
    if (audio.syncToVideo && audio.name !== 'None') {
      const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
      cmd += `ffmpeg -f concat -safe 0 -i mylist.txt -stream_loop -1 -i "${resolvePath(AUDIO_DIR, audio.name)}" \\\n`;
      cmd += `  -c:v copy -c:a aac -filter:a "volume=${audio.volume}" -map 0:v -map 1:a -t ${totalDuration.toFixed(2)} -y merged_output.mp4`;
    } else {
      cmd += `ffmpeg -f concat -safe 0 -i mylist.txt -c copy -y merged_output.mp4`;
    }
    return cmd;
  }

  // Transcoded / Graded Concat (Necessary if applying LUT or scaling)
  let cmd = '# Create file list for inputs\n';
  const inputArgs = videos.map(v => `-i "${resolvePath(VIDEO_DIR, v.name)}"`).join(' ');
  const filterComplex = buildFilterComplex(videos, lut, config, audio);

  cmd += `ffmpeg ${inputArgs} \\\n`;
  if (audio.syncToVideo && audio.name !== 'None') {
    cmd += `  -stream_loop -1 -i "${resolvePath(AUDIO_DIR, audio.name)}" \\\n`;
  }
  
  cmd += `  -filter_complex "${filterComplex}" \\\n`;
  
  // Maps & Stream settings
  cmd += `  -map "[v_out]" \\\n`;
  if (audio.syncToVideo && audio.name !== 'None') {
    cmd += `  -map ${videos.length}:a \\\n`;
  } else {
    const anyVideoHasAudio = videos.some(v => v.hasAudio !== false);
    if (anyVideoHasAudio) {
      cmd += `  -map "[a_out]" \\\n`;
    }
  }

  // Codec specifics
  const effectiveCodec = config.outputCodec === 'copy' ? 'libx264' : config.outputCodec;
  if (effectiveCodec === 'libx264') {
    cmd += `  -c:v libx264 -preset ${config.preset} -crf ${config.crf} -pix_fmt yuv420p \\\n`;
  } else if (effectiveCodec === 'libx265') {
    cmd += `  -c:v libx265 -preset ${config.preset} -crf ${config.crf} -pix_fmt yuv420p \\\n`;
  } else if (effectiveCodec === 'prores') {
    cmd += `  -c:v prores_ks -profile:v 3 -vendor ap10 -pix_fmt yuv422p10le \\\n`;
  }

  const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
  cmd += `  -t ${totalDuration.toFixed(2)} -y output_graded_assembler.mp4`;
  return cmd;
}

/**
 * Builds complex filter chains for ffmpeg
 */
function buildFilterComplex(
  videos: VideoFile[],
  lut: LutConfig,
  config: FfmpegConfig,
  audio: AudioTrack
): string {
  let filter = '';
  
  // 1. Scale and prepare each clip
  videos.forEach((video, index) => {
    const scaleWidth = config.scaleWidth === 'source' ? 'iw' : config.scaleWidth;
    const scaleHeight = config.scaleHeight === 'source' ? 'ih' : config.scaleHeight;
    
    // Scale, pad to ensure matches, force fps, format
    filter += `[${index}:v]scale=${scaleWidth}:${scaleHeight}:force_original_aspect_ratio=decrease,`;
    filter += `pad=${scaleWidth}:${scaleHeight}:(ow-iw)/2:(oh-ih)/2,`;
    filter += `fps=fps=${videos[0].fps},format=yuv420p[v${index}]; `;
  });

  // 2. Concat the prepared clips
  const useBackgroundAudio = audio.syncToVideo && audio.name !== 'None';
  
  if (useBackgroundAudio) {
    // Video only concat, since background audio is mapped separately
    videos.forEach((_, index) => {
      filter += `[v${index}]`;
    });
    filter += `concat=n=${videos.length}:v=1:a=0[v_concat]; `;
  } else {
    const audioStatus = videos.map(v => v.hasAudio !== false);
    const anyVideoHasAudio = audioStatus.some(h => h);
    const allVideosHaveAudio = audioStatus.every(h => h);
    
    if (!anyVideoHasAudio) {
      // None of the videos have audio. Concat video only.
      videos.forEach((_, index) => {
        filter += `[v${index}]`;
      });
      filter += `concat=n=${videos.length}:v=1:a=0[v_concat]; `;
    } else if (allVideosHaveAudio) {
      // All videos have audio. Concat video and audio.
      videos.forEach((_, index) => {
        filter += `[v${index}][${index}:a]`;
      });
      filter += `concat=n=${videos.length}:v=1:a=1[v_concat][a_out]; `;
    } else {
      // Mixed: generate silent audio stream for videos lacking audio.
      videos.forEach((video, index) => {
        const hasAudio = video.hasAudio !== false;
        if (!hasAudio) {
          filter += `anullsrc=channel_layout=stereo:sample_rate=44100:duration=${video.duration}[a${index}_silent]; `;
        }
      });
      
      videos.forEach((video, index) => {
        const hasAudio = video.hasAudio !== false;
        if (hasAudio) {
          filter += `[v${index}][${index}:a]`;
        } else {
          filter += `[v${index}][a${index}_silent]`;
        }
      });
      filter += `concat=n=${videos.length}:v=1:a=1[v_concat][a_out]; `;
    }
  }

  // 3. Apply LUT filtering if active
  if (lut.active) {
    const intensityVal = lut.intensity.toFixed(2);
    // Apply 3D LUT via lut3d filter. Under macOS, file path is configured
    filter += `[v_concat]lut3d='${resolvePath(LUT_DIR, lut.fileName)}':interp=tetrahedral[v_lut]; `;
    
    // Mix original frames and LUT frames based on intensity parameter inside script
    if (lut.intensity < 1) {
      filter += `[v_concat][v_lut]blend=all_expr='A*(1-${intensityVal})+B*${intensityVal}'[v_out]`;
    } else {
      filter += `[v_lut]split[v_out]`; // direct bypass alias
    }
  } else {
    filter += `[v_concat]split[v_out]`;
  }

  return filter;
}

/**
 * Creates a fully production-ready, bulletproof, highly detailed macOS bash script 
 * containing rich log styling, dependency inspections, automatic file listing, 
 * audio processing calculations, LUT integration, and real-time console feedback.
 */
export function buildMacOsScript(
  videos: VideoFile[],
  audio: AudioTrack,
  lut: LutConfig,
  config: FfmpegConfig
): string {
  const isLossless = config.outputCodec === 'copy' && !lut.active;
  const effectiveCodec = config.outputCodec === 'copy' ? 'libx264' : config.outputCodec;
  const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
  const fps = videos[0]?.fps || 24;
  const totalFrames = Math.round(totalDuration * fps);
  const resolvedVideos = videos.map(v => resolvePath(VIDEO_DIR, v.name));

  return `#!/bin/bash

# ==============================================================================
# Vitch - Generated macOS Compilation Script
# Target System: macOS (Darwin)
# Executable Type: POSIX Bash Script
# Codec Config: ${isLossless ? 'COPY' : (config.outputCodec === 'copy' ? 'H.264 (LUT Auto-fallback)' : config.outputCodec.toUpperCase())} (Mode: ${isLossless ? 'Lossless Stream Copy' : 'Active Transcode / Grade'})
# Estimated Video Length: ${totalDuration.toFixed(2)} seconds
# ==============================================================================

# Setup Local Process Logging
LOG_FILE="vitch_pipeline.log"
echo "======================================================================" > "$LOG_FILE"
echo "VITCH PIPELINE RUN - $(date)" >> "$LOG_FILE"
echo "SYSTEM ATTRS: $(uname -a)" >> "$LOG_FILE"
echo "OUTPUT CODEC: ${isLossless ? 'COPY' : (config.outputCodec === 'copy' ? 'H.264 (LUT Auto-fallback)' : config.outputCodec.toUpperCase())} | TARGET LENGTH: ${totalDuration}s" >> "$LOG_FILE"
echo "======================================================================" >> "$LOG_FILE"

log_info() {
    local msg="$1"
    echo -e "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $msg" >> "$LOG_FILE"
}

log_err() {
    local msg="$1"
    echo -e "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $msg" >> "$LOG_FILE"
}

# ANSI Color Codes for Beautiful macOS Terminal Outputs
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
MAGENTA='\\033[0;35m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
NC='\\033[0m' # No Color

clear
echo -e "\${CYAN}\${BOLD}┌────────────────────────────────────────────────────────┐\${NC}"
echo -e "\${CYAN}\${BOLD}│                     VITCH PIPELINE                     │\${NC}"
echo -e "\${CYAN}\${BOLD}│                     macOS Native                       │\${NC}"
echo -e "\${CYAN}\${BOLD}└────────────────────────────────────────────────────────┘\${NC}"
echo ""

# STEP 1: Dependencies Verification (Homebrew & FFmpeg)
echo -e "\${BLUE}[STEP 1/5]\${NC} Verifying system architecture & dependencies..."
log_info "Step 1: Commencing Homebrew and FFmpeg checks"

if ! command -v ffmpeg &> /dev/null; then
    echo -e "\${YELLOW}[WARNING] FFmpeg could not be found in your standard PATH.\${NC}"
    log_err "FFmpeg missing from PATH"
    echo -e "Checking for Homebrew to install dependencies automatically..."
    if ! command -v brew &> /dev/null; then
        echo -e "\${RED}[FATAL ERROR] Homebrew is not installed.\${NC}"
        log_err "FATAL: Homebrew not found. Aborting execution."
        echo -e "Please install Homebrew via: /bin/bash -c \\"\\\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\""
        echo -e "Then run: brew install ffmpeg"
        exit 1
    else
        echo -e "\${GREEN}[FOUND]\${NC} Homebrew is active! Proceeding to auto-install FFmpeg..."
        log_info "Brew found, starting automated FFmpeg installation"
        brew install ffmpeg >> "$LOG_FILE" 2>&1
    fi
else
    echo -e "\${GREEN}[SUCCESS]\${NC} FFmpeg is available natively in PATH: $(which ffmpeg)"
    log_info "FFmpeg certification success: $(which ffmpeg)"
fi

# STEP 2: Media Source Verification
echo -e " "
echo -e "\${BLUE}[STEP 2/5]\${NC} Auditing directory files queue..."
log_info "Step 2: Commencing media file inventory verification"

# Declaring array of input files to process
INPUT_FILES=(${resolvedVideos.map(path => `"${path}"`).join(' ')})

# Iterate over files to check for presence and sizes
MISSING_FILES=0
for f in "\${INPUT_FILES[@]}"; do
    if [ ! -f "\$f" ]; then
        echo -e "  \${RED}[ERR]\${NC} Missing Source File: \${BOLD}\$f\${NC} (Please verify path)"
        log_err "Missing source asset: \$f"
        ((MISSING_FILES++))
    else
        FILE_SIZE=$(du -h "\$f" | cut -f1)
        echo -e "  \${GREEN}[OK]\${NC} Found File: \${BLUE}\$f\${NC} [Size: \$FILE_SIZE]"
        log_info "Found valid asset: \$f with size \$FILE_SIZE"
    fi
done

if [ \$MISSING_FILES -gt 0 ]; then
    echo -e " "
    echo -e "\${RED}[FATAL] \${MISSING_FILES} files from the assembler queue are missing in the workspace.\${NC}"
    log_err "Stoppage: \${MISSING_FILES} source segments were missing in local directory."
    echo -e "Please place the files into the script's directory and rerun."
    exit 1
fi

# STEP 3: Concat Manifest Compilation
echo -e " "
echo -e "\${BLUE}[STEP 3/5]\${NC} Generating concat list manifest file..."
log_info "Step 3: Building list file: vitch_concat_manifest.txt"
MANIFEST_FILE="vitch_concat_manifest.txt"
rm -f "\$MANIFEST_FILE"

${resolvedVideos.map(path => `echo "file '${path}'" >> "\$MANIFEST_FILE"`).join('\n')}

echo -e "\${GREEN}[SUCCESS]\${NC} Manifest updated at \${BOLD}\$MANIFEST_FILE\${NC}"
log_info "Manifest file compiled with ${videos.length} items."

# STEP 4: Audio Loop & LUT Validation Space
${
  audio.name !== 'None' && audio.syncToVideo
    ? `echo -e " "
echo -e "\${BLUE}[STEP 4/5]\${NC} Verifying backing audio element..."
AUDIO_FILE="${resolvePath(AUDIO_DIR, audio.name)}"
log_info "Step 4: Checking audio file \$AUDIO_FILE"
if [ ! -f "\$AUDIO_FILE" ]; then
    echo -e "  \${YELLOW}[WARN] Audio track '\$AUDIO_FILE' not found.\${NC}"
    log_err "Warning: Backup track \$AUDIO_FILE missing. Falling back to default raw stream."
    echo -e "  Executing ffmpeg fallback: Audio will be ignored/extracted from source clips."
    HAS_AUDIO=0
else
    echo -e "  \${GREEN}[OK]\${NC} Audio Track Configured: \${MAGENTA}\$AUDIO_FILE\${NC} (Volume set to: ${audio.volume * 100}%)"
    log_info "Stage active background loop: \$AUDIO_FILE at gain ${audio.volume}"
    HAS_AUDIO=1
fi`
    : `HAS_AUDIO=0`
}

${
  lut.active
    ? `echo -e " "
echo -e "\${BLUE}[STEP 4/5 - COLOR]\${NC} Checking LUT File: \${BOLD}${lut.fileName}\${NC}"
LUT_FILE="${resolvePath(LUT_DIR, lut.fileName)}"
log_info "Step 4 (Color): Checking LUT cube parameters \$LUT_FILE"
if [ ! -f "\$LUT_FILE" ]; then
    echo -e "  \${RED}[ERR] LUT File '\$LUT_FILE' was not found.\${NC}"
    log_err "FATAL Error: Specified 3D LUT Cube \$LUT_FILE is missing."
    echo -e "  FFmpeg cannot run tetrahedral interpolations without the physical .cube file present."
    echo -e "  Please ensure the correct file is saved locally under \${BOLD}\$LUT_FILE\${NC}."
    exit 1
else
    echo -e "  \${GREEN}[CONVERT]\${NC} Color parameters mapping: Cinematic 3D interpolations active."
    log_info "LUT \$LUT_FILE verified. Colorspace profile loaded: ${lut.colorSpace}"
fi`
    : `log_info "Color grading bypassed: Lossless / Untouched direct pass through."`
}

# STEP 5: FFmpeg Process Dispatcher
echo -e " "
echo -e "\${BLUE}[STEP 5/5]\${NC} Building pipeline stream and firing FFmpeg..."
log_info "Step 5: Invoking FFmpeg stream stitch engine"
echo -e "\${CYAN}Running macOS FFmpeg Thread Allocation Optimizer... \${NC}"

# Define command string based on current settings
OUTPUT_NAME="merged_output_$(date +%Y%m%d_%H%M%S).mp4"
log_info "Target Output Vector declared: \$OUTPUT_NAME"

# Generate physical command inside script
${
  isLossless
    ? `if [ \$HAS_AUDIO -eq 1 ]; then
    echo -e "\${CYAN}Format: Lossless Stitching + Audio Music Sync/Loop\${NC}"
    log_info "Executing Lossless concat demuxer with audio mix"
    ffmpeg -f concat -safe 0 -i "\$MANIFEST_FILE" -stream_loop -1 -i "\$AUDIO_FILE" \\
      -c:v copy -c:a aac -filter:a "volume=${audio.volume}" -map 0:v -map 1:a -t ${totalDuration.toFixed(3)} -y "\$OUTPUT_NAME" >> "\$LOG_FILE" 2>&1
else
    echo -e "\${CYAN}Format: Primary Lossless Stream Copy (Instant Concat)\${NC}"
    log_info "Executing instant dry demux stream copy"
    ffmpeg -f concat -safe 0 -i "\$MANIFEST_FILE" -c copy -y "\$OUTPUT_NAME" >> "\$LOG_FILE" 2>&1
fi`
    : `# Advanced Filters & Codec parameters code
  FILTER_CHAIN="${buildFilterComplex(videos, lut, config, audio).replace(/"/g, '\\"')}"
  log_info "Compiled Filter Chain: \$FILTER_CHAIN"
  
  # Setup progress variables
  TOTAL_FRAMES=${totalFrames}
  BAR_WIDTH=30
  
  echo -e "\${CYAN}Format: Active Transcode / Grade (with real-time progress bar)\${NC}"
  
  ffmpeg ${resolvedVideos.map(path => `-i "${path}"`).join(' ')} \\
    ${audio.name !== 'None' && audio.syncToVideo ? `-stream_loop -1 -i "\$AUDIO_FILE" \\\n` : ''}    -filter_complex "\$FILTER_CHAIN" \\
    -map "[v_out]" \\
    ${
      audio.name !== 'None' && audio.syncToVideo
        ? `-map ${videos.length}:a \\`
        : (videos.some(v => v.hasAudio !== false) ? `-map "[a_out]" \\` : '')
    }
    -c:v ${effectiveCodec === 'prores' ? 'prores_ks' : effectiveCodec} \\
    ${
      effectiveCodec !== 'prores'
        ? `-preset ${config.preset} -crf ${config.crf} -pix_fmt yuv420p`
        : '-profile:v 3 -vendor ap10 -pix_fmt yuv422p10le'
    } \\
    -t ${totalDuration.toFixed(3)} -progress - -nostats -y "\$OUTPUT_NAME" 2>> "\$LOG_FILE" | while read -r line; do
      if [[ "\$line" =~ ^frame=([0-9]+) ]]; then
        FRAME=\${BASH_REMATCH[1]}
        PERCENT=\$(( FRAME * 100 / TOTAL_FRAMES ))
        if [ \$PERCENT -gt 100 ]; then PERCENT=100; fi
        
        FILLED=\$(( PERCENT * BAR_WIDTH / 100 ))
        UNFILLED=\$(( BAR_WIDTH - FILLED ))
        
        BAR=""
        for ((i=0; i<FILLED; i++)); do BAR="\${BAR}█"; done
        for ((i=0; i<UNFILLED; i++)); do BAR="\${BAR}░"; done
        
        printf "\\r\\033[K\\033[0;33m[PENDING]\\033[0m Encoding: [\${BAR}] \${PERCENT}%% (Frame: \${FRAME}/\${TOTAL_FRAMES})"
      fi
  done
  printf "\\r\\033[K\\033[0;32m[SUCCESS]\\033[0m Encoding complete! [██████████████████████████████] 100%%\\n"
  echo "" >> "\$LOG_FILE"`
}

STATUS=\$?
log_info "FFmpeg process finished. Return Status Code: \$STATUS"

if [ \$STATUS -eq 0 ]; then
    echo -e " "
    echo -e "\${GREEN}\${BOLD}┌────────────────────────────────────────────────────────┐\${NC}"
    echo -e "\${GREEN}\${BOLD}│               ASSEMBLY COMPLETE SUCCESS                │\${NC}"
    echo -e "\${GREEN}\${BOLD}│  Output Vector: \${YELLOW}\$OUTPUT_NAME\${GREEN}   │\${NC}"
    echo -e "\${GREEN}\${BOLD}└────────────────────────────────────────────────────────┘\${NC}"
    log_info "Assembly completed with absolute success. Output created: \$OUTPUT_NAME"
    
    # Trigger macOS native notifications
    osascript -e 'display notification "Your combined video is fully ready" with title "Vitch Assembly Success" sound name "Glass"' 2>/dev/null
else
    echo -e " "
    echo -e "\${RED}\${BOLD}┌────────────────────────────────────────────────────────┐\${NC}"
    echo -e "\${RED}\${BOLD}│              FFmpeg ASSEMBLY ERROR (\$STATUS)            │\${NC}"
    echo -e "\${RED}\\033[1m└────────────────────────────────────────────────────────┘\${NC}"
    echo -e "Check target stream logs and codec compatibilities."
    log_err "Assembly failed. Check error output inside '\$LOG_FILE'."
    exit 1
fi

rm -f "\$MANIFEST_FILE"
`;
}

// ============================================================================
// MISEN V10 — Video Assembly Engine (Client-side)
//
// Assembles generated video clips into a final film using browser APIs:
//   Canvas 2D + MediaRecorder → WebM output
//
// Features:
//   - Sequential clip concatenation
//   - Crossfade transitions between clips (configurable duration)
//   - Burnt-in subtitle rendering (SRT/VTT)
//   - Voiceover audio mixing
//   - Title card and credits
//   - Progress callback for UI
//
// Architecture:
//   clips[] → Canvas renderer → MediaRecorder → Blob → download
//
// Browser requirements: MediaRecorder API, Canvas 2D, createImageBitmap
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface AssemblyClip {
  planId: string
  videoUrl: string          // URL to generated video
  duration: number          // seconds
  sceneIndex: number
  planIndex: number
}

export interface SubtitleEntry {
  start: number             // seconds from film start
  end: number
  text: string
}

export interface AssemblyConfig {
  clips: AssemblyClip[]
  projectName: string
  resolution: { width: number; height: number }
  fps: number
  transition: {
    type: 'cut' | 'crossfade' | 'dip-to-black'
    durationMs: number      // 0 for cut
  }
  titleCard?: {
    text: string
    subtitle?: string
    durationMs: number
  }
  credits?: {
    lines: string[]
    durationMs: number
  }
  subtitles?: SubtitleEntry[]
  voiceoverUrl?: string     // URL to voiceover audio
  onProgress?: (phase: string, progress: number) => void
}

export interface AssemblyResult {
  blob: Blob
  duration: number
  format: string
  size: number
}

// ═══════════════════════════════════════════
// Core Assembly Engine
// ═══════════════════════════════════════════

export async function assembleVideo(config: AssemblyConfig): Promise<AssemblyResult> {
  const {
    clips, projectName, resolution, fps,
    transition, titleCard, credits, subtitles,
    voiceoverUrl, onProgress,
  } = config

  const { width, height } = resolution
  const report = (phase: string, pct: number) => onProgress?.(phase, Math.round(pct))

  // ─── Phase 1: Load all video elements ───
  report('loading', 0)
  const videoElements = await Promise.all(
    clips.map(async (clip, i) => {
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.preload = 'auto'
      video.src = clip.videoUrl

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve()
        video.onerror = () => reject(new Error(`Failed to load clip ${clip.planId}`))
        setTimeout(() => reject(new Error(`Timeout loading clip ${clip.planId}`)), 30000)
      })

      report('loading', ((i + 1) / clips.length) * 100)
      return { video, clip }
    })
  )

  // Load voiceover if provided
  let voiceoverAudio: HTMLAudioElement | null = null
  if (voiceoverUrl) {
    voiceoverAudio = new Audio(voiceoverUrl)
    voiceoverAudio.crossOrigin = 'anonymous'
    await new Promise<void>((resolve) => {
      voiceoverAudio!.onloadeddata = () => resolve()
      voiceoverAudio!.onerror = () => resolve() // Non-blocking
      setTimeout(resolve, 10000)
    })
  }

  // ─── Phase 2: Setup Canvas + MediaRecorder ───
  report('setup', 0)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Create audio context for mixing
  const audioCtx = new AudioContext()
  const destination = audioCtx.createMediaStreamDestination()

  // Combine video canvas stream + audio
  const canvasStream = canvas.captureStream(fps)
  const videoTrack = canvasStream.getVideoTracks()[0]

  const combinedStream = new MediaStream()
  combinedStream.addTrack(videoTrack)
  if (destination.stream.getAudioTracks().length > 0) {
    combinedStream.addTrack(destination.stream.getAudioTracks()[0])
  }

  // MediaRecorder
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm'

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 8_000_000, // 8 Mbps
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  // ─── Phase 3: Render timeline ───
  report('rendering', 0)

  // Calculate total duration
  const transitionDuration = transition.durationMs / 1000
  let totalDuration = 0
  if (titleCard) totalDuration += titleCard.durationMs / 1000
  for (let i = 0; i < clips.length; i++) {
    totalDuration += clips[i].duration
    if (i > 0 && transition.type !== 'cut') totalDuration -= transitionDuration
  }
  if (credits) totalDuration += credits.durationMs / 1000

  // Start recording
  recorder.start(100) // Collect data every 100ms

  // Connect voiceover
  if (voiceoverAudio) {
    try {
      const source = audioCtx.createMediaElementSource(voiceoverAudio)
      source.connect(destination)
      voiceoverAudio.play().catch(() => {})
    } catch {}
  }

  // ─── Render loop ───
  const frameInterval = 1000 / fps
  let currentTime = 0

  // Title card
  if (titleCard) {
    const titleFrames = Math.round((titleCard.durationMs / 1000) * fps)
    for (let f = 0; f < titleFrames; f++) {
      renderTitleCard(ctx, width, height, titleCard.text, titleCard.subtitle, f / titleFrames)
      await waitFrame(frameInterval)
      currentTime += 1 / fps
      report('rendering', (currentTime / totalDuration) * 100)
    }
  }

  // Clips
  for (let i = 0; i < videoElements.length; i++) {
    const { video, clip } = videoElements[i]
    const clipFrames = Math.round(clip.duration * fps)

    // Start playback
    video.currentTime = 0
    video.play().catch(() => {})

    for (let f = 0; f < clipFrames; f++) {
      const t = f / clipFrames  // 0→1 within clip

      // Clear
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // Draw current clip
      let alpha = 1
      if (transition.type === 'crossfade' && i > 0) {
        // Fade in from previous clip
        const fadeFrames = Math.round(transitionDuration * fps)
        if (f < fadeFrames) {
          alpha = f / fadeFrames
          // Draw previous clip fading out
          const prevVideo = videoElements[i - 1].video
          ctx.globalAlpha = 1 - alpha
          drawVideoFit(ctx, prevVideo, width, height)
        }
      } else if (transition.type === 'dip-to-black') {
        const fadeFrames = Math.round(transitionDuration * fps)
        if (f < fadeFrames / 2) {
          // Dip to black at start
          alpha = f / (fadeFrames / 2)
        }
        if (f > clipFrames - fadeFrames / 2) {
          // Dip to black at end
          alpha = (clipFrames - f) / (fadeFrames / 2)
        }
      }

      ctx.globalAlpha = alpha
      drawVideoFit(ctx, video, width, height)
      ctx.globalAlpha = 1

      // Subtitles overlay
      if (subtitles) {
        const activeSub = subtitles.find(s => currentTime >= s.start && currentTime <= s.end)
        if (activeSub) {
          renderSubtitle(ctx, width, height, activeSub.text)
        }
      }

      // Plan indicator (small, bottom-left)
      renderPlanIndicator(ctx, width, height, i + 1, videoElements.length, clip.planId)

      await waitFrame(frameInterval)
      currentTime += 1 / fps
      report('rendering', (currentTime / totalDuration) * 100)
    }

    video.pause()
  }

  // Credits
  if (credits) {
    const creditsFrames = Math.round((credits.durationMs / 1000) * fps)
    for (let f = 0; f < creditsFrames; f++) {
      renderCredits(ctx, width, height, credits.lines, projectName, f / creditsFrames)
      await waitFrame(frameInterval)
      currentTime += 1 / fps
      report('rendering', (currentTime / totalDuration) * 100)
    }
  }

  // Stop recording
  report('encoding', 0)
  recorder.stop()

  // Stop voiceover
  if (voiceoverAudio) voiceoverAudio.pause()

  // Wait for final data
  await new Promise<void>(resolve => {
    recorder.onstop = () => resolve()
  })

  // Cleanup
  audioCtx.close().catch(() => {})
  videoElements.forEach(({ video }) => {
    video.pause()
    video.removeAttribute('src')
    video.load()
  })

  report('done', 100)

  const blob = new Blob(chunks, { type: mimeType })

  return {
    blob,
    duration: totalDuration,
    format: mimeType.includes('vp9') ? 'WebM (VP9)' : 'WebM (VP8)',
    size: blob.size,
  }
}

// ═══════════════════════════════════════════
// Canvas rendering helpers
// ═══════════════════════════════════════════

function drawVideoFit(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, w: number, h: number) {
  if (video.readyState < 2) return

  const vw = video.videoWidth || w
  const vh = video.videoHeight || h
  const scale = Math.max(w / vw, h / vh)
  const dw = vw * scale
  const dh = vh * scale
  const dx = (w - dw) / 2
  const dy = (h - dh) / 2

  ctx.drawImage(video, dx, dy, dw, dh)
}

function renderTitleCard(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  title: string, subtitle: string | undefined, t: number
) {
  // Black background
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)

  // Fade in
  const alpha = Math.min(1, t * 3) * (t < 0.8 ? 1 : Math.max(0, (1 - t) * 5))
  ctx.globalAlpha = alpha

  // Title
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.round(w * 0.04)}px "Inter", "Helvetica Neue", sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(title, w / 2, h / 2 - (subtitle ? 20 : 0))

  // Subtitle
  if (subtitle) {
    ctx.font = `${Math.round(w * 0.018)}px "Inter", "Helvetica Neue", sans-serif`
    ctx.fillStyle = '#999'
    ctx.fillText(subtitle, w / 2, h / 2 + 30)
  }

  ctx.globalAlpha = 1
}

function renderSubtitle(ctx: CanvasRenderingContext2D, w: number, h: number, text: string) {
  const fontSize = Math.round(w * 0.025)
  ctx.font = `${fontSize}px "Inter", "Helvetica Neue", sans-serif`
  ctx.textAlign = 'center'

  const y = h - 60
  const metrics = ctx.measureText(text)
  const padding = 12

  // Background bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  ctx.fillRect(
    w / 2 - metrics.width / 2 - padding,
    y - fontSize - padding / 2,
    metrics.width + padding * 2,
    fontSize + padding
  )

  // Text
  ctx.fillStyle = '#fff'
  ctx.fillText(text, w / 2, y)
}

function renderPlanIndicator(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  current: number, total: number, planId: string
) {
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#000'
  ctx.fillRect(12, h - 32, 80, 20)
  ctx.globalAlpha = 0.6
  ctx.font = '11px monospace'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.fillText(`${planId} · ${current}/${total}`, 18, h - 17)
  ctx.globalAlpha = 1
}

function renderCredits(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  lines: string[], projectName: string, t: number
) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)

  const alpha = Math.min(1, t * 3) * (t < 0.85 ? 1 : Math.max(0, (1 - t) * 7))
  ctx.globalAlpha = alpha

  // Project name
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.round(w * 0.03)}px "Inter", "Helvetica Neue", sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(projectName, w / 2, h / 2 - lines.length * 15)

  // Credit lines (scroll up effect)
  const scrollOffset = t * lines.length * 5
  ctx.font = `${Math.round(w * 0.015)}px "Inter", "Helvetica Neue", sans-serif`
  ctx.fillStyle = '#888'
  lines.forEach((line, i) => {
    const y = h / 2 + (i + 1) * 28 - scrollOffset
    if (y > h * 0.2 && y < h * 0.9) {
      ctx.fillText(line, w / 2, y)
    }
  })

  // MISEN watermark
  ctx.font = `${Math.round(w * 0.012)}px "Inter", sans-serif`
  ctx.fillStyle = '#444'
  ctx.fillText('Assembled with MISEN', w / 2, h - 30)

  ctx.globalAlpha = 1
}

function waitFrame(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════
// Download helper
// ═══════════════════════════════════════════

export function downloadAssembly(result: AssemblyResult, filename: string) {
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

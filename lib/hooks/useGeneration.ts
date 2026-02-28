// ============================================================================
// MISEN V8 — useGeneration Hook
// Session 1 : Hook client pour soumission + polling de génération vidéo
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  VideoProvider,
  AspectRatio,
  GenerateResponse,
  GenerateStatusResponse,
  GenerationStatus,
} from '@/lib/types/generation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerationInput {
  projectId: string;
  shotId: string;
  provider: VideoProvider;
  prompt: string;
  negativePrompt?: string;
  duration?: number;
  aspectRatio?: AspectRatio;
  referenceImageUrl?: string;
  referenceVideoUrl?: string;
  style?: string;
  seed?: number;
}

interface GenerationState {
  jobId: string | null;
  status: GenerationStatus | null;
  progress: number;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  isPolling: boolean;
  creditsUsed: number;
}

interface UseGenerationReturn extends GenerationState {
  generate: (input: GenerationInput) => Promise<string | null>;
  cancel: () => Promise<void>;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_POLL_INTERVAL = 3_000;   // 3s
const MAX_POLL_INTERVAL = 15_000;      // 15s
const POLL_BACKOFF_FACTOR = 1.3;
const MAX_POLL_DURATION = 600_000;     // 10 min timeout

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGeneration(): UseGenerationReturn {
  const [state, setState] = useState<GenerationState>({
    jobId: null,
    status: null,
    progress: 0,
    resultUrl: null,
    thumbnailUrl: null,
    errorMessage: null,
    isSubmitting: false,
    isPolling: false,
    creditsUsed: 0,
  });

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartRef = useRef<number>(0);
  const pollIntervalRef = useRef<number>(INITIAL_POLL_INTERVAL);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      abortRef.current?.abort();
    };
  }, []);

  // ── Submit ──

  const generate = useCallback(async (input: GenerationInput): Promise<string | null> => {
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      errorMessage: null,
      status: null,
      resultUrl: null,
      thumbnailUrl: null,
      progress: 0,
    }));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data: GenerateResponse & { error?: string } = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          errorMessage: data.error ?? `Error ${res.status}`,
          status: 'failed',
        }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        jobId: data.jobId,
        status: data.status,
        isSubmitting: false,
        isPolling: true,
      }));

      // Start polling
      startPolling(data.jobId);

      return data.jobId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        errorMessage: message,
        status: 'failed',
      }));
      return null;
    }
  }, []);

  // ── Polling ──

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    pollStartRef.current = Date.now();
    pollIntervalRef.current = INITIAL_POLL_INTERVAL;

    const poll = async () => {
      // Timeout check
      if (Date.now() - pollStartRef.current > MAX_POLL_DURATION) {
        setState((prev) => ({
          ...prev,
          isPolling: false,
          errorMessage: 'Generation timed out. Check status manually.',
          status: 'failed',
        }));
        return;
      }

      try {
        const res = await fetch(`/api/generate/status?jobId=${jobId}`);
        const data: GenerateStatusResponse & { error?: string } = await res.json();

        if (!res.ok) {
          // Retryable error — continue polling
          if (res.status >= 500 || (data as unknown as Record<string, unknown>).retryable) {
            scheduleNextPoll(jobId, poll);
            return;
          }
          setState((prev) => ({
            ...prev,
            isPolling: false,
            errorMessage: data.error ?? `Status check error ${res.status}`,
          }));
          return;
        }

        // Update state
        setState((prev) => ({
          ...prev,
          status: data.status,
          progress: data.progress ?? prev.progress,
          resultUrl: data.resultUrl ?? prev.resultUrl,
          thumbnailUrl: data.thumbnailUrl ?? prev.thumbnailUrl,
          errorMessage: data.errorMessage ?? null,
          creditsUsed: data.creditsUsed,
        }));

        // Terminal state — stop polling
        if (['completed', 'failed', 'cancelled'].includes(data.status)) {
          setState((prev) => ({ ...prev, isPolling: false }));
          return;
        }

        // Continue polling with backoff
        scheduleNextPoll(jobId, poll);
      } catch {
        // Network error — retry with backoff
        scheduleNextPoll(jobId, poll);
      }
    };

    // Initial poll after short delay
    pollTimerRef.current = setTimeout(poll, INITIAL_POLL_INTERVAL);
  }, []);

  const scheduleNextPoll = (jobId: string, pollFn: () => Promise<void>) => {
    pollIntervalRef.current = Math.min(
      pollIntervalRef.current * POLL_BACKOFF_FACTOR,
      MAX_POLL_INTERVAL
    );
    pollTimerRef.current = setTimeout(pollFn, pollIntervalRef.current);
  };

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ── Cancel ──

  const cancel = useCallback(async () => {
    if (!state.jobId) return;

    stopPolling();

    try {
      await fetch(`/api/generate/status?jobId=${state.jobId}`, {
        method: 'DELETE',
      });

      setState((prev) => ({
        ...prev,
        status: 'cancelled',
        isPolling: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        errorMessage: 'Failed to cancel generation',
      }));
    }
  }, [state.jobId, stopPolling]);

  // ── Reset ──

  const reset = useCallback(() => {
    stopPolling();
    setState({
      jobId: null,
      status: null,
      progress: 0,
      resultUrl: null,
      thumbnailUrl: null,
      errorMessage: null,
      isSubmitting: false,
      isPolling: false,
      creditsUsed: 0,
    });
  }, [stopPolling]);

  return {
    ...state,
    generate,
    cancel,
    reset,
  };
}

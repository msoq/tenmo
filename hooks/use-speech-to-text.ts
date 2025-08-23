'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseSpeechToTextOptions {
  /**
   * Callback when transcription is successful
   */
  onTranscript?: (text: string) => void;
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
  /**
   * Custom API endpoint for transcription (default: '/api/speech/transcribe')
   */
  apiEndpoint?: string;
  /**
   * Maximum recording duration in milliseconds (default: 60000 = 1 minute)
   */
  maxDuration?: number;
  /**
   * Show toast notifications for errors (default: true)
   */
  showToasts?: boolean;
}

export interface UseSpeechToTextReturn {
  /**
   * Whether currently recording audio
   */
  isRecording: boolean;
  /**
   * Whether currently transcribing audio
   */
  isTranscribing: boolean;
  /**
   * Start recording audio
   */
  startRecording: () => Promise<void>;
  /**
   * Stop recording and trigger transcription
   */
  stopRecording: () => void;
  /**
   * Toggle recording on/off
   */
  toggleRecording: () => void;
  /**
   * Last transcribed text
   */
  transcript: string | null;
  /**
   * Last error that occurred
   */
  error: Error | null;
  /**
   * Clear the transcript and error
   */
  reset: () => void;
}

/**
 * Hook for speech-to-text functionality using OpenAI Whisper
 */
export function useSpeechToText({
  onTranscript,
  onError,
  apiEndpoint = '/api/speech/transcribe',
  maxDuration = 60000,
  showToasts = true,
}: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Upload audio blob to the transcription API
   */
  const uploadAudio = useCallback(
    async (blob: Blob): Promise<{ text: string }> => {
      const form = new FormData();
      form.append('file', blob, 'recording.webm');

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: 'Transcription failed' }));
        throw new Error(errorData.error || 'Transcription failed');
      }

      return res.json();
    },
    [apiEndpoint],
  );

  /**
   * Handle transcription after recording stops
   */
  const handleTranscription = useCallback(
    async (blob: Blob) => {
      setIsTranscribing(true);
      setError(null);

      try {
        const result = await uploadAudio(blob);

        if (result.text) {
          setTranscript(result.text);
          onTranscript?.(result.text);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Transcription failed');
        setError(error);

        if (showToasts) {
          toast.error(error.message);
        }

        onError?.(error);
      } finally {
        setIsTranscribing(false);
      }
    },
    [uploadAudio, onTranscript, onError, showToasts],
  );

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use webm with opus codec for efficient compression
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Clear timeout
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }

        // Transcribe
        await handleTranscription(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Set max duration timeout
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          stopRecording();
          if (showToasts) {
            toast.info(`Recording stopped after ${maxDuration / 1000} seconds`);
          }
        }
      }, maxDuration);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Microphone access denied');

      setError(error);

      if (showToasts) {
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        ) {
          toast.error(
            'Microphone access denied. Please allow microphone access and try again.',
          );
        } else {
          toast.error(error.message);
        }
      }

      onError?.(error);
    }
  }, [isRecording, maxDuration, handleTranscription, onError, showToasts]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timeout if it exists
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
    }
  }, [isRecording]);

  /**
   * Toggle recording on/off
   */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    toggleRecording,
    transcript,
    error,
    reset,
  };
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Mic, Play, Pause, Square, FileText, Clock } from "lucide-react";
import type { Patient } from "~/types";
import {
  TransformersAudioTranscriber,
  type TranscriptionSegment,
} from "~/lib/transformersTranscribe";
import { CDSSService } from "~/lib/cdssService";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

// Types

interface TranscriptionAreaProps {
  patient: Patient;
  isTranscribing: boolean;
  onStartTranscription: () => void;
  onStopTranscription: () => void;
  expanded: boolean;
  caseId?: string; // Add caseId prop for API integration
}

// Custom hook for audio recording
function useAudioRecording(caseId?: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcriber] = useState(() => new TransformersAudioTranscriber(caseId ?? ''));
  const [lastSavedText, setLastSavedText] = useState("");
  const [currentSegments, setCurrentSegments] = useState<TranscriptionSegment[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRecording) {
      intervalId = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  // Auto-save transcription every 30 seconds when recording
  useEffect(() => {
    let saveIntervalId: NodeJS.Timeout | null = null;

    if (isRecording && caseId && currentSegments.length > 0) {
      saveIntervalId = setInterval(async () => {
        const currentText = currentSegments
          .map((segment: TranscriptionSegment) => `${segment.speaker}: ${segment.text}`)
          .join("\n");

        if (currentText && currentText !== lastSavedText) {
          try {
            await CDSSService.saveTranscription(caseId, currentText);
            setLastSavedText(currentText);
            console.log("Transcription auto-saved successfully");
          } catch (error) {
            console.error("Failed to auto-save transcription:", error);
          }
        }
      }, 30000); // Save every 30 seconds
    }

    return () => {
      if (saveIntervalId) {
        clearInterval(saveIntervalId);
      }
    };
  }, [isRecording, caseId, lastSavedText, currentSegments]);

  async function toggleRecording() {
    if (isRecording) {
      transcriber.stopTranscription();
      setIsRecording(false);

      // Save final transcription when stopping
      if (caseId && currentSegments.length > 0) {
        const finalText = currentSegments
          .map((segment: TranscriptionSegment) => `${segment.speaker}: ${segment.text}`)
          .join("\n");

        if (finalText) {
          try {
            await CDSSService.saveTranscription(caseId, finalText);
            console.log("Final transcription saved successfully");
          } catch (error) {
            console.error("Failed to save final transcription:", error);
          }
        }
      }
    } else {
      await transcriber.startTranscription();
      setIsRecording(true);
    }
  }

  return {
    isRecording,
    duration,
    toggleRecording,
    transcriber,
    segments: currentSegments,
    setSegments: setCurrentSegments,
  };
}

// Recording Header Component
function RecordingHeader({
  isRecording,
  duration,
  onStart,
  onStop,
}: {
  isRecording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="z-500 border-b bg-gradient-to-r from-white to-blue-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">患者会诊记录</h3>
            <p className="text-sm text-gray-600">
              {isRecording ? "正在转录中..." : "点击开始患者会诊"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {duration > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}

          {isRecording ? (
            <Button
              onClick={onStop}
              variant="destructive"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Square className="h-4 w-4" />
              <span>停止</span>
            </Button>
          ) : (
            <Button
              onClick={onStart}
              variant="default"
              size="sm"
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700"
            >
              <Mic className="h-4 w-4" />
              <span>开始转录</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="z-100 flex items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <Mic className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">准备开始会诊记录</h4>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            点击&quot;开始转录&quot;按钮开始记录与患者的会诊对话
          </p>
        </div>
      </div>
    </div>
  );
}

// Transcription Display Component
function TranscriptionDisplay({
  segments,
  isRecording,
  expanded,
}: {
  segments: TranscriptionSegment[];
  isRecording: boolean;
  expanded: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={isRecording ? "default" : "secondary"}>
            {isRecording ? "转录中" : "已完成"}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleString("zh-CN")}
          </span>
        </div>

        {segments.length > 0 && !isRecording && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea
        className={`${expanded ? "h-[calc(100%-40px)]" : "h-[calc(100%-60px)]"} transition-all duration-300`}
      >
        <div className="space-y-4">
          {/* Real-time transcription segments */}
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`flex items-start space-x-3 rounded-lg p-3 bg-green-50`}
            >
              <div
                className={`mt-2 h-2 w-2 rounded-full bg-green-500"`}
              ></div>
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span
                    className={`text-xs text-green-600`}
                  >
                    {segment.timestamp}
                  </span>
                </div>
                <p
                  className={`text-sm text-green-800`}
                >
                  {segment.text}
                  {isRecording && segment === segments[segments.length - 1] && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500"></span>
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator for active transcription */}
          {isRecording && segments.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">等待语音输入...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Main TranscriptionArea Component
export default function TranscriptionArea({
  patient,
  isTranscribing,
  expanded,
  caseId,
}: TranscriptionAreaProps) {
  const [transcriptionSegments, setTranscriptionSegments] = useState<
    TranscriptionSegment[]
  >([]);
  const { isRecording, duration, toggleRecording, transcriber, segments, setSegments } =
    useAudioRecording(caseId);

  // Set up real-time transcription updates
  useEffect(() => {
    transcriber.setOnTranscriptionUpdate((segments) => {
      setTranscriptionSegments(segments);
      setSegments(segments); // Update segments in the hook for auto-saving
    });

    // Cleanup on unmount
    return () => {
      transcriber.terminate();
    };
  }, [transcriber, setSegments]);

  const hasContent = transcriptionSegments.length > 0;

  return (
    <div className="h-full border-r bg-white">
      <RecordingHeader
        isRecording={isRecording}
        duration={duration}
        onStart={toggleRecording}
        onStop={toggleRecording}
      />

      <div className="h-[calc(100%-120px)] p-4">
        {!hasContent && !isRecording ? (
          <EmptyState onStart={toggleRecording} />
        ) : (
          <TranscriptionDisplay
            segments={transcriptionSegments}
            isRecording={isRecording}
            expanded={expanded}
          />
        )}
      </div>
    </div>
  );
}

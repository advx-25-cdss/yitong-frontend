"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  FileText,
  Clock,
  User,
  Activity,
} from "lucide-react";
import type { Patient } from "~/types";

interface TranscriptionAreaProps {
  patient: Patient;
  isTranscribing: boolean;
  onStartTranscription: () => void;
  onStopTranscription: () => void;
  expanded: boolean;
}

export default function TranscriptionArea({
  patient,
  isTranscribing,
  onStartTranscription,
  onStopTranscription,
  expanded,
}: TranscriptionAreaProps) {
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulate real-time transcription
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranscribing) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);

        // Simulate transcription text appearing
        const fullText = patient.cases[0]?.transcriptions || "";
        const progress = Math.min(duration * 10, fullText.length);
        setCurrentTranscription(fullText.slice(0, progress));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTranscribing, duration, patient.cases]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const hasTranscription = patient.cases[0]?.transcriptions;

  return (
    <div className="h-full border-r bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">患者会诊记录</h3>
              <p className="text-sm text-gray-600">
                {isTranscribing
                  ? "正在转录中..."
                  : hasTranscription
                    ? "转录已完成"
                    : "点击开始患者会诊"}
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

            {isTranscribing ? (
              <Button
                onClick={onStopTranscription}
                variant="destructive"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Square className="h-4 w-4" />
                <span>停止</span>
              </Button>
            ) : (
              <Button
                onClick={onStartTranscription}
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

        {/* Recording indicator */}
        {isTranscribing && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-600">录音中</span>
            </div>
            <div className="h-1 flex-1 rounded-full bg-gray-200">
              <div
                className="h-1 rounded-full bg-red-500 transition-all duration-1000"
                style={{ width: `${Math.min((duration / 300) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="h-[calc(100%-120px)] p-4">
        {!hasTranscription && !isTranscribing ? (
          // Empty state
          <div className="flex h-full items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Mic className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">准备开始会诊记录</h4>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  点击"开始转录"按钮开始记录与患者的会诊对话，系统将自动转录为文字。
                </p>
              </div>
              <Button
                onClick={onStartTranscription}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Mic className="h-4 w-4" />
                <span>开始患者会诊</span>
              </Button>
            </div>
          </div>
        ) : (
          // Transcription content
          <div className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={isTranscribing ? "default" : "secondary"}>
                  {isTranscribing ? "转录中" : "已完成"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleString("zh-CN")}
                </span>
              </div>

              {hasTranscription && !isTranscribing && (
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
                    <span>播放</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>音频</span>
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea
              className={`${expanded ? "h-[calc(100%-60px)]" : "h-[calc(100%-60px)]"} transition-all duration-300`}
            >
              <div className="space-y-4">
                {/* Patient info header */}
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="mb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      患者: {patient.demographics.last_name}
                      {patient.demographics.first_name}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p>患者ID: {patient.demographics.patient_id}</p>
                    <p>
                      主诉: {patient.historyPresentIllness?.chief_complaint}
                    </p>
                  </div>
                </div>

                {/* Transcription text */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-sm leading-relaxed">
                    {isTranscribing ? (
                      <div>
                        <p className="whitespace-pre-wrap text-gray-900">
                          {currentTranscription}
                          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500"></span>
                        </p>
                      </div>
                    ) : hasTranscription ? (
                      <p className="whitespace-pre-wrap text-gray-900">
                        {patient.cases[0]?.transcriptions}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Timestamps and speaker labels (if expanded) */}
                {expanded && hasTranscription && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">会诊详情</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
                        <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="font-medium text-green-900">
                              医生
                            </span>
                            <span className="text-xs text-green-600">
                              00:00 - 01:30
                            </span>
                          </div>
                          <p className="text-sm text-green-800">
                            请描述一下您的症状，什么时候开始的？
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg bg-blue-50 p-3">
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="font-medium text-blue-900">
                              患者
                            </span>
                            <span className="text-xs text-blue-600">
                              01:31 - 03:45
                            </span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {
                              patient.historyPresentIllness
                                ?.history_of_present_illness
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
                        <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="font-medium text-green-900">
                              医生
                            </span>
                            <span className="text-xs text-green-600">
                              03:46 - 04:20
                            </span>
                          </div>
                          <p className="text-sm text-green-800">
                            我需要给您做一个体格检查，请您配合一下。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Expansion hint */}
      {!expanded && hasTranscription && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 transform">
          <div className="rounded bg-black/70 px-2 py-1 text-xs text-white">
            悬停查看详情
          </div>
        </div>
      )}
    </div>
  );
}

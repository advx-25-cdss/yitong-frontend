"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Play,
  Pause,
  User,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Pill,
  TestTube,
  Stethoscope,
} from "lucide-react";
import { mockPatients } from "~/lib/mockData";
import EHRSidebar from "~/components/EHRSidebar";
import TranscriptionArea from "~/components/TranscriptionArea";
import ChatInterface from "~/components/ChatInterface";
import EHRInput from "~/components/EHRInput";

export default function CDSSScreen() {
  const [selectedPatientId, setSelectedPatientId] = useState("CVD001");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionExpanded, setTranscriptionExpanded] = useState(false);

  const selectedPatient = mockPatients.find(
    (p) => p.demographics.patient_id === selectedPatientId,
  );

  if (!selectedPatient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">选择患者</h3>
          <p className="mt-1 text-sm text-gray-500">
            请从仪表板选择一个患者开始诊疗
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - EHR Sidebar */}
        <ResizablePanel
          defaultSize={sidebarCollapsed ? 5 : 25}
          minSize={5}
          maxSize={40}
          className="relative"
        >
          <EHRSidebar
            patient={selectedPatient}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Middle Panel - Transcription and Chat */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="flex h-full flex-col">
            {/* Transcription Area */}
            <div
              className={`transition-all duration-300 ${
                transcriptionExpanded ? "h-1/2" : "h-1/4"
              } border-b`}
              onMouseEnter={() => setTranscriptionExpanded(true)}
              onMouseLeave={() => setTranscriptionExpanded(false)}
            >
              <TranscriptionArea
                patient={selectedPatient}
                isTranscribing={isTranscribing}
                onStartTranscription={() => setIsTranscribing(true)}
                onStopTranscription={() => setIsTranscribing(false)}
                expanded={transcriptionExpanded}
              />
            </div>

            {/* Chat Interface */}
            <div
              className={`${transcriptionExpanded ? "h-1/2" : "h-3/4"} transition-all duration-300`}
            >
              <ChatInterface
                patient={selectedPatient}
                onPatientSelect={setSelectedPatientId}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - EHR Input */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <EHRInput patient={selectedPatient} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Patient Selection Bar */}
      <div className="absolute top-2 right-2 left-2 rounded-lg border bg-white/90 p-2 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <span className="text-xs font-medium text-white">
                {selectedPatient.demographics.first_name[0]}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">
                {selectedPatient.demographics.last_name}
                {selectedPatient.demographics.first_name}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPatient.demographics.patient_id} •{" "}
                {selectedPatient.historyPresentIllness?.chief_complaint}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {selectedPatient.cases[0]?.status === "open"
                ? "新建"
                : selectedPatient.cases[0]?.status === "in_progress"
                  ? "进行中"
                  : "已完成"}
            </Badge>

            <div className="flex space-x-1">
              {mockPatients.map((patient) => (
                <Button
                  key={patient.demographics.patient_id}
                  size="sm"
                  variant={
                    selectedPatientId === patient.demographics.patient_id
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setSelectedPatientId(patient.demographics.patient_id)
                  }
                  className="h-6 px-2 text-xs"
                >
                  {patient.demographics.last_name}
                  {patient.demographics.first_name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { mockPatients } from "~/lib/mockData";
import EHRSidebar from "~/components/EHRSidebar";
import TranscriptionArea from "~/components/TranscriptionArea";
import ChatInterface from "~/components/ChatInterface";
import EHRInput from "~/components/EHRInput";
import type { ImperativePanelHandle } from "react-resizable-panels";
import type { Patient } from "~/types";
import { User } from "lucide-react";

export default function CDSSScreen() {
  const [selectedPatientId, setSelectedPatientId] = useState("CVD001");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionExpanded, setTranscriptionExpanded] = useState(false);

  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);

  const selectedPatient = mockPatients.find(
    (p: Patient) => p.demographics.patient_id === selectedPatientId,
  );

  const handleToggleCollapse = () => {
    if (sidebarPanelRef.current) {
      if (sidebarCollapsed) {
        sidebarPanelRef.current.resize(20);
        setSidebarCollapsed(false);
      } else {
        sidebarPanelRef.current.resize(3);
        setSidebarCollapsed(true);
      }
    }
  };

  // Listen for panel resize events to auto-collapse at small widths
  const handlePanelResize = (size: number) => {
    if (size <= 8 && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    } else if (size > 8 && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

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
    <div className="h-[calc(100vh-73px)] overflow-hidden rounded-lg border bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          ref={sidebarPanelRef}
          defaultSize={20}
          minSize={3}
          maxSize={30}
          className="relative"
          onResize={handlePanelResize}
        >
          <EHRSidebar
            patient={selectedPatient}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Middle Panel - Transcription and Chat */}
        <ResizablePanel defaultSize={45} minSize={28}>
          <div className="flex h-full flex-col">
            {/* Transcription Area */}
            <div
              className={`transition-all duration-600 ease-in-out ${
                transcriptionExpanded ? "h-3/4" : "h-[160px]"
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
              className={`flex-1 overflow-y-auto transition-all duration-300`}
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
        <ResizablePanel defaultSize={30} minSize={30}>
          <EHRInput patient={selectedPatient} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

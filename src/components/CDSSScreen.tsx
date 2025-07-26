"use client";

import { useState, useRef, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { casesApi, getPatientById } from "~/lib/dataService";
import EHRSidebar from "~/components/EHRSidebar";
import TranscriptionArea from "~/components/TranscriptionArea";
import ChatInterface from "~/components/ChatInterface";
import EHRInput from "~/components/EHRInput";
import type { ImperativePanelHandle } from "react-resizable-panels";
import type { Patient } from "~/types";
import { User } from "lucide-react";

export default function CDSSScreen(params: { patientId: string }) {
  const [selectedPatientId, setSelectedPatientId] = useState(params.patientId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionExpanded, setTranscriptionExpanded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const [caseId, setCaseId] = useState<string>("");

  // Fetch specific patient data when selectedPatientId changes
  useEffect(() => {
    const fetchPatient = async () => {
      if (!selectedPatientId) return;
      try {
        setLoading(true);
        const patientData = await getPatientById(selectedPatientId);
        setSelectedPatient(patientData);
        const cases = (await casesApi.getByPatient(selectedPatientId)).data.data;
        if (cases.length > 0) {
          setCaseId(cases?.[0]?._id ?? ''); // Use the first case ID for the
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        setError("Failed to load patient data. Please try again.");
        setSelectedPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [selectedPatientId]);

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

  // Handle loading state
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Loading patients...
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch patient data
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">⚠️</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading data
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

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
                transcriptionExpanded ? "h-3/4" : "h-[80px]"
              } border-b`}
              onMouseEnter={() => setTranscriptionExpanded(true)}
              onMouseLeave={() => setTranscriptionExpanded(false)}
            >
              <TranscriptionArea
                caseId={caseId}
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
                caseId={caseId}
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

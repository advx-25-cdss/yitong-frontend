import { useState, useCallback } from "react";
import { CDSSService } from "~/lib/cdssService";
import type {
  ConversationResponse,
  ConversationDetails,
  Test,
  ClinicalRecommendations,
} from "~/types";

interface CDSSState {
  loading: boolean;
  error: string | null;
}

export function useCDSS(caseId?: string) {
  const [dialogueState, setDialogueState] = useState<CDSSState>({
    loading: false,
    error: null,
  });
  
  const [testState, setTestState] = useState<CDSSState>({
    loading: false,
    error: null,
  });
  
  const [treatmentState, setTreatmentState] = useState<CDSSState>({
    loading: false,
    error: null,
  });

  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [testRecommendations, setTestRecommendations] = useState<Test[]>([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<ClinicalRecommendations | null>(null);

  const startDialogue = useCallback(async (targetCaseId?: string) => {
    const id = targetCaseId || caseId;
    if (!id) {
      setDialogueState({ loading: false, error: "Case ID is required" });
      return;
    }

    setDialogueState({ loading: true, error: null });
    try {
      const result = await CDSSService.startDialogue(id);
      setConversation(result);
      setDialogueState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setDialogueState({ loading: false, error: errorMessage });
      throw error;
    }
  }, [caseId]);

  const continueDialogue = useCallback(async (conversationId: string, userInput: string) => {
    setDialogueState({ loading: true, error: null });
    try {
      const result = await CDSSService.continueDialogue(conversationId, userInput);
      setConversation(result);
      setDialogueState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setDialogueState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const getDialogue = useCallback(async (conversationId: string) => {
    setDialogueState({ loading: true, error: null });
    try {
      const result = await CDSSService.getDialogue(conversationId);
      setConversationDetails(result);
      setDialogueState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setDialogueState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const getTestRecommendations = useCallback(async (targetCaseId?: string) => {
    const id = targetCaseId || caseId;
    if (!id) {
      setTestState({ loading: false, error: "Case ID is required" });
      return;
    }

    setTestState({ loading: true, error: null });
    try {
      const result = await CDSSService.getTestRecommendations(id);
      setTestRecommendations(result);
      setTestState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setTestState({ loading: false, error: errorMessage });
      throw error;
    }
  }, [caseId]);

  const getTreatmentRecommendations = useCallback(async (targetCaseId?: string) => {
    const id = targetCaseId || caseId;
    if (!id) {
      setTreatmentState({ loading: false, error: "Case ID is required" });
      return;
    }

    setTreatmentState({ loading: true, error: null });
    try {
      const result = await CDSSService.getTreatmentRecommendations(id);
      setTreatmentRecommendations(result);
      setTreatmentState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setTreatmentState({ loading: false, error: errorMessage });
      throw error;
    }
  }, [caseId]);

  const saveTranscription = useCallback(async (text: string, targetCaseId?: string) => {
    const id = targetCaseId || caseId;
    if (!id) {
      throw new Error("Case ID is required");
    }

    return CDSSService.saveTranscription(id, text);
  }, [caseId]);

  const runCompleteWorkflow = useCallback(async (transcriptionText?: string, targetCaseId?: string) => {
    const id = targetCaseId || caseId;
    if (!id) {
      throw new Error("Case ID is required");
    }

    // Set all states to loading
    setDialogueState({ loading: true, error: null });
    setTestState({ loading: true, error: null });
    setTreatmentState({ loading: true, error: null });

    try {
      const result = await CDSSService.completeWorkflow(id, transcriptionText);
      
      // Update all states with results
      setConversation(result.dialogue);
      setTestRecommendations(result.testRecommendations);
      setTreatmentRecommendations(result.treatmentRecommendations);
      
      // Reset loading states
      setDialogueState({ loading: false, error: null });
      setTestState({ loading: false, error: null });
      setTreatmentState({ loading: false, error: null });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setDialogueState({ loading: false, error: errorMessage });
      setTestState({ loading: false, error: errorMessage });
      setTreatmentState({ loading: false, error: errorMessage });
      throw error;
    }
  }, [caseId]);

  return {
    // State
    dialogue: {
      loading: dialogueState.loading,
      error: dialogueState.error,
      conversation,
      conversationDetails,
    },
    tests: {
      loading: testState.loading,
      error: testState.error,
      recommendations: testRecommendations,
    },
    treatments: {
      loading: treatmentState.loading,
      error: treatmentState.error,
      recommendations: treatmentRecommendations,
    },
    
    // Actions
    startDialogue,
    continueDialogue,
    getDialogue,
    getTestRecommendations,
    getTreatmentRecommendations,
    saveTranscription,
    runCompleteWorkflow,
  };
}

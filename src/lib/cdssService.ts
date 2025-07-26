import { cdssApi } from "~/lib/api";
import type {
  ConversationResponse,
  ConversationDetails,
  Test,
  ClinicalRecommendations,
} from "~/types";

/**
 * Service layer for Clinical Decision Support System (CDSS) operations
 */
export class CDSSService {
  /**
   * Start a new dialogue session for a case
   */
  static async startDialogue(caseId: string): Promise<ConversationResponse> {
    try {
      const response = await cdssApi.initiateDialogue(caseId);
      return response.data;
    } catch (error) {
      console.error("Error starting dialogue:", error);
      throw new Error("Failed to start dialogue session");
    }
  }

  /**
   * Continue an existing dialogue with user input
   */
  static async continueDialogue(
    conversationId: string,
    userInput: string
  ): Promise<ConversationResponse> {
    try {
      const response = await cdssApi.continueDialogue(conversationId, userInput);
      return response.data;
    } catch (error) {
      console.error("Error continuing dialogue:", error);
      throw new Error("Failed to continue dialogue");
    }
  }

  /**
   * Get complete dialogue details
   */
  static async getDialogue(conversationId: string): Promise<ConversationDetails> {
    try {
      const response = await cdssApi.getDialogue(conversationId);
      return response.data;
    } catch (error) {
      console.error("Error getting dialogue:", error);
      throw new Error("Failed to get dialogue details");
    }
  }

  /**
   * Get AI-recommended tests for a case
   */
  static async getTestRecommendations(caseId: string): Promise<Test[]> {
    try {
      const response = await cdssApi.getRecommendedTests(caseId);
      return response.data;
    } catch (error) {
      console.error("Error getting test recommendations:", error);
      throw new Error("Failed to get test recommendations");
    }
  }

  /**
   * Get AI-recommended treatments, medications, and diagnoses for a case
   */
  static async getTreatmentRecommendations(caseId: string): Promise<ClinicalRecommendations> {
    try {
      const response = await cdssApi.getRecommendedTreatments(caseId);
      return response.data;
    } catch (error) {
      console.error("Error getting treatment recommendations:", error);
      throw new Error("Failed to get treatment recommendations");
    }
  }

  /**
   * Save transcription data incrementally
   */
  static async saveTranscription(caseId: string, text: string): Promise<{ message: string }> {
    try {
      const response = await cdssApi.saveTranscription(caseId, { text });
      return response.data;
    } catch (error) {
      console.error("Error saving transcription:", error);
      throw new Error("Failed to save transcription");
    }
  }

  /**
   * Complete workflow: Start dialogue, get recommendations, and save transcription
   */
  static async completeWorkflow(caseId: string, transcriptionText?: string) {
    try {
      // Start dialogue session
      const dialogue = await this.startDialogue(caseId);
      
      // Get recommendations in parallel
      const [testRecommendations, treatmentRecommendations] = await Promise.all([
        this.getTestRecommendations(caseId),
        this.getTreatmentRecommendations(caseId),
      ]);

      // Save transcription if provided
      let transcriptionResult = null;
      if (transcriptionText) {
        transcriptionResult = await this.saveTranscription(caseId, transcriptionText);
      }

      return {
        dialogue,
        testRecommendations,
        treatmentRecommendations,
        transcriptionResult,
      };
    } catch (error) {
      console.error("Error in complete workflow:", error);
      throw new Error("Failed to complete CDSS workflow");
    }
  }
}

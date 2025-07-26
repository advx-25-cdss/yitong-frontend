"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { useCDSS } from "~/hooks/useCDSS";
import { Loader2, Brain, TestTube, Stethoscope, MessageSquare } from "lucide-react";

interface CDSSPanelProps {
  caseId: string;
  transcriptionText?: string;
}

export default function CDSSPanel({ caseId, transcriptionText }: CDSSPanelProps) {
  const [userInput, setUserInput] = useState("");
  const {
    dialogue,
    tests,
    treatments,
    startDialogue,
    continueDialogue,
    getTestRecommendations,
    getTreatmentRecommendations,
    runCompleteWorkflow,
  } = useCDSS(caseId);

  const handleStartDialogue = async () => {
    try {
      await startDialogue();
    } catch (error) {
      console.error("Failed to start dialogue:", error);
    }
  };

  const handleContinueDialogue = async () => {
    if (!dialogue.conversation?.conversation_id || !userInput.trim()) return;
    
    try {
      await continueDialogue(dialogue.conversation.conversation_id, userInput);
      setUserInput("");
    } catch (error) {
      console.error("Failed to continue dialogue:", error);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      await Promise.all([
        getTestRecommendations(),
        getTreatmentRecommendations(),
      ]);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  };

  const handleCompleteWorkflow = async () => {
    try {
      await runCompleteWorkflow(transcriptionText);
    } catch (error) {
      console.error("Failed to run complete workflow:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Clinical Decision Support</h2>
        </div>
        <Badge variant="outline">Case ID: {caseId}</Badge>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex space-x-2">
            <Button
              onClick={handleStartDialogue}
              disabled={dialogue.loading}
              size="sm"
              variant="outline"
            >
              {dialogue.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Start AI Dialogue
            </Button>
            <Button
              onClick={handleGetRecommendations}
              disabled={tests.loading || treatments.loading}
              size="sm"
              variant="outline"
            >
              {tests.loading || treatments.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Stethoscope className="h-4 w-4" />
              )}
              Get Recommendations
            </Button>
            <Button
              onClick={handleCompleteWorkflow}
              disabled={dialogue.loading || tests.loading || treatments.loading}
              size="sm"
            >
              {dialogue.loading || tests.loading || treatments.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              Complete Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Dialogue */}
      {dialogue.conversation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI Dialogue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dialogue.conversation.summary && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-800">{dialogue.conversation.summary}</p>
              </div>
            )}
            {dialogue.conversation.response && (
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm text-green-800">{dialogue.conversation.response}</p>
              </div>
            )}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Continue the conversation..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={handleContinueDialogue}
                disabled={dialogue.loading || !userInput.trim()}
                size="sm"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Recommendations */}
      {tests.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Recommended Tests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.recommendations.map((test, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{test.test_name}</h4>
                    <Badge variant="secondary">{new Date(test.test_date).toLocaleDateString()}</Badge>
                  </div>
                  {test.notes && (
                    <p className="mt-1 text-sm text-gray-600">{test.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Recommendations */}
      {treatments.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Clinical Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Diagnosis */}
            <div className="rounded-lg border p-3">
              <h4 className="font-medium text-green-800">Diagnosis</h4>
              <p className="mt-1 font-semibold">{treatments.recommendations.diagnosis.diagnosis_name}</p>
              <p className="text-sm text-gray-600">{treatments.recommendations.diagnosis.notes}</p>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline">{treatments.recommendations.diagnosis.status}</Badge>
                <span className="text-xs text-gray-500">{new Date(treatments.recommendations.diagnosis.diagnosis_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Medications */}
            {treatments.recommendations.medications.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-blue-800">Medications</h4>
                <div className="space-y-2">
                  {treatments.recommendations.medications.map((med, index) => (
                    <div key={index} className="rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{med.medicine_name}</span>
                        <Badge variant="secondary">{med.route}</Badge>
                      </div>
                      <p className="text-sm">
                        <strong>Dosage:</strong> {med.dosage} | <strong>Frequency:</strong> {med.frequency}
                      </p>
                      {med.notes && <p className="text-sm text-gray-600">{med.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Treatments */}
            {treatments.recommendations.treatments.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-purple-800">Other Treatments</h4>
                <div className="space-y-2">
                  {treatments.recommendations.treatments.map((treatment, index) => (
                    <div key={index} className="rounded-lg bg-purple-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{treatment.treatment_name}</span>
                        <Badge variant="secondary">{treatment.treatment_type}</Badge>
                      </div>
                      {treatment.notes && <p className="text-sm text-gray-600">{treatment.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {dialogue.error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">Dialogue Error: {dialogue.error}</p>
          </CardContent>
        </Card>
      )}

      {tests.error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">Tests Error: {tests.error}</p>
          </CardContent>
        </Card>
      )}

      {treatments.error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">Treatments Error: {treatments.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

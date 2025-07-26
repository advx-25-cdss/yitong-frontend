# CDSS API Integration

This document describes the integration with the Clinical Decision Support System (CDSS) APIs.

## Overview

The CDSS integration provides three main functionalities:
1. **AI Dialogue Management** - Start and continue conversations with AI about patient cases
2. **Clinical Recommendations** - Get AI-powered test and treatment recommendations
3. **Transcription Management** - Save and manage patient consultation transcriptions

## API Endpoints

### 1. Dialogue Management
- `POST /api/cases/{case_id}/initiation` - Start a new dialogue session
- `POST /api/dialogues/{conversation_id}/continuation` - Continue an existing dialogue
- `GET /api/dialogues/{conversation_id}` - Get dialogue details

### 2. Clinical Recommendations
- `POST /api/cdss/{case_id}/tests` - Get recommended tests
- `POST /api/cdss/{case_id}/treatments` - Get recommended treatments and diagnoses

### 3. Transcription Management
- `PUT /api/transcriptions/{case_id}/incremental` - Save transcription data

## Usage

### Using the Service Layer

```typescript
import { CDSSService } from "~/lib/cdssService";

// Start a dialogue
const dialogue = await CDSSService.startDialogue("case-123");

// Get test recommendations
const tests = await CDSSService.getTestRecommendations("case-123");

// Get treatment recommendations
const treatments = await CDSSService.getTreatmentRecommendations("case-123");

// Save transcription
await CDSSService.saveTranscription("case-123", "Patient says...");

// Complete workflow (all operations)
const results = await CDSSService.completeWorkflow("case-123", "transcription text");
```

### Using the React Hook

```typescript
import { useCDSS } from "~/hooks/useCDSS";

function MyComponent() {
  const {
    dialogue,
    tests,
    treatments,
    startDialogue,
    getTestRecommendations,
    getTreatmentRecommendations,
    runCompleteWorkflow
  } = useCDSS("case-123");

  // Check loading states
  if (dialogue.loading) return <div>Loading dialogue...</div>;
  if (tests.loading) return <div>Loading test recommendations...</div>;
  if (treatments.loading) return <div>Loading treatment recommendations...</div>;

  // Handle errors
  if (dialogue.error) console.error("Dialogue error:", dialogue.error);

  // Access data
  const conversation = dialogue.conversation;
  const testRecommendations = tests.recommendations;
  const treatmentRecommendations = treatments.recommendations;

  return (
    <div>
      <button onClick={() => startDialogue()}>Start AI Dialogue</button>
      <button onClick={() => getTestRecommendations()}>Get Test Recommendations</button>
      <button onClick={() => getTreatmentRecommendations()}>Get Treatment Recommendations</button>
      <button onClick={() => runCompleteWorkflow("transcription text")}>Complete Analysis</button>
    </div>
  );
}
```

### Using the CDSSPanel Component

```typescript
import CDSSPanel from "~/components/CDSSPanel";

function PatientView() {
  const caseId = "case-123";
  const transcriptionText = "Patient consultation transcript...";

  return (
    <CDSSPanel 
      caseId={caseId} 
      transcriptionText={transcriptionText} 
    />
  );
}
```

### Automatic Transcription Saving

The `TranscriptionArea` component now automatically saves transcription data:

```typescript
<TranscriptionArea
  patient={patient}
  isTranscribing={isTranscribing}
  onStartTranscription={handleStart}
  onStopTranscription={handleStop}
  expanded={expanded}
  caseId="case-123" // Add caseId for automatic saving
/>
```

Features:
- Auto-saves every 30 seconds during recording
- Saves final transcription when recording stops
- Handles errors gracefully

## Configuration

Set the Python backend URL in your environment variables:

```bash
PYTHON_BACKEND_URL=http://localhost:8080
```

If not set, it defaults to `http://localhost:8080`.

## Data Types

### ConversationResponse
```typescript
interface ConversationResponse {
  conversation_id: string;
  summary?: string;        // Initial dialogue summary
  response?: string;       // AI response to user input
}
```

### TestRecommendation
```typescript
interface TestRecommendation {
  test_name: string;
  test_date: string;
  notes: string;
  reasoning?: string;
}
```

### ClinicalRecommendations
```typescript
interface ClinicalRecommendations {
  diagnosis: DiagnosisRecommendation;
  medications: MedicationRecommendation[];
  treatments: TreatmentRecommendation[];
}
```

## Error Handling

All API calls include proper error handling:

- Network errors are caught and wrapped in user-friendly messages
- Loading states are managed automatically
- Error states are exposed through hooks and service methods

## Backend Integration

The frontend proxies requests to the Python backend through Next.js API routes. Each route:

1. Receives the request from the frontend
2. Forwards it to the Python backend
3. Returns the response to the frontend
4. Handles errors appropriately

This ensures proper CORS handling and allows for additional processing if needed.

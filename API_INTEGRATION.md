# API Integration Documentation

This document explains how the application has been updated to use real API calls instead of mock data.

## Changes Made

### 1. New API Service (`src/lib/api.ts`)

- Added comprehensive API service with axios
- Configured base URL to `http://localhost:8080`
- Implemented all EHR and diagnosis endpoints
- Added proper TypeScript types for all API responses
- Included error handling and timeout configuration

### 2. Data Service Layer (`src/lib/dataService.ts`)

- Created abstraction layer for data fetching
- Implemented `getPatients()` and `getDashboardStats()` functions
- Added proper error handling and fallback mechanisms
- Provides utility functions for fetching complete patient data

### 3. Updated Components

- **CDSSScreen**: Now fetches patient data asynchronously with loading states
- **Dashboard**: Fetches both patients and dashboard statistics with proper loading/error handling
- Added loading spinners and error messages for better UX

### 4. Mock Data Compatibility (`src/lib/mockData.ts`)

- Maintained backward compatibility with existing imports
- Now exports async functions that call the real API
- Fallback to empty data if API calls fail

## API Endpoints Used

### EHR Data

- `GET /api/ehr/demographics/` - Patient demographics
- `GET /api/ehr/vital-signs/patient/{patient_id}` - Vital signs
- `GET /api/ehr/history-present-illness/patient/{patient_id}` - Present illness history
- `GET /api/ehr/past-medical-history/patient/{patient_id}` - Medical history
- `GET /api/ehr/medication-history/patient/{patient_id}` - Medication history
- `GET /api/ehr/allergy-history/patient/{patient_id}` - Allergy history

### Diagnosis Data

- `GET /api/diagnosis/cases/patient/{patient_id}` - Patient cases
- `GET /api/diagnosis/tests/patient/{patient_id}` - Test results
- `GET /api/diagnosis/medicines/patient/{patient_id}` - Prescribed medicines
- `GET /api/diagnosis/diagnoses/patient/{patient_id}` - Diagnoses
- `GET /api/diagnosis/treatments/patient/{patient_id}` - Treatments

## Usage Examples

### Fetching All Patients

```typescript
import { getPatients } from "~/lib/dataService";

const patients = await getPatients();
```

### Fetching Dashboard Statistics

```typescript
import { getDashboardStats } from "~/lib/dataService";

const stats = await getDashboardStats();
```

### Using Individual API Endpoints

```typescript
import { demographicsApi, casesApi } from "~/lib/dataService";

// Get demographics for a specific patient
const demographics = await demographicsApi.getByPatient("CVD001");

// Create a new case
const newCase = await casesApi.create({
  patient_id: "CVD001",
  case_number: "CVD001-20250125",
  soap: "SOAP notes...",
  case_date: new Date(),
  status: "open",
});
```

## Error Handling

All API calls include proper error handling:

- Network errors are caught and logged
- Failed requests fall back to empty data arrays
- Loading states are displayed to users
- Error messages are shown when data fails to load

## Configuration

To change the API base URL, update the axios configuration in `src/lib/api.ts`:

```typescript
const api = axios.create({
  baseURL: "http://your-api-server:port",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Testing

Make sure your backend API server is running on `localhost:8080` before testing the frontend. If the API is not available, the application will display appropriate error messages and loading states.

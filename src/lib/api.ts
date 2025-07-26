import axios from "axios";
import type {
  Demographics,
  VitalSigns,
  HistoryPresentIllness,
  PastMedicalHistory,
  MedicationHistory,
  AllergyHistory,
  Case,
  Test,
  Medicine,
  Diagnosis,
  Treatment,
  Patient,
  ApiListResponse,
  ConversationResponse,
  ConversationDetails,
  ClinicalRecommendations,
  TranscriptionSaveRequest,
} from "~/types";

// Configure axios instance
const api = axios.create({
  baseURL: "https://gensyncapi.7086cmd.me",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Demographics API
export const demographicsApi = {
  create: (data: Omit<Demographics, "_id" | "created_at" | "updated_at">) =>
    api.post<Demographics>("/api/ehr/demographics/", data),

  getAll: () => api.get<Array<Demographics>>("/api/ehr/demographics/"),

  getById: (recordId: string) =>
    api.get<Demographics>(`/api/ehr/demographics/${recordId}`),

  update: (recordId: string, data: Partial<Demographics>) =>
    api.put<Demographics>(`/api/ehr/demographics/${recordId}`, data),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/demographics/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<Demographics>>(`/api/ehr/demographics/patient/${patientId}`),
};

// History of Present Illness API
export const historyPresentIllnessApi = {
  create: (
    data: Omit<HistoryPresentIllness, "_id" | "created_at" | "updated_at">,
  ) =>
    api.post<HistoryPresentIllness>("/api/ehr/history-present-illness/", data),

  getAll: () =>
    api.get<ApiListResponse<HistoryPresentIllness>>(
      "/api/ehr/history-present-illness/",
    ),

  getById: (recordId: string) =>
    api.get<HistoryPresentIllness>(
      `/api/ehr/history-present-illness/${recordId}`,
    ),

  update: (recordId: string, data: Partial<HistoryPresentIllness>) =>
    api.put<HistoryPresentIllness>(
      `/api/ehr/history-present-illness/${recordId}`,
      data,
    ),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/history-present-illness/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<HistoryPresentIllness>>(
      `/api/ehr/history-present-illness/patient/${patientId}`,
    ),
};

// Past Medical History API
export const pastMedicalHistoryApi = {
  create: (
    data: Omit<PastMedicalHistory, "_id" | "created_at" | "updated_at">,
  ) => api.post<PastMedicalHistory>("/api/ehr/past-medical-history/", data),

  getAll: () =>
    api.get<ApiListResponse<PastMedicalHistory>>(
      "/api/ehr/past-medical-history/",
    ),

  getById: (recordId: string) =>
    api.get<PastMedicalHistory>(`/api/ehr/past-medical-history/${recordId}`),

  update: (recordId: string, data: Partial<PastMedicalHistory>) =>
    api.put<PastMedicalHistory>(
      `/api/ehr/past-medical-history/${recordId}`,
      data,
    ),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/past-medical-history/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<PastMedicalHistory>>(
      `/api/ehr/past-medical-history/patient/${patientId}`,
    ),
};

// Medication History API
export const medicationHistoryApi = {
  create: (
    data: Omit<MedicationHistory, "_id" | "created_at" | "updated_at">,
  ) => api.post<MedicationHistory>("/api/ehr/medication-history/", data),

  getAll: () =>
    api.get<ApiListResponse<MedicationHistory>>("/api/ehr/medication-history/"),

  getById: (recordId: string) =>
    api.get<MedicationHistory>(`/api/ehr/medication-history/${recordId}`),

  update: (recordId: string, data: Partial<MedicationHistory>) =>
    api.put<MedicationHistory>(`/api/ehr/medication-history/${recordId}`, data),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/medication-history/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<MedicationHistory>>(
      `/api/ehr/medication-history/patient/${patientId}`,
    ),
};

// Allergy History API
export const allergyHistoryApi = {
  create: (data: Omit<AllergyHistory, "_id" | "created_at" | "updated_at">) =>
    api.post<AllergyHistory>("/api/ehr/allergy-history/", data),

  getAll: () =>
    api.get<ApiListResponse<AllergyHistory>>("/api/ehr/allergy-history/"),

  getById: (recordId: string) =>
    api.get<AllergyHistory>(`/api/ehr/allergy-history/${recordId}`),

  update: (recordId: string, data: Partial<AllergyHistory>) =>
    api.put<AllergyHistory>(`/api/ehr/allergy-history/${recordId}`, data),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/allergy-history/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<AllergyHistory>>(
      `/api/ehr/allergy-history/patient/${patientId}`,
    ),
};

// Vital Signs API
export const vitalSignsApi = {
  create: (data: Omit<VitalSigns, "_id" | "created_at" | "updated_at">) =>
    api.post<VitalSigns>("/api/ehr/vital-signs/", data),

  getAll: () => api.get<ApiListResponse<VitalSigns>>("/api/ehr/vital-signs/"),

  getById: (recordId: string) =>
    api.get<VitalSigns>(`/api/ehr/vital-signs/${recordId}`),

  update: (recordId: string, data: Partial<VitalSigns>) =>
    api.put<VitalSigns>(`/api/ehr/vital-signs/${recordId}`, data),

  delete: (recordId: string) =>
    api.delete<never>(`/api/ehr/vital-signs/${recordId}`),

  getByPatient: (patientId: string) =>
    api.get<Array<VitalSigns>>(`/api/ehr/vital-signs/patient/${patientId}`),
};

// Cases API
export const casesApi = {
  create: (data: Omit<Case, "_id" | "created_at" | "updated_at">) =>
    api.post<Case>("/api/diagnosis/cases/", data),

  getAll: () => api.get<ApiListResponse<Case>>("/api/diagnosis/cases/"),

  getById: (caseId: string) => api.get<Case>(`/api/diagnosis/cases/${caseId}`),

  update: (caseId: string, data: Partial<Case>) =>
    api.put<Case>(`/api/diagnosis/cases/${caseId}`, data),

  delete: (caseId: string) =>
    api.delete<never>(`/api/diagnosis/cases/${caseId}`),

  getByPatient: (patientId: string) =>
    api.get<{ data: Array<Case> }>(`/api/diagnosis/cases/patient/${patientId}`),

  updateStatus: (caseId: string, status: Case["status"]) =>
    api.patch<Case>(`/api/diagnosis/cases/${caseId}/status`, { status }),

  search: (query: string) =>
    api.get<Array<Case>>(`/api/diagnosis/cases/search/`, {
      params: { q: query },
    }),
};

// Tests API
export const testsApi = {
  create: (data: Omit<Test, "_id" | "created_at" | "updated_at">) =>
    api.post<Test>("/api/diagnosis/tests/", data),

  getAll: () => api.get<ApiListResponse<Test>>("/api/diagnosis/tests/"),

  getById: (testId: string) => api.get<Test>(`/api/diagnosis/tests/${testId}`),

  update: (testId: string, data: Partial<Test>) =>
    api.put<Test>(`/api/diagnosis/tests/${testId}`, data),

  delete: (testId: string) =>
    api.delete<never>(`/api/diagnosis/tests/${testId}`),

  getByPatient: (patientId: string) =>
    api.get<{ data: Array<Test> }>(`/api/diagnosis/tests/patient/${patientId}`),

  getByCase: (caseId: string) =>
    api.get<ApiListResponse<Test>>(`/api/diagnosis/tests/case/${caseId}`),

  uploadResults: (testId: string, results: FormData) =>
    api.post<never>(`/api/diagnosis/tests/${testId}/upload-results`, results, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  downloadResults: (testId: string) =>
    api.get(`/api/diagnosis/tests/${testId}/download-results`, {
      responseType: "blob",
    }),

  deleteResults: (testId: string) =>
    api.delete<never>(`/api/diagnosis/tests/${testId}/results`),
};

// Medicines API
export const medicinesApi = {
  create: (data: Omit<Medicine, "_id" | "created_at" | "updated_at">) =>
    api.post<Medicine>("/api/diagnosis/medicines/", data),

  getAll: () => api.get<ApiListResponse<Medicine>>("/api/diagnosis/medicines/"),

  getById: (medicineId: string) =>
    api.get<Medicine>(`/api/diagnosis/medicines/${medicineId}`),

  update: (medicineId: string, data: Partial<Medicine>) =>
    api.put<Medicine>(`/api/diagnosis/medicines/${medicineId}`, data),

  delete: (medicineId: string) =>
    api.delete<never>(`/api/diagnosis/medicines/${medicineId}`),

  getByPatient: (patientId: string) =>
    api.get<{ data: Array<Medicine> }>(
      `/api/diagnosis/medicines/patient/${patientId}`,
    ),

  getByCase: (caseId: string) =>
    api.get<ApiListResponse<Medicine>>(
      `/api/diagnosis/medicines/case/${caseId}`,
    ),

  discontinue: (medicineId: string) =>
    api.patch<Medicine>(`/api/diagnosis/medicines/${medicineId}/discontinue`),

  reactivate: (medicineId: string) =>
    api.patch<Medicine>(`/api/diagnosis/medicines/${medicineId}/reactivate`),

  checkInteractions: (medicineIds: string[]) =>
    api.get<{
      patient_id: string;
      active_medicines: Medicine[];
      interactions: Array<{
        medicine1: string;
        medicine2: string;
        interaction: string;
      }>;
      interaction_count: number;
    }>(`/api/diagnosis/medicines/interactions/check`, {
      params: { medicines: medicineIds.join(",") },
    }),

  search: (query: string) =>
    api.get<Array<Medicine>>(`/api/diagnosis/medicines/search/`, {
      params: { q: query },
    }),
};

// Treatments API
export const treatmentsApi = {
  create: (data: Omit<Treatment, "_id" | "created_at" | "updated_at">) =>
    api.post<Treatment>("/api/diagnosis/treatments/", data),

  getAll: () =>
    api.get<ApiListResponse<Treatment>>("/api/diagnosis/treatments/"),

  getById: (treatmentId: string) =>
    api.get<Treatment>(`/api/diagnosis/treatments/${treatmentId}`),

  update: (treatmentId: string, data: Partial<Treatment>) =>
    api.put<Treatment>(`/api/diagnosis/treatments/${treatmentId}`, data),

  delete: (treatmentId: string) =>
    api.delete<never>(`/api/diagnosis/treatments/${treatmentId}`),

  getByPatient: (patientId: string) =>
    api.get<{ data: Array<Treatment> }>(
      `/api/diagnosis/treatments/patient/${patientId}`,
    ),

  getByCase: (caseId: string) =>
    api.get<ApiListResponse<Treatment>>(
      `/api/diagnosis/treatments/case/${caseId}`,
    ),

  getTypesSummary: () =>
    api.get<Record<string, number>>("/api/diagnosis/treatments/types/summary"),

  updateOutcome: (treatmentId: string, outcome: string) =>
    api.patch<Treatment>(`/api/diagnosis/treatments/${treatmentId}/outcome`, {
      outcome,
    }),

  search: (query: string) =>
    api.get<Array<Treatment>>(`/api/diagnosis/treatments/search/`, {
      params: { q: query },
    }),
};

// Diagnoses API
export const diagnosesApi = {
  create: (data: Omit<Diagnosis, "_id" | "created_at" | "updated_at">) =>
    api.post<Diagnosis>("/api/diagnosis/diagnoses/", data),

  getAll: () =>
    api.get<ApiListResponse<Diagnosis>>("/api/diagnosis/diagnoses/"),

  getById: (diagnosisId: string) =>
    api.get<Diagnosis>(`/api/diagnosis/diagnoses/${diagnosisId}`),

  update: (diagnosisId: string, data: Partial<Diagnosis>) =>
    api.put<Diagnosis>(`/api/diagnosis/diagnoses/${diagnosisId}`, data),

  delete: (diagnosisId: string) =>
    api.delete<never>(`/api/diagnosis/diagnoses/${diagnosisId}`),

  getByPatient: (patientId: string) =>
    api.get<{ data: Array<Diagnosis> }>(
      `/api/diagnosis/diagnoses/patient/${patientId}`,
    ),

  getByCase: (caseId: string) =>
    api.get<ApiListResponse<Diagnosis>>(
      `/api/diagnosis/diagnoses/case/${caseId}`,
    ),

  getStatistics: () =>
    api.get<Record<string, number>>("/api/diagnosis/diagnoses/statistics/"),

  updateStatus: (diagnosisId: string, status: Diagnosis["status"]) =>
    api.patch<Diagnosis>(`/api/diagnosis/diagnoses/${diagnosisId}/status`, {
      status,
    }),

  updateFollowUp: (diagnosisId: string, followUp: string) =>
    api.patch<Diagnosis>(`/api/diagnosis/diagnoses/${diagnosisId}/follow-up`, {
      follow_up: followUp,
    }),

  search: (query: string) =>
    api.get<Array<Diagnosis>>(`/api/diagnosis/diagnoses/search/`, {
      params: { q: query },
    }),
};

// Utility functions to fetch complete patient data
export const patientApi = {
  getPatientById: async (patientId: string): Promise<Patient> => {
    try {
      const [
        demographicsResponse,
        vitalsResponse,
        hpiResponse,
        pmhResponse,
        medicationHistoryResponse,
        allergyHistoryResponse,
        casesResponse,
        testsResponse,
        medicinesResponse,
        diagnosesResponse,
        treatmentsResponse,
      ] = await Promise.allSettled([
        demographicsApi.getByPatient(patientId),
        vitalSignsApi.getByPatient(patientId),
        historyPresentIllnessApi.getByPatient(patientId),
        pastMedicalHistoryApi.getByPatient(patientId),
        medicationHistoryApi.getByPatient(patientId),
        allergyHistoryApi.getByPatient(patientId),
        casesApi.getByPatient(patientId),
        testsApi.getByPatient(patientId),
        medicinesApi.getByPatient(patientId),
        diagnosesApi.getByPatient(patientId),
        treatmentsApi.getByPatient(patientId),
      ]);

      const demographics =
        demographicsResponse.status === "fulfilled"
          ? demographicsResponse.value.data[0]
          : null;
      const vitals =
        vitalsResponse.status === "fulfilled" ? vitalsResponse.value.data : [];
      const hpi =
        hpiResponse.status === "fulfilled"
          ? hpiResponse.value.data[0]
          : undefined;
      const pmh =
        pmhResponse.status === "fulfilled"
          ? pmhResponse.value.data[0]
          : undefined;
      const medicationHistory =
        medicationHistoryResponse.status === "fulfilled"
          ? medicationHistoryResponse.value.data[0]
          : undefined;
      const allergyHistory =
        allergyHistoryResponse.status === "fulfilled"
          ? allergyHistoryResponse.value.data[0]
          : undefined;
      const cases =
        casesResponse.status === "fulfilled"
          ? casesResponse.value.data.data
          : [];
      const tests =
        testsResponse.status === "fulfilled"
          ? testsResponse.value.data.data
          : [];
      const medicines =
        medicinesResponse.status === "fulfilled"
          ? medicinesResponse.value.data.data
          : [];
      const diagnoses =
        diagnosesResponse.status === "fulfilled"
          ? diagnosesResponse.value.data.data
          : [];
      const treatments =
        treatmentsResponse.status === "fulfilled"
          ? treatmentsResponse.value.data.data
          : [];

      if (!demographics) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      return {
        demographics,
        vitals,
        historyPresentIllness: hpi,
        pastMedicalHistory: pmh,
        medicationHistory,
        allergyHistory,
        cases,
        tests,
        medicines,
        diagnoses,
        treatments,
      };
    } catch (error) {
      console.error("Error fetching patient data:", error);
      throw error;
    }
  },

  getAllPatients: async (): Promise<Patient[]> => {
    try {
      const demographicsResponse = await demographicsApi.getAll();
      const allDemographics = demographicsResponse.data;

      const patients: Patient[] = [];

      for (const demo of allDemographics) {
        if (demo.patient_id) {
          try {
            const patient = await patientApi.getPatientById(demo.patient_id);
            patients.push(patient);
          } catch (error) {
            console.warn(
              `Failed to fetch data for patient ${demo.patient_id}:`,
              error,
            );
            // Add patient with minimal data if full data fetch fails
            patients.push({
              demographics: demo,
              vitals: [],
              cases: [],
              tests: [],
              medicines: [],
              diagnoses: [],
              treatments: [],
            });
          }
        }
      }

      return patients;
    } catch (error) {
      console.error("Error fetching all patients:", error);
      throw error;
    }
  },
};

// CDSS API - Clinical Decision Support System APIs
export const cdssApi = {
  // Dialogue Management
  initiateDialogue: (caseId: string) =>
    api.post<ConversationResponse>(`/api/intelligence/dialog/cases/${caseId}/initiation`),

  continueDialogue: (conversationId: string, userInput: string) =>
    api.post<ConversationResponse>(`/api/intelligence/dialog/dialogues/${conversationId}/continuation`, {
      user_input: userInput,
    }),

  getDialogue: (conversationId: string) =>
    api.get<ConversationDetails>(`/api/intelligence/dialog/dialogues/${conversationId}`),

  // Clinical Recommendations
  getRecommendedTests: (caseId: string) =>
    api.post<Test[]>(`/api/intelligence/recommendation/${caseId}/tests`),

  getRecommendedTreatments: (caseId: string) =>
    api.post<ClinicalRecommendations>(`/api/intelligence/recommendation/${caseId}/treatments`),

  // Transcription Management
  saveTranscription: (caseId: string, data: TranscriptionSaveRequest) =>
    api.post<{ message: string }>(`/api/intelligence/transcription/${caseId}/incremental`, data),
};

// Export the axios instance for custom requests
export default api;

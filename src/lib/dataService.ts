import type { Patient, Demographics, Case, Test, Medicine, Diagnosis, Treatment, VitalSigns } from '~/types';
import { 
  patientApi, 
  diagnosesApi, 
  casesApi, 
  demographicsApi,
  vitalSignsApi,
  testsApi,
  medicinesApi,
  treatmentsApi,
  historyPresentIllnessApi
} from './api';

// Function to get basic patient list (demographics only)
export const getPatientsList = async (): Promise<Demographics[]> => {
  try {
    const response = await demographicsApi.getAll();
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patients list from API:', error);
    return [];
  }
};

// Function to get a specific patient's demographics
export const getPatientDemographics = async (patientId: string): Promise<Demographics | null> => {
  try {
    const response = await demographicsApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch demographics for patient ${patientId}:`, error);
    return null;
  }
};

// Function to get a specific patient's vital signs
export const getPatientVitals = async (patientId: string): Promise<VitalSigns[]> => {
  try {
    const response = await vitalSignsApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch vitals for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get a specific patient's cases
export const getPatientCases = async (patientId: string): Promise<Case[]> => {
  try {
    const response = await casesApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch cases for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get a specific patient's tests
export const getPatientTests = async (patientId: string): Promise<Test[]> => {
  try {
    const response = await testsApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tests for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get a specific patient's medicines
export const getPatientMedicines = async (patientId: string): Promise<Medicine[]> => {
  try {
    const response = await medicinesApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch medicines for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get a specific patient's diagnoses
export const getPatientDiagnoses = async (patientId: string): Promise<Diagnosis[]> => {
  try {
    const response = await diagnosesApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch diagnoses for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get a specific patient's treatments
export const getPatientTreatments = async (patientId: string): Promise<Treatment[]> => {
  try {
    const response = await treatmentsApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch treatments for patient ${patientId}:`, error);
    return [];
  }
};

// Function to get patient's history of present illness
export const getPatientHistoryPresentIllness = async (patientId: string) => {
  try {
    const response = await historyPresentIllnessApi.getByPatient(patientId);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch HPI for patient ${patientId}:`, error);
    return null;
  }
};

// Function to get full patient data on-demand (for backward compatibility)
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    const result = await patientApi.getPatientById(patientId);
    return result
  } catch (error) {
    console.error(`Failed to fetch patient ${patientId} from API:`, error);
    return null;
  }
};

// Function to get all patients (kept for backward compatibility but not recommended for large datasets)
export const getPatients = async (): Promise<Patient[]> => {
  try {
    return await patientApi.getAllPatients();
  } catch (error) {
    console.error('Failed to fetch patients from API:', error);
    return [];
  }
};

// Dashboard stats calculation based on actual data
export const getDashboardStats = async () => {
  try {
    const [patients, allCases, diagnosesStats] = await Promise.allSettled([
      patientApi.getAllPatients(),
      casesApi.getAll(),
      diagnosesApi.getStatistics().catch(() => ({ data: null })),
    ]);

    const patientsData = patients.status === 'fulfilled' ? patients.value : [];
    const casesData = allCases.status === 'fulfilled' ? allCases.value.data.data : [];

    // Calculate today's encounters (cases created today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEncounters = casesData.filter(c => {
      const caseDate = new Date(c.created_at);
      caseDate.setHours(0, 0, 0, 0);
      return caseDate.getTime() === today.getTime();
    }).length;

    // Calculate case statistics
    const activeCases = casesData.filter(c => c.status === 'in_progress' || c.status === 'open').length;
    const completedCases = casesData.filter(c => c.status === 'closed').length;

    return {
      totalPatients: patientsData.length,
      todayEncounters,
      accuracy: 94.2, // This would need to be calculated based on actual diagnosis accuracy
      avgResponseTime: "2.3s", // This would need to be tracked from actual response times
      totalCases: casesData.length,
      activeCases,
      completedCases,
    };
  } catch (error) {
    console.error('Failed to calculate dashboard stats:', error);
    // Return default stats as fallback
    return {
      totalPatients: 0,
      todayEncounters: 0,
      accuracy: 0,
      avgResponseTime: "0s",
      totalCases: 0,
      activeCases: 0,
      completedCases: 0,
    };
  }
};

// Export individual API modules for direct use
export {
  demographicsApi,
  vitalSignsApi,
  historyPresentIllnessApi,
  pastMedicalHistoryApi,
  medicationHistoryApi,
  allergyHistoryApi,
  casesApi,
  testsApi,
  medicinesApi,
  treatmentsApi,
  diagnosesApi,
  patientApi,
} from './api';

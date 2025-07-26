// EHR Data Types
export interface Demographics {
  _id?: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: "male" | "female" | "other";
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_info?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VitalSigns {
  _id?: string;
  patient_id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  pain_scale?: number;
  measurement_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface HistoryPresentIllness {
  _id?: string;
  patient_id: string;
  chief_complaint: string;
  history_of_present_illness: string;
  onset?: "sudden" | "gradual";
  duration?: string;
  severity?: number;
  quality?: string;
  radiation?: string;
  associated_symptoms?: string[];
  alleviating_factors?: string[];
  aggravating_factors?: string[];
  previous_episodes?: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PastMedicalHistory {
  _id?: string;
  patient_id: string;
  medical_conditions?: Array<{
    condition: string;
    diagnosed_date: Date;
    status: string;
  }>;
  surgeries?: Array<{ surgery: string; date: Date; hospital: string }>;
  hospitalizations?: Array<{ reason: string; date: Date; duration: number }>;
  chronic_diseases?: string[];
  immunizations?: Array<{ vaccine: string; date: Date }>;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicationHistory {
  _id?: string;
  patient_id: string;
  current_medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    start_date: Date;
  }>;
  past_medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    start_date: Date;
    end_date?: Date;
  }>;
  over_the_counter?: Array<{ name: string; dosage: string; frequency: string }>;
  supplements?: Array<{ name: string; dosage: string; frequency: string }>;
  herbal_remedies?: Array<{ name: string; dosage: string; frequency: string }>;
  medication_adherence?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AllergyHistory {
  _id?: string;
  patient_id: string;
  drug_allergies?: Array<{ drug: string; reaction: string; severity: string }>;
  food_allergies?: Array<{ food: string; reaction: string; severity: string }>;
  environmental_allergies?: Array<{
    allergen: string;
    reaction: string;
    severity: string;
  }>;
  latex_allergy?: boolean;
  no_known_allergies?: boolean;
  allergy_testing_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Case Data Types
export interface Case {
  _id: string;
  patient_id: string;
  case_number: string;
  soap: string;
  case_date: Date;
  transcriptions?: string;
  status: "open" | "closed" | "in_progress";
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Test {
  _id: string;
  case_id: string;
  patient_id: string;
  test_name: string;
  test_date: Date;
  notes?: string;
  results?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Medicine {
  _id: string;
  case_id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  route: "oral" | "topical" | "injection" | "inhalation";
  frequency: string;
  start_date: Date;
  end_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Diagnosis {
  _id: string;
  case_id: string;
  patient_id: string;
  diagnosis_name: string;
  diagnosis_date: Date;
  status: "active" | "resolved" | "recurrent";
  probability?: number;
  notes?: string;
  follow_up: string;
  additional_info?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Treatment {
  _id: string;
  case_id: string;
  patient_id: string;
  treatment_name: string;
  treatment_date: Date;
  treatment_type: "medication" | "therapy" | "surgery" | "lifestyle_change";
  outcome?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  demographics: Demographics;
  vitals: VitalSigns[];
  historyPresentIllness?: HistoryPresentIllness;
  pastMedicalHistory?: PastMedicalHistory;
  medicationHistory?: MedicationHistory;
  allergyHistory?: AllergyHistory;
  cases: Case[];
  tests: Test[];
  medicines: Medicine[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
}

// API Response Wrapper Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  skip?: number;
  limit?: number;
  count?: number;
}

export interface ApiSearchResponse<T> {
  data: T[];
  total: number;
  query: string;
  skip: number;
  limit: number;
}

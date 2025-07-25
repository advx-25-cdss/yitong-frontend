import type { Patient } from "~/types";
import { getPatients, getDashboardStats } from "./dataService";

// Export API-based data functions
export const getMockPatients = async (): Promise<Patient[]> => {
  return await getPatients();
};

export const getMockDashboardStats = async () => {
  return await getDashboardStats();
};

// For backward compatibility, export a promise-based patients array
// This allows existing code to continue working while transitioning to async
export const mockPatients: Promise<Patient[]> = getMockPatients();

// For backward compatibility, export a promise-based dashboard stats
export const dashboardStats: Promise<{
  totalPatients: number;
  todayEncounters: number;
  accuracy: number;
  avgResponseTime: string;
  totalCases: number;
  activeCases: number;
  completedCases: number;
}> = getMockDashboardStats();

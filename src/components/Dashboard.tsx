"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Search,
  Eye,
} from "lucide-react";
import { getPatientsList, getDashboardStats, getPatientById } from "~/lib/dataService";
import type { Patient, Demographics } from "~/types";

interface DashboardProps {
  onPatientSelect?: (patientId: string) => void;
}

export default function Dashboard({ onPatientSelect }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "closed"
  >("all");
  const [patientsList, setPatientsList] = useState<Demographics[]>([]);
  const [patientsData, setPatientsData] = useState<Map<string, Patient>>(new Map());
  const [loadingPatients, setLoadingPatients] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayEncounters: 0,
    accuracy: 0,
    avgResponseTime: "0s",
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data on component mount (only patient list and stats)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [patientsListData, statsData] = await Promise.all([
          getPatientsList(),
          getDashboardStats(),
        ]);
        setPatientsList(patientsListData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Function to load full patient data on-demand
  const loadPatientData = async (patientId: string): Promise<Patient | null> => {
    // Return cached data if available
    if (patientsData.has(patientId)) {
      return patientsData.get(patientId)!;
    }

    // Return null if already loading
    if (loadingPatients.has(patientId)) {
      return null;
    }

    try {
      setLoadingPatients(prev => new Set(prev).add(patientId));
      const patientData = await getPatientById(patientId);
      
      if (patientData) {
        setPatientsData(prev => new Map(prev).set(patientId, patientData));
      }
      
      return patientData;
    } catch (error) {
      console.error(`Failed to load patient data for ${patientId}:`, error);
      return null;
    } finally {
      setLoadingPatients(prev => {
        const newSet = new Set(prev);
        newSet.delete(patientId);
        return newSet;
      });
    }
  };

  const filteredPatients = useMemo((): Demographics[] => {
    return patientsList.filter((patient) => {
      const matchesSearch =
        patient.first_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.last_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.patient_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // For status filtering, we need to check if we have the patient data loaded
      const patientData = patientsData.get(patient.patient_id);
      const matchesStatus =
        statusFilter === "all" || 
        (patientData && patientData.cases.some((c) => c.status === statusFilter));

      return matchesSearch && (statusFilter === "all" || matchesStatus);
    });
  }, [searchTerm, statusFilter, patientsList, patientsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityColor = (severity?: number) => {
    if (!severity) return "bg-gray-100 text-gray-800";
    if (severity >= 8) return "bg-red-100 text-red-800";
    if (severity >= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getPriorityText = (severity?: number) => {
    if (!severity) return "低";
    if (severity >= 8) return "紧急";
    if (severity >= 5) return "中等";
    return "低";
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div>
                <div className="h-4 w-4 animate-pulse bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-24 animate-pulse bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Table */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">⚠️</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              今日患者总数
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalPatients}
            </div>
            <p className="text-muted-foreground text-xs">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              今日诊疗次数
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.todayEncounters}
            </div>
            <p className="text-muted-foreground text-xs">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              诊断准确率
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.accuracy}%</div>
            <p className="text-muted-foreground text-xs">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              平均响应时间
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.avgResponseTime}
            </div>
            <p className="text-muted-foreground text-xs">
              -0.5s from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <CardTitle className="text-lg font-semibold text-gray-500">
              今日患者列表
            </CardTitle>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="搜索患者..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full pl-8 sm:w-64"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "open" | "in_progress" | "closed",
                ) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="open">一诊</SelectItem>
                  <SelectItem value="in_progress">复诊中</SelectItem>
                  <SelectItem value="closed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">患者信息</th>
                  <th className="px-4 py-3 text-left font-medium">主诉</th>
                  <th className="px-4 py-3 text-left font-medium">优先级</th>
                  <th className="px-4 py-3 text-left font-medium">就诊时间</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const patientData = patientsData.get(patient.patient_id);
                  const isLoading = loadingPatients.has(patient.patient_id);
                  const latestVital = patientData?.vitals[patientData.vitals.length - 1];
                  const latestCase = patientData?.cases[patientData.cases.length - 1];

                  return (
                    <tr
                      key={patient.patient_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600">
                              <span className="text-sm font-medium text-white">
                                {patient.first_name[0]}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.first_name}
                              {patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.gender === "male"
                                ? "男"
                                : "女"}{" "}
                              •{" "}
                              {new Date().getFullYear() -
                                new Date(
                                  patient.date_of_birth,
                                ).getFullYear()}
                              岁
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {isLoading ? (
                              <div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div>
                            ) : (
                              patientData?.historyPresentIllness?.chief_complaint ??
                              "无主诉"
                            )}
                          </div>
                          <div className="text-gray-500">
                            {isLoading ? (
                              <div className="h-3 w-16 animate-pulse bg-gray-200 rounded mt-1"></div>
                            ) : (
                              patientData?.historyPresentIllness?.duration ?? ""
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {isLoading ? (
                          <div className="h-6 w-12 animate-pulse bg-gray-200 rounded"></div>
                        ) : (
                          <Badge
                            className={getPriorityColor(
                              patientData?.historyPresentIllness?.severity,
                            )}
                          >
                            {getPriorityText(
                              patientData?.historyPresentIllness?.severity,
                            )}
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {latestCase && (
                          <>
                            <div className="text-sm text-gray-900">
                              {new Date(
                                latestCase.case_date,
                              ).toLocaleDateString("zh-CN")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                latestCase.case_date,
                              ).toLocaleTimeString("zh-CN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {latestCase && (
                          <Badge className={getStatusColor(latestCase.status)}>
                            {latestCase.status === "open"
                              ? "一诊"
                              : latestCase.status === "in_progress"
                                ? "复诊中"
                                : "已完成"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            // Load patient data if not already loaded
                            if (!patientsData.has(patient.patient_id)) {
                              await loadPatientData(patient.patient_id);
                            }
                            onPatientSelect?.(patient.patient_id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>查看 {patient.patient_id}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                未找到患者
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                尝试调整搜索条件或筛选器
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

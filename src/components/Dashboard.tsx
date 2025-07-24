"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "./ui/badge";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Search,
  Eye,
  Heart,
} from "lucide-react";
import { mockPatients, dashboardStats } from "~/lib/mockData";
import type { Patient } from "~/types";

interface DashboardProps {
  onPatientSelect?: (patientId: string) => void;
}

export default function Dashboard({ onPatientSelect }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "closed"
  >("all");

  const filteredPatients = useMemo((): Patient[] => {
    return (mockPatients as Patient[]).filter((patient) => {
      const matchesSearch =
        patient.demographics.first_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.demographics.last_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.demographics.patient_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.historyPresentIllness?.chief_complaint
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        patient.cases.some((c) => c.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日患者总数</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalPatients}
            </div>
            <p className="text-muted-foreground text-xs">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日诊疗次数</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.todayEncounters}
            </div>
            <p className="text-muted-foreground text-xs">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">诊断准确率</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.accuracy}%</div>
            <p className="text-muted-foreground text-xs">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.avgResponseTime}
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
            <CardTitle className="text-lg font-semibold">
              今日患者列表
            </CardTitle>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="搜索患者..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:w-64"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  全部
                </Button>
                <Button
                  variant={statusFilter === "open" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("open")}
                >
                  新建
                </Button>
                <Button
                  variant={
                    statusFilter === "in_progress" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("in_progress")}
                >
                  进行中
                </Button>
                <Button
                  variant={statusFilter === "closed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("closed")}
                >
                  已完成
                </Button>
              </div>
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
                  <th className="px-4 py-3 text-left font-medium">生命体征</th>
                  <th className="px-4 py-3 text-left font-medium">优先级</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">就诊时间</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const latestVital = patient.vitals[patient.vitals.length - 1];
                  const latestCase = patient.cases[patient.cases.length - 1];

                  return (
                    <tr
                      key={patient.demographics.patient_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                              <span className="text-sm font-medium text-white">
                                {patient.demographics.first_name[0]}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.demographics.last_name}
                              {patient.demographics.first_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.demographics.patient_id} •{" "}
                              {patient.demographics.gender === "male"
                                ? "男"
                                : "女"}{" "}
                              •{" "}
                              {new Date().getFullYear() -
                                new Date(
                                  patient.demographics.date_of_birth,
                                ).getFullYear()}
                              岁
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {patient.historyPresentIllness?.chief_complaint ??
                              "无主诉"}
                          </div>
                          <div className="text-gray-500">
                            {patient.historyPresentIllness?.duration ?? ""}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>
                              {latestVital?.blood_pressure_systolic}/
                              {latestVital?.blood_pressure_diastolic}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            HR: {latestVital?.heart_rate} • T:{" "}
                            {latestVital?.temperature}°C
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          className={getPriorityColor(
                            patient.historyPresentIllness?.severity,
                          )}
                        >
                          {getPriorityText(
                            patient.historyPresentIllness?.severity,
                          )}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {latestCase && (
                          <Badge className={getStatusColor(latestCase.status)}>
                            {latestCase.status === "open"
                              ? "新建"
                              : latestCase.status === "in_progress"
                                ? "进行中"
                                : "已完成"}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onPatientSelect?.(patient.demographics.patient_id)
                          }
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>查看</span>
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

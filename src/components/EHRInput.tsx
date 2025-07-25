"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Save,
  Plus,
  Trash2,
  Edit,
  FileText,
  TestTube,
  Pill,
  Stethoscope,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Brain,
  Settings,
} from "lucide-react";
import type { Patient } from "~/types";

interface EHRInputProps {
  patient: Patient;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  color: string;
  icon: React.ReactNode;
}

export default function EHRInput({ patient }: EHRInputProps) {
  const [activeSection, setActiveSection] = useState("workflow");
  const [workflowStep, setWorkflowStep] = useState(0);

  // Refs for each section
  const workflowRef = useRef<HTMLDivElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const treatmentRef = useRef<HTMLDivElement>(null);
  const testsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const workflowSteps: WorkflowStep[] = [
    {
      id: "transcription",
      title: "转录完成",
      description: "患者会诊记录已转录",
      status: "completed",
      color: "bg-blue-500 border-blue-200",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "tests",
      title: "AI建议检查",
      description: "系统推荐必要检查项目",
      status: workflowStep >= 1 ? "completed" : "pending",
      color: "bg-purple-500 border-purple-200",
      icon: <TestTube className="h-4 w-4" />,
    },
    {
      id: "results",
      title: "录入检查结果",
      description: "等待检查结果回报",
      status:
        workflowStep >= 2
          ? "completed"
          : workflowStep === 1
            ? "in_progress"
            : "pending",
      color: "bg-orange-500 border-orange-200",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: "diagnosis",
      title: "AI诊断分析",
      description: "基于检查结果生成诊断",
      status:
        workflowStep >= 3
          ? "completed"
          : workflowStep === 2
            ? "in_progress"
            : "pending",
      color: "bg-red-500 border-red-200",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "treatment",
      title: "治疗方案",
      description: "制定个性化治疗计划",
      status:
        workflowStep >= 4
          ? "completed"
          : workflowStep === 3
            ? "in_progress"
            : "pending",
      color: "bg-green-500 border-green-200",
      icon: <Pill className="h-4 w-4" />,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 animate-spin text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleNextStep = () => {
    if (workflowStep < workflowSteps.length - 1) {
      setWorkflowStep(workflowStep + 1);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const refs = {
      workflow: workflowRef,
      diagnosis: diagnosisRef,
      treatment: treatmentRef,
      tests: testsRef,
    };

    const targetRef = refs[sectionId as keyof typeof refs];
    if (targetRef?.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        const targetElement = targetRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const targetPosition =
          targetRect.top - containerRect.top + scrollTop - 20; // 20px offset

        scrollContainer.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }
    setActiveSection(sectionId);
  };

  // Intersection Observer for section highlighting
  useEffect(() => {
    const refs = [workflowRef, diagnosisRef, treatmentRef, testsRef];
    const sectionIds = ["workflow", "diagnosis", "treatment", "tests"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = refs.findIndex((ref) => ref.current === entry.target);
            if (index !== -1 && sectionIds[index]) {
              setActiveSection(sectionIds[index]);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-20% 0px -20% 0px",
      },
    );

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b bg-gradient-to-r from-blue-50 to-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">EHR 数据录入</h3>
              <p className="text-sm text-gray-600">当前会诊记录管理</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-100 text-blue-800"
            >
              {patient.demographics.patient_id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="flex space-x-1 overflow-x-auto p-2">
          <Button
            variant={activeSection === "workflow" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("workflow")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Zap className="h-3 w-3" />
            <span>工作流程</span>
          </Button>
          <Button
            variant={activeSection === "diagnosis" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("diagnosis")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Stethoscope className="h-3 w-3" />
            <span>诊断管理</span>
          </Button>
          <Button
            variant={activeSection === "treatment" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("treatment")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Pill className="h-3 w-3" />
            <span>治疗方案</span>
          </Button>
          <Button
            variant={activeSection === "tests" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("tests")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <TestTube className="h-3 w-3" />
            <span>检查项目</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-8">
          {/* Workflow Section */}
          <div ref={workflowRef} className="space-y-4 p-4">
            <div className="mb-6">
              <h4 className="mb-2 overflow-x-auto font-medium text-gray-900">
                CDSS 工作流程
              </h4>
              <p className="overflow-x-auto text-sm text-gray-600">
                按照标准化流程完成患者诊疗，每个步骤都有AI系统协助
              </p>
            </div>

            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connection line */}
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute top-12 left-6 h-8 w-0.5 bg-gray-200"></div>
                  )}

                  <div
                    className={`rounded-lg border-2 p-4 transition-all ${
                      step.status === "completed"
                        ? "border-green-200 bg-green-50"
                        : step.status === "in_progress"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "in_progress"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      >
                        {step.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="overflow-x-auto font-medium text-gray-900">
                            {step.title}
                          </h5>
                          {getStatusIcon(step.status)}
                        </div>
                        <p className="mt-1 overflow-x-auto text-sm text-gray-600">
                          {step.description}
                        </p>

                        {step.status === "in_progress" && (
                          <div className="mt-3">
                            <Button
                              onClick={handleNextStep}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <span>完成此步骤</span>
                            </Button>
                          </div>
                        )}

                        {/* Step-specific content */}
                        {step.id === "tests" && step.status === "completed" && (
                          <div className="mt-3 space-y-2">
                            <div className="text-sm">
                              <p className="font-medium text-purple-800">
                                AI推荐检查：
                              </p>
                              <ul className="list-inside list-disc space-y-1 text-purple-700">
                                <li>心电图</li>
                                <li>超声心动图</li>
                                <li>血脂全套</li>
                                <li>肌钙蛋白</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {step.id === "diagnosis" &&
                          step.status === "completed" && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm">
                                <p className="font-medium text-red-800">
                                  AI诊断建议：
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded border border-red-200 bg-white p-2">
                                    <span className="overflow-x-auto text-red-700">
                                      {patient.diagnoses[0]?.diagnosis_name}
                                    </span>
                                    <Badge className="bg-red-100 text-red-800">
                                      {patient.diagnoses[0]?.probability}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {step.id === "treatment" &&
                          step.status === "completed" && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm">
                                <p className="font-medium text-green-800">
                                  治疗方案：
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="rounded border border-green-200 bg-white p-2">
                                    <p className="font-medium text-green-700">
                                      药物治疗
                                    </p>
                                    <p className="overflow-x-auto text-xs text-green-600">
                                      {patient.medicines[0]?.medicine_name}
                                    </p>
                                  </div>
                                  <div className="rounded border border-blue-200 bg-white p-2">
                                    <p className="font-medium text-blue-700">
                                      生活干预
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      饮食运动指导
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {workflowStep === workflowSteps.length - 1 && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h5 className="font-medium text-green-900">工作流程完成</h5>
                </div>
                <p className="overflow-x-auto text-sm text-green-700">
                  患者诊疗流程已完成，所有数据已录入EHR系统。您可以继续查看详细信息或开始新的患者诊疗。
                </p>
              </div>
            )}
          </div>

          {/* Diagnosis Section */}
          <div ref={diagnosisRef} className="bg-red-25 space-y-4 border-t p-4">
            <div className="flex items-center justify-between overflow-x-auto">
              <h4 className="font-medium whitespace-nowrap text-gray-900">
                诊断管理
              </h4>
              <Button size="sm" className="whitespace-nowrap">
                <Plus className="mr-1 h-3 w-3" />
                添加诊断
              </Button>
            </div>

            <div className="space-y-3">
              {patient.diagnoses.map((diagnosis) => (
                <Card key={diagnosis._id} className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between overflow-x-auto">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Stethoscope className="h-4 w-4 text-red-600" />
                        <span className="overflow-x-auto text-red-900">
                          {diagnosis.diagnosis_name}
                        </span>
                      </CardTitle>
                      <div className="flex flex-shrink-0 items-center space-x-2">
                        <Badge className="bg-red-100 whitespace-nowrap text-red-800">
                          置信度: {diagnosis.probability}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`whitespace-nowrap ${
                            diagnosis.status === "active"
                              ? "border-green-200 text-green-800"
                              : diagnosis.status === "resolved"
                                ? "border-gray-200 text-gray-800"
                                : "border-yellow-200 text-yellow-800"
                          }`}
                        >
                          {diagnosis.status === "active"
                            ? "活动期"
                            : diagnosis.status === "resolved"
                              ? "已解决"
                              : "复发"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-red-600">诊断日期</p>
                        <p className="text-red-800">
                          {new Date(
                            diagnosis.diagnosis_date,
                          ).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-red-600">随访安排</p>
                        <p className="overflow-x-auto text-red-800">
                          {diagnosis.follow_up}
                        </p>
                      </div>
                    </div>

                    {diagnosis.notes && (
                      <div>
                        <p className="text-sm font-medium text-red-600">备注</p>
                        <p className="overflow-x-auto text-sm text-red-800">
                          {diagnosis.notes}
                        </p>
                      </div>
                    )}

                    {diagnosis.additional_info && (
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          补充信息
                        </p>
                        <p className="overflow-x-auto text-sm text-red-800">
                          {diagnosis.additional_info}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Treatment Section */}
          <div
            ref={treatmentRef}
            className="bg-green-25 space-y-4 border-t p-4"
          >
            <div className="flex items-center justify-between overflow-x-auto">
              <h4 className="font-medium whitespace-nowrap text-gray-900">
                治疗方案
              </h4>
              <Button size="sm" className="whitespace-nowrap">
                <Plus className="mr-1 h-3 w-3" />
                添加治疗
              </Button>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <h5 className="flex items-center space-x-2 font-medium text-blue-900">
                <Pill className="h-4 w-4" />
                <span>药物治疗</span>
              </h5>

              {patient.medicines.map((medicine) => (
                <Card key={medicine._id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between overflow-x-auto">
                      <div className="min-w-0 flex-1">
                        <h6 className="overflow-x-auto font-medium text-blue-900">
                          {medicine.medicine_name}
                        </h6>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p className="overflow-x-auto">
                            剂量: {medicine.dosage} • 频次: {medicine.frequency}
                          </p>
                          <p className="overflow-x-auto">
                            给药途径:{" "}
                            {medicine.route === "oral"
                              ? "口服"
                              : medicine.route === "injection"
                                ? "注射"
                                : medicine.route === "topical"
                                  ? "外用"
                                  : "吸入"}
                          </p>
                          {medicine.notes && (
                            <p className="overflow-x-auto">
                              备注: {medicine.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center space-x-2">
                        <Badge
                          className={`whitespace-nowrap ${
                            medicine.route === "injection"
                              ? "bg-red-100 text-red-800"
                              : medicine.route === "oral"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {medicine.route === "oral"
                            ? "口服"
                            : medicine.route === "injection"
                              ? "注射"
                              : medicine.route === "topical"
                                ? "外用"
                                : "吸入"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Other Treatments */}
            <div className="space-y-3">
              <h5 className="flex items-center space-x-2 font-medium text-green-900">
                <Target className="h-4 w-4" />
                <span>其他治疗</span>
              </h5>

              {patient.treatments.map((treatment) => (
                <Card
                  key={treatment._id}
                  className="border-green-200 bg-green-50"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between overflow-x-auto">
                      <div className="min-w-0 flex-1">
                        <h6 className="overflow-x-auto font-medium text-green-900">
                          {treatment.treatment_name}
                        </h6>
                        <div className="space-y-1 text-sm text-green-700">
                          <p className="overflow-x-auto">
                            类型:{" "}
                            {treatment.treatment_type === "medication"
                              ? "药物治疗"
                              : treatment.treatment_type === "therapy"
                                ? "物理治疗"
                                : treatment.treatment_type === "surgery"
                                  ? "手术治疗"
                                  : "生活方式干预"}
                          </p>
                          <p>
                            日期:{" "}
                            {new Date(
                              treatment.treatment_date,
                            ).toLocaleDateString("zh-CN")}
                          </p>
                          {treatment.outcome && (
                            <p className="overflow-x-auto">
                              结果: {treatment.outcome}
                            </p>
                          )}
                          {treatment.notes && (
                            <p className="overflow-x-auto">
                              备注: {treatment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center space-x-2">
                        <Badge
                          className={`whitespace-nowrap ${
                            treatment.treatment_type === "surgery"
                              ? "bg-red-100 text-red-800"
                              : treatment.treatment_type === "medication"
                                ? "bg-blue-100 text-blue-800"
                                : treatment.treatment_type === "therapy"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {treatment.treatment_type === "medication"
                            ? "药物"
                            : treatment.treatment_type === "therapy"
                              ? "治疗"
                              : treatment.treatment_type === "surgery"
                                ? "手术"
                                : "生活方式"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tests Section */}
          <div ref={testsRef} className="bg-purple-25 space-y-4 border-t p-4">
            <div className="flex items-center justify-between overflow-x-auto">
              <h4 className="font-medium whitespace-nowrap text-gray-900">
                检查项目
              </h4>
              <Button size="sm" className="whitespace-nowrap">
                <Plus className="mr-1 h-3 w-3" />
                添加检查
              </Button>
            </div>

            <div className="space-y-3">
              {patient.tests.map((test) => (
                <Card key={test._id} className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between overflow-x-auto">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <TestTube className="h-4 w-4 text-purple-600" />
                        <span className="overflow-x-auto text-purple-900">
                          {test.test_name}
                        </span>
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-purple-200 whitespace-nowrap text-purple-800"
                      >
                        {new Date(test.test_date).toLocaleDateString("zh-CN")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {test.results && test.results.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-purple-600">
                          检查结果
                        </p>
                        <div className="space-y-1">
                          {test.results.map((result, index) => (
                            <div
                              key={index}
                              className="rounded border border-purple-200 bg-white p-2"
                            >
                              <p className="overflow-x-auto text-sm text-purple-800">
                                {result}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {test.notes && (
                      <div>
                        <p className="text-sm font-medium text-purple-600">
                          备注
                        </p>
                        <p className="overflow-x-auto text-sm text-purple-800">
                          {test.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600"
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        查看趋势
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            最后更新: {new Date().toLocaleString("zh-CN")}
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              生成报告
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="mr-1 h-3 w-3" />
              保存更改
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

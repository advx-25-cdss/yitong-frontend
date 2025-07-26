"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Save,
  FileText,
  TestTube,
  Pill,
  Stethoscope,
  Clock,
  AlertCircle,
  CheckCircle,
  Brain,
  Settings,
  Building2,
  Scissors,
  Plus,
  Edit,
  Calendar,
  Activity,
} from "lucide-react";
import type { Patient, Medicine, Test, Diagnosis, Treatment } from "~/types";
import { TestBlock } from "./ehr/TestBlock";
import { DiagnosisBlock } from "./ehr/DiagnosisBlock";
import { HospitalizationBlock } from "./ehr/HospitalizationBlock";
import { SurgeryBlock } from "./ehr/SurgeryBlock";
import { TreatmentBlock } from "./ehr/TreatmentBlock";

// Mock hospitalization data structure
interface Hospitalization {
  _id: string;
  admission_date: string;
  discharge_date?: string;
  department: string;
  bed_number: string;
  attending_doctor: string;
  admission_diagnosis: string;
  treatment_plan: string[];
  status: "active" | "discharged" | "planned";
  notes?: string;
}

// Mock surgery data structure
interface Surgery {
  _id: string;
  surgery_name: string;
  surgery_date: string;
  surgery_room: string;
  surgeon: string;
  anesthesia_type: "general" | "regional" | "local" | "sedation";
  indication: string;
  preparation: string[];
  risk_assessment: "low" | "medium" | "high";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  duration?: number;
}

interface EHRInputProps {
  patient: Patient | null;
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
  const [activeSection, setActiveSection] = useState("overview");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [caseId, setCaseId] = useState<string>(
    (patient?.cases[0]?._id || "") ?? "",
  );

  // State for managing component data
  const [medicines, setMedicines] = useState<Medicine[]>(
    patient?.medicines || [],
  );
  const [tests, setTests] = useState<Test[]>(patient?.tests || []);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(
    patient?.diagnoses || [],
  );
  const [treatments, setTreatments] = useState<Treatment[]>(
    patient?.treatments || [],
  );

  // Update state when patient data changes
  useEffect(() => {
    if (patient) {
      setMedicines(patient.medicines || []);
      setTests(patient.tests || []);
      setDiagnoses(patient.diagnoses || []);
      setTreatments(patient.treatments || []);
    }
  }, [patient]);

  // Show loading state if patient is not yet loaded
  if (!patient) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">电子病历录入</h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for hospitalizations and surgeries
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>(
    [],
  );

  const [surgeries, setSurgeries] = useState<Surgery[]>([]);

  // CRUD handlers for medicines
  const handleAddMedicine = (medicine: Omit<Medicine, "_id">) => {
    const newMedicine: Medicine = {
      ...medicine,
      _id: `med_${Date.now()}`,
    };
    setMedicines((prev) => [...prev, newMedicine]);
  };

  const handleUpdateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((med) => (med._id === id ? { ...med, ...updates } : med)),
    );
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((med) => med._id !== id));
  };

  // CRUD handlers for tests
  const handleAddTest = (test: Omit<Test, "_id">) => {
    const newTest: Test = {
      ...test,
      _id: `test_${Date.now()}`,
    };
    setTests((prev) => [...prev, newTest]);
  };

  const handleUpdateTest = (id: string, updates: Partial<Test>) => {
    setTests((prev) =>
      prev.map((test) => (test._id === id ? { ...test, ...updates } : test)),
    );
  };

  const handleDeleteTest = (id: string) => {
    setTests((prev) => prev.filter((test) => test._id !== id));
  };

  // CRUD handlers for diagnoses
  const handleAddDiagnosis = (diagnosis: Omit<Diagnosis, "_id">) => {
    const newDiagnosis: Diagnosis = {
      ...diagnosis,
      _id: `diag_${Date.now()}`,
    };
    setDiagnoses((prev) => [...prev, newDiagnosis]);
  };

  const handleUpdateDiagnosis = (id: string, updates: Partial<Diagnosis>) => {
    setDiagnoses((prev) =>
      prev.map((diag) => (diag._id === id ? { ...diag, ...updates } : diag)),
    );
  };

  const handleDeleteDiagnosis = (id: string) => {
    setDiagnoses((prev) => prev.filter((diag) => diag._id !== id));
  };

  // CRUD handlers for hospitalizations
  const handleAddHospitalization = (
    hospitalization: Omit<Hospitalization, "_id">,
  ) => {
    const newHospitalization: Hospitalization = {
      ...hospitalization,
      _id: `hosp_${Date.now()}`,
    };
    setHospitalizations((prev) => [...prev, newHospitalization]);
  };

  const handleUpdateHospitalization = (
    id: string,
    updates: Partial<Hospitalization>,
  ) => {
    setHospitalizations((prev) =>
      prev.map((hosp) => (hosp._id === id ? { ...hosp, ...updates } : hosp)),
    );
  };

  const handleDeleteHospitalization = (id: string) => {
    setHospitalizations((prev) => prev.filter((hosp) => hosp._id !== id));
  };

  // CRUD handlers for surgeries
  const handleAddSurgery = (surgery: Omit<Surgery, "_id">) => {
    const newSurgery: Surgery = {
      ...surgery,
      _id: `surg_${Date.now()}`,
    };
    setSurgeries((prev) => [...prev, newSurgery]);
  };

  const handleUpdateSurgery = (id: string, updates: Partial<Surgery>) => {
    setSurgeries((prev) =>
      prev.map((surg) => (surg._id === id ? { ...surg, ...updates } : surg)),
    );
  };

  const handleDeleteSurgery = (id: string) => {
    setSurgeries((prev) => prev.filter((surg) => surg._id !== id));
  };

  // CRUD handlers for treatments
  const handleAddTreatment = (treatment: Omit<Treatment, "_id">) => {
    const newTreatment: Treatment = {
      ...treatment,
      _id: `treat_${Date.now()}`,
    };
    setTreatments((prev) => [...prev, newTreatment]);
  };

  const handleUpdateTreatment = (id: string, updates: Partial<Treatment>) => {
    setTreatments((prev) =>
      prev.map((treat) =>
        treat._id === id ? { ...treat, ...updates } : treat,
      ),
    );
  };

  const handleDeleteTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((treat) => treat._id !== id));
  };

  // Refs for each section
  const overviewRef = useRef<HTMLDivElement>(null);
  const testsRef = useRef<HTMLDivElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const treatmentRef = useRef<HTMLDivElement>(null);
  const hospitalizationRef = useRef<HTMLDivElement>(null);
  const surgeryRef = useRef<HTMLDivElement>(null);
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
      overview: overviewRef,
      tests: testsRef,
      diagnosis: diagnosisRef,
      treatment: treatmentRef,
      hospitalization: hospitalizationRef,
      surgery: surgeryRef,
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
    const refs = [
      overviewRef,
      testsRef,
      diagnosisRef,
      treatmentRef,
      hospitalizationRef,
      surgeryRef,
    ];
    const sectionIds = [
      "overview",
      "tests",
      "diagnosis",
      "treatment",
      "hospitalization",
      "surgery",
    ];

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
              {patient?.demographics.patient_id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="flex space-x-1 overflow-x-auto p-2">
          <Button
            variant={activeSection === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("overview")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <FileText className="h-3 w-3" />
            <span>工作流程</span>
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
            variant={activeSection === "hospitalization" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("hospitalization")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Building2 className="h-3 w-3" />
            <span>住院管理</span>
          </Button>
          <Button
            variant={activeSection === "surgery" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection("surgery")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Scissors className="h-3 w-3" />
            <span>手术管理</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-8">
          {/* Overview Section (Workflow) */}
          <div ref={overviewRef} className="space-y-4 p-4">
            <div className="mb-6">
              <h4 className="mb-2 overflow-x-auto font-medium text-gray-900">
                CDSS 工作流程
              </h4>
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
                                      {patient?.diagnoses[0]?.diagnosis_name}
                                    </span>
                                    <Badge className="bg-red-100 text-red-800">
                                      {patient?.diagnoses[0]?.probability}%
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
                                      {patient?.medicines[0]?.medicine_name}
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

          {/* Tests Section */}
          <div
            ref={testsRef}
            className="bg-purple-25/30 space-y-4 border-t p-4"
          >
            <TestBlock
              case_id={caseId}
              onAdd={handleAddTest}
              onUpdate={handleUpdateTest}
              onDelete={handleDeleteTest}
            />
          </div>

          {/* Diagnosis Section */}
          <div
            ref={diagnosisRef}
            className="bg-red-25/30 space-y-4 border-t p-4"
          >
            <DiagnosisBlock
              case_id={caseId}
              onAdd={handleAddDiagnosis}
              onUpdate={handleUpdateDiagnosis}
              onDelete={handleDeleteDiagnosis}
            />
          </div>

          {/* Treatment Section */}
          <div
            ref={treatmentRef}
            className="bg-green-25/30 space-y-4 border-t p-4"
          >
            <TreatmentBlock
              case_id={caseId}
              medicines={medicines}
              treatments={treatments}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onAddTreatment={handleAddTreatment}
              onUpdateTreatment={handleUpdateTreatment}
              onDeleteTreatment={handleDeleteTreatment}
            />
          </div>

          {/* Hospitalization Section */}
          <div
            ref={hospitalizationRef}
            className="bg-blue-25/30 space-y-4 border-t p-4"
          >
            <HospitalizationBlock
              case_id={caseId}
              onAdd={handleAddHospitalization}
              onUpdate={handleUpdateHospitalization}
              onDelete={handleDeleteHospitalization}
            />
          </div>

          {/* Surgery Section */}
          <div
            ref={surgeryRef}
            className="bg-orange-25/30 space-y-4 border-t p-4"
          >
            <SurgeryBlock
              surgeries={[]}
              case_id={caseId}
              onAdd={handleAddSurgery}
              onUpdate={handleUpdateSurgery}
              onDelete={handleDeleteSurgery}
            />
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

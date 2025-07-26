"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Modal } from "~/components/ui/modal";
import {
  Target,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Pill,
  Heart,
  Activity,
  Calendar,
} from "lucide-react";
import type { Medicine, Treatment } from "~/types";
import { treatmentsApi } from "~/lib/api";

interface TreatmentBlockProps {
  case_id: string;
  medicines: Medicine[];
  treatments: Treatment[];
  onAddMedicine: (medicine: Omit<Medicine, "_id">) => void;
  onUpdateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  onDeleteMedicine: (id: string) => void;
  onAddTreatment: (treatment: Omit<Treatment, "_id">) => void;
  onUpdateTreatment: (id: string, treatment: Partial<Treatment>) => void;
  onDeleteTreatment: (id: string) => void;
}

interface MedicineFormData {
  medicine_name: string;
  dosage: string;
  frequency: string;
  route: "oral" | "injection" | "topical" | "inhalation";
  start_date: string;
  end_date?: string;
  notes?: string;
}

interface LifestyleFormData {
  treatment_name: string;
  treatment_date: string;
  description: string;
  goals: string[];
  notes?: string;
}

interface OtherTreatmentFormData {
  treatment_name: string;
  treatment_type: "therapy" | "surgery";
  treatment_date: string;
  provider: string;
  outcome?: string;
  notes?: string;
}

type ModalSection = "medicine" | "lifestyle" | "other";

const routeLabels = {
  oral: "口服",
  injection: "注射",
  topical: "外用",
  inhalation: "吸入",
};

const routeColors = {
  oral: "bg-blue-50 text-blue-700 border-blue-200",
  injection: "bg-red-50 text-red-700 border-red-200",
  topical: "bg-green-50 text-green-700 border-green-200",
  inhalation: "bg-purple-50 text-purple-700 border-purple-200",
};

export function TreatmentBlock({
  case_id,
  medicines,
  treatments,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onAddTreatment,
  onUpdateTreatment,
  onDeleteTreatment,
}: TreatmentBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModalSection, setActiveModalSection] =
    useState<ModalSection>("medicine");
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>(medicines);
  const [localTreatments, setLocalTreatments] =
    useState<Treatment[]>(treatments);

  // Medicine form state
  const [medicineForm, setMedicineForm] = useState<MedicineFormData>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    route: "oral",
    start_date: new Date().toISOString().split("T")[0] ?? "",
    end_date: "",
    notes: "",
  });

  const [editMedicineForm, setEditMedicineForm] = useState<MedicineFormData>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    route: "oral",
    start_date: "",
    end_date: "",
    notes: "",
  });

  // Lifestyle form state
  const [lifestyleForm, setLifestyleForm] = useState<LifestyleFormData>({
    treatment_name: "",
    treatment_date: new Date().toISOString().split("T")[0] ?? "",
    description: "",
    goals: [""],
    notes: "",
  });

  // Other treatment form state
  const [otherTreatmentForm, setOtherTreatmentForm] =
    useState<OtherTreatmentFormData>({
      treatment_name: "",
      treatment_type: "therapy",
      treatment_date: new Date().toISOString().split("T")[0] ?? "",
      provider: "",
      outcome: "",
      notes: "",
    });

  // Load treatments for this case
  useEffect(() => {
    const loadData = async () => {
      if (!case_id) return;

      setLoading(true);
      try {
        const treatmentsResponse = await treatmentsApi.getByCase(case_id);
        setLocalTreatments(treatmentsResponse.data.data);
      } catch (error) {
        console.error("Failed to load treatments data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [case_id]);

  // Update local state when props change
  useEffect(() => {
    setLocalMedicines(medicines);
    setLocalTreatments(treatments);
  }, [medicines, treatments]);

  // Filter treatments by type
  const lifestyleTreatments = localTreatments.filter(
    (t: Treatment) => t.treatment_type === "lifestyle_change",
  );
  const otherTreatments = localTreatments.filter((t: Treatment) =>
    ["therapy", "surgery"].includes(t.treatment_type),
  );

  const handleAddMedicine = () => {
    if (
      medicineForm.medicine_name &&
      medicineForm.dosage &&
      medicineForm.frequency
    ) {
      const newMedicine = {
        medicine_name: medicineForm.medicine_name,
        dosage: medicineForm.dosage,
        frequency: medicineForm.frequency,
        route: medicineForm.route,
        start_date: new Date(medicineForm.start_date),
        end_date: medicineForm.end_date
          ? new Date(medicineForm.end_date)
          : undefined,
        notes: medicineForm.notes,
        case_id: "", // These will be set by the parent component
        patient_id: "",
        created_at: new Date(),
        updated_at: new Date(),
      };
      onAddMedicine(newMedicine);

      // Reset form
      setMedicineForm({
        medicine_name: "",
        dosage: "",
        frequency: "",
        route: "oral",
        start_date: new Date().toISOString().split("T")[0] ?? "",
        end_date: "",
        notes: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicineId(medicine._id);
    setEditMedicineForm({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      route: medicine.route,
      start_date:
        new Date(medicine.start_date).toISOString().split("T")[0] ?? "",
      end_date: medicine.end_date
        ? new Date(medicine.end_date).toISOString().split("T")[0]
        : "",
      notes: medicine.notes ?? "",
    });
  };

  const handleSaveEditMedicine = () => {
    if (editingMedicineId) {
      const updatedMedicine = {
        ...editMedicineForm,
        start_date: new Date(editMedicineForm.start_date),
        end_date: editMedicineForm.end_date
          ? new Date(editMedicineForm.end_date)
          : undefined,
      };
      onUpdateMedicine(editingMedicineId, updatedMedicine);
      setEditingMedicineId(null);
    }
  };

  const handleCancelEditMedicine = () => {
    setEditingMedicineId(null);
    setEditMedicineForm({
      medicine_name: "",
      dosage: "",
      frequency: "",
      route: "oral",
      start_date: "",
      end_date: "",
      notes: "",
    });
  };

  const handleAddLifestyle = () => {
    if (lifestyleForm.treatment_name && lifestyleForm.description) {
      const filteredGoals = lifestyleForm.goals.filter(
        (goal) => goal.trim() !== "",
      );
      const newTreatment = {
        treatment_name: lifestyleForm.treatment_name,
        treatment_type: "lifestyle_change" as const,
        treatment_date: new Date(lifestyleForm.treatment_date),
        outcome: lifestyleForm.description,
        notes: lifestyleForm.notes ?? "",
        case_id: "", // These will be set by the parent component
        patient_id: "",
        created_at: new Date(),
        updated_at: new Date(),
      };
      onAddTreatment(newTreatment);

      // Reset form
      setLifestyleForm({
        treatment_name: "",
        treatment_date: new Date().toISOString().split("T")[0] ?? "",
        description: "",
        goals: [""],
        notes: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const handleAddOtherTreatment = () => {
    if (otherTreatmentForm.treatment_name && otherTreatmentForm.provider) {
      const newTreatment = {
        treatment_name: otherTreatmentForm.treatment_name,
        treatment_type: otherTreatmentForm.treatment_type,
        treatment_date: new Date(otherTreatmentForm.treatment_date),
        outcome: otherTreatmentForm.outcome ?? "",
        notes: `提供者: ${otherTreatmentForm.provider}${otherTreatmentForm.notes ? `\n${otherTreatmentForm.notes}` : ""}`,
        case_id: "", // These will be set by the parent component
        patient_id: "",
        created_at: new Date(),
        updated_at: new Date(),
      };
      onAddTreatment(newTreatment);

      // Reset form
      setOtherTreatmentForm({
        treatment_name: "",
        treatment_type: "therapy",
        treatment_date: new Date().toISOString().split("T")[0] ?? "",
        provider: "",
        outcome: "",
        notes: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const addGoalField = () => {
    setLifestyleForm((prev) => ({
      ...prev,
      goals: [...prev.goals, ""],
    }));
  };

  const removeGoalField = (index: number) => {
    setLifestyleForm((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const updateGoalField = (index: number, value: string) => {
    setLifestyleForm((prev) => ({
      ...prev,
      goals: prev.goals.map((goal, i) => (i === index ? value : goal)),
    }));
  };

  const handleSave = () => {
    switch (activeModalSection) {
      case "medicine":
        handleAddMedicine();
        break;
      case "lifestyle":
        handleAddLifestyle();
        break;
      case "other":
        handleAddOtherTreatment();
        break;
    }
  };

  const getTreatmentTypeLabel = (type: string) => {
    switch (type) {
      case "medication":
        return "药物治疗";
      case "therapy":
        return "物理治疗";
      case "surgery":
        return "手术治疗";
      case "lifestyle_change":
        return "生活方式干预";

      default:
        return type;
    }
  };

  const getTreatmentTypeColor = (type: string) => {
    switch (type) {
      case "medication":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "therapy":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "surgery":
        return "bg-red-50 text-red-700 border-red-200";
      case "lifestyle_change":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <Target className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-semibold text-gray-900">治疗方案</h4>
          <Badge variant="outline" className="text-gray-600">
            {medicines.length + treatments.length} 项
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加治疗
        </Button>
      </div>

      {/* Medicine Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Pill className="h-4 w-4 text-blue-600" />
          <h5 className="text-base font-medium text-gray-900">药物治疗</h5>
          <Badge variant="outline" className="text-gray-600">
            {medicines.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {medicines.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
              <Pill className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500">暂无药物记录</p>
            </div>
          ) : (
            localMedicines.map((medicine: Medicine) => (
              <Card
                key={medicine._id}
                className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  {editingMedicineId === medicine._id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            药物名称 *
                          </label>
                          <Input
                            placeholder="药物名称"
                            value={editMedicineForm.medicine_name}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                medicine_name: e.target.value,
                              })
                            }
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            剂量 *
                          </label>
                          <Input
                            placeholder="剂量"
                            value={editMedicineForm.dosage}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                dosage: e.target.value,
                              })
                            }
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            用药频次 *
                          </label>
                          <Input
                            placeholder="用药频次"
                            value={editMedicineForm.frequency}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                frequency: e.target.value,
                              })
                            }
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            给药途径
                          </label>
                          <Select
                            value={editMedicineForm.route}
                            onValueChange={(
                              value:
                                | "oral"
                                | "injection"
                                | "topical"
                                | "inhalation",
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                route: value,
                              })
                            }
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oral">口服</SelectItem>
                              <SelectItem value="injection">注射</SelectItem>
                              <SelectItem value="topical">外用</SelectItem>
                              <SelectItem value="inhalation">吸入</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            开始日期
                          </label>
                          <Input
                            type="date"
                            value={editMedicineForm.start_date}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                start_date: e.target.value,
                              })
                            }
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            结束日期
                          </label>
                          <Input
                            type="date"
                            value={editMedicineForm.end_date}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setEditMedicineForm({
                                ...editMedicineForm,
                                end_date: e.target.value,
                              })
                            }
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          备注
                        </label>
                        <Textarea
                          placeholder="备注"
                          value={editMedicineForm.notes}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) =>
                            setEditMedicineForm({
                              ...editMedicineForm,
                              notes: e.target.value,
                            })
                          }
                          rows={2}
                          className="border-gray-300"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditMedicine}
                          className="border-gray-300 text-gray-600"
                        >
                          <X className="mr-1 h-3 w-3" />
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEditMedicine}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          <h6 className="font-medium text-gray-900">
                            {medicine.medicine_name}
                          </h6>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            剂量: {medicine.dosage} • 频次: {medicine.frequency}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span>给药途径: {routeLabels[medicine.route]}</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  medicine.start_date,
                                ).toLocaleDateString("zh-CN")}
                              </span>
                              {medicine.end_date && (
                                <>
                                  <span>-</span>
                                  <span>
                                    {new Date(
                                      medicine.end_date,
                                    ).toLocaleDateString("zh-CN")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {medicine.notes && (
                            <p className="text-gray-500">
                              备注: {medicine.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={routeColors[medicine.route]}
                        >
                          {routeLabels[medicine.route]}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMedicine(medicine)}
                          className="border-gray-200 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("确定要删除这个药物吗？")) {
                              onDeleteMedicine(medicine._id);
                            }
                          }}
                          className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Lifestyle Treatments */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Heart className="h-4 w-4 text-green-600" />
          <h5 className="text-base font-medium text-gray-900">生活方式干预</h5>
          <Badge variant="outline" className="text-gray-600">
            {lifestyleTreatments.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {lifestyleTreatments.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
              <Heart className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500">暂无生活方式干预记录</p>
            </div>
          ) : (
            lifestyleTreatments.map((treatment: Treatment) => (
              <Card
                key={treatment._id}
                className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                        <h6 className="font-medium text-gray-900">
                          {treatment.treatment_name}
                        </h6>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              treatment.treatment_date,
                            ).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        {treatment.outcome && (
                          <p className="rounded border bg-gray-50 p-2 text-gray-600">
                            {treatment.outcome}
                          </p>
                        )}
                        {treatment.notes && (
                          <p className="text-gray-500">
                            备注: {treatment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        生活方式
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("确定要删除这个治疗项目吗？")) {
                            onDeleteTreatment(treatment._id);
                          }
                        }}
                        className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Other Treatments */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-4 w-4 text-purple-600" />
          <h5 className="text-base font-medium text-gray-900">其他治疗</h5>
          <Badge variant="outline" className="text-gray-600">
            {otherTreatments.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {otherTreatments.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
              <Activity className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500">暂无其他治疗记录</p>
            </div>
          ) : (
            otherTreatments.map((treatment: Treatment) => (
              <Card
                key={treatment._id}
                className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                        <h6 className="font-medium text-gray-900">
                          {treatment.treatment_name}
                        </h6>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              treatment.treatment_date,
                            ).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        {treatment.outcome && (
                          <p className="rounded border bg-gray-50 p-2 text-gray-600">
                            结果: {treatment.outcome}
                          </p>
                        )}
                        {treatment.notes && (
                          <p className="text-gray-500">
                            备注: {treatment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={getTreatmentTypeColor(
                          treatment.treatment_type,
                        )}
                      >
                        {getTreatmentTypeLabel(treatment.treatment_type)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("确定要删除这个治疗项目吗？")) {
                            onDeleteTreatment(treatment._id);
                          }
                        }}
                        className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Unified Add Treatment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加治疗方案"
        onSave={handleSave}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Section Tabs */}
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveModalSection("medicine")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeModalSection === "medicine"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>药物治疗</span>
              </div>
            </button>
            <button
              onClick={() => setActiveModalSection("lifestyle")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeModalSection === "lifestyle"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>生活方式</span>
              </div>
            </button>
            <button
              onClick={() => setActiveModalSection("other")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeModalSection === "other"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>其他治疗</span>
              </div>
            </button>
          </div>

          {/* Medicine Form */}
          {activeModalSection === "medicine" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    药物名称 *
                  </label>
                  <Input
                    placeholder="请输入药物名称"
                    value={medicineForm.medicine_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMedicineForm({
                        ...medicineForm,
                        medicine_name: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    剂量 *
                  </label>
                  <Input
                    placeholder="如：100mg"
                    value={medicineForm.dosage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMedicineForm({
                        ...medicineForm,
                        dosage: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    用药频次 *
                  </label>
                  <Input
                    placeholder="如：每日3次"
                    value={medicineForm.frequency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMedicineForm({
                        ...medicineForm,
                        frequency: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    给药途径
                  </label>
                  <Select
                    value={medicineForm.route}
                    onValueChange={(
                      value: "oral" | "injection" | "topical" | "inhalation",
                    ) => setMedicineForm({ ...medicineForm, route: value })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">口服</SelectItem>
                      <SelectItem value="injection">注射</SelectItem>
                      <SelectItem value="topical">外用</SelectItem>
                      <SelectItem value="inhalation">吸入</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    开始日期 *
                  </label>
                  <Input
                    type="date"
                    value={medicineForm.start_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMedicineForm({
                        ...medicineForm,
                        start_date: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    结束日期
                  </label>
                  <Input
                    type="date"
                    value={medicineForm.end_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMedicineForm({
                        ...medicineForm,
                        end_date: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <Textarea
                  placeholder="请输入用药注意事项或其他备注"
                  value={medicineForm.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMedicineForm({ ...medicineForm, notes: e.target.value })
                  }
                  rows={3}
                  className="border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Lifestyle Form */}
          {activeModalSection === "lifestyle" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    干预名称 *
                  </label>
                  <Input
                    placeholder="如：饮食控制、运动计划"
                    value={lifestyleForm.treatment_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLifestyleForm({
                        ...lifestyleForm,
                        treatment_name: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    开始日期 *
                  </label>
                  <Input
                    type="date"
                    value={lifestyleForm.treatment_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLifestyleForm({
                        ...lifestyleForm,
                        treatment_date: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  详细描述 *
                </label>
                <Textarea
                  placeholder="请详细描述生活方式干预的具体内容和要求"
                  value={lifestyleForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setLifestyleForm({
                      ...lifestyleForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  目标设定
                </label>
                <div className="space-y-2">
                  {lifestyleForm.goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="如：每周运动3次，每次30分钟"
                        value={goal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateGoalField(index, e.target.value)
                        }
                        className="border-gray-300"
                      />
                      {lifestyleForm.goals.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeGoalField(index)}
                          className="border-gray-300 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addGoalField}
                    className="border-gray-300 text-gray-600"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    添加目标
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <Textarea
                  placeholder="请输入其他相关备注信息"
                  value={lifestyleForm.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setLifestyleForm({
                      ...lifestyleForm,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Other Treatment Form */}
          {activeModalSection === "other" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    治疗名称 *
                  </label>
                  <Input
                    placeholder="请输入治疗名称"
                    value={otherTreatmentForm.treatment_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtherTreatmentForm({
                        ...otherTreatmentForm,
                        treatment_name: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    治疗类型
                  </label>
                  <Select
                    value={otherTreatmentForm.treatment_type}
                    onValueChange={(value: "therapy" | "surgery") =>
                      setOtherTreatmentForm({
                        ...otherTreatmentForm,
                        treatment_type: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapy">物理治疗</SelectItem>
                      <SelectItem value="surgery">手术治疗</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    治疗日期 *
                  </label>
                  <Input
                    type="date"
                    value={otherTreatmentForm.treatment_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtherTreatmentForm({
                        ...otherTreatmentForm,
                        treatment_date: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    医疗提供者 *
                  </label>
                  <Input
                    placeholder="医生姓名或科室"
                    value={otherTreatmentForm.provider}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtherTreatmentForm({
                        ...otherTreatmentForm,
                        provider: e.target.value,
                      })
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  治疗结果
                </label>
                <Textarea
                  placeholder="请描述治疗效果或结果"
                  value={otherTreatmentForm.outcome}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setOtherTreatmentForm({
                      ...otherTreatmentForm,
                      outcome: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <Textarea
                  placeholder="请输入其他相关备注信息"
                  value={otherTreatmentForm.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setOtherTreatmentForm({
                      ...otherTreatmentForm,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Modal } from "~/components/ui/modal";
import {
  Building2,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  User,
  Bed,
} from "lucide-react";
// Note: Since Hospitalization uses a custom interface that's not in the main types,
// and there's no specific hospitalizations API, this component manages local state
// In a real implementation, you might want to use the treatments API with a specific type
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

interface HospitalizationBlockProps {
  case_id: string;
  onAdd: (hospitalization: Omit<Hospitalization, "_id">) => void;
  onUpdate: (id: string, hospitalization: Partial<Hospitalization>) => void;
  onDelete: (id: string) => void;
}

interface HospitalizationFormData {
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

const statusLabels = {
  active: "进行中",
  discharged: "已出院",
  planned: "计划中",
};

const statusColors = {
  active: "bg-blue-50 text-blue-700 border-blue-200",
  discharged: "bg-gray-50 text-gray-700 border-gray-200",
  planned: "bg-orange-50 text-orange-700 border-orange-200",
};

export function HospitalizationBlock({
  case_id,
  onAdd,
  onUpdate,
  onDelete,
}: HospitalizationBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localHospitalizations, setLocalHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState<HospitalizationFormData>({
    admission_date: "",
    discharge_date: "",
    department: "",
    bed_number: "",
    attending_doctor: "",
    admission_diagnosis: "",
    treatment_plan: [""],
    status: "active",
    notes: "",
  });
  const [addForm, setAddForm] = useState<HospitalizationFormData>({
    admission_date: new Date().toISOString().split("T")[0] ?? "",
    discharge_date: "",
    department: "",
    bed_number: "",
    attending_doctor: "",
    admission_diagnosis: "",
    treatment_plan: [""],
    status: "active",
    notes: "",
  });


    // Load tests for this case
    useEffect(() => {
      const loadTests = async () => {
        if (!case_id) return;
        
        setLoading(true);
        try {
          const response = await hospitalizationApi.getByCase(case_id);
          setLocalHospitalizations(response.data.data);
        } catch (error) {
          console.error('Failed to load hospitalizations:', error);
        } finally {
          setLoading(false);
        }
      };
  
      loadTests();
    }, [case_id]);

  const handleEdit = (hospitalization: Hospitalization) => {
    setEditingId(hospitalization._id);
    setEditForm({
      admission_date:
        new Date(hospitalization.admission_date).toISOString().split("T")[0] ??
        "",
      discharge_date: hospitalization.discharge_date
        ? (new Date(hospitalization.discharge_date)
            .toISOString()
            .split("T")[0] ?? "")
        : "",
      department: hospitalization.department,
      bed_number: hospitalization.bed_number,
      attending_doctor: hospitalization.attending_doctor,
      admission_diagnosis: hospitalization.admission_diagnosis,
      treatment_plan:
        hospitalization.treatment_plan.length > 0
          ? hospitalization.treatment_plan
          : [""],
      status: hospitalization.status,
      notes: hospitalization.notes ?? "",
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const filteredTreatmentPlan = editForm.treatment_plan.filter(
        (plan) => plan.trim() !== "",
      );
      const updatedHospitalization = {
        ...editForm,
        admission_date: new Date(editForm.admission_date).toISOString(),
        discharge_date: editForm.discharge_date
          ? new Date(editForm.discharge_date).toISOString()
          : undefined,
        treatment_plan: filteredTreatmentPlan,
      };
      onUpdate(editingId, updatedHospitalization);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      admission_date: "",
      discharge_date: "",
      department: "",
      bed_number: "",
      attending_doctor: "",
      admission_diagnosis: "",
      treatment_plan: [""],
      status: "active",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (
      addForm.admission_date &&
      addForm.department &&
      addForm.attending_doctor
    ) {
      const filteredTreatmentPlan = addForm.treatment_plan.filter(
        (plan) => plan.trim() !== "",
      );
      const newHospitalization = {
        ...addForm,
        admission_date: new Date(addForm.admission_date).toISOString(),
        discharge_date: addForm.discharge_date
          ? new Date(addForm.discharge_date).toISOString()
          : undefined,
        treatment_plan: filteredTreatmentPlan,
      };
      onAdd(newHospitalization);
      setAddForm({
        admission_date: new Date().toISOString().split("T")[0] ?? "",
        discharge_date: "",
        department: "",
        bed_number: "",
        attending_doctor: "",
        admission_diagnosis: "",
        treatment_plan: [""],
        status: "active",
        notes: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个住院记录吗？")) {
      onDelete(id);
    }
  };

  const addTreatmentPlanField = (isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        treatment_plan: [...prev.treatment_plan, ""],
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        treatment_plan: [...prev.treatment_plan, ""],
      }));
    }
  };

  const removeTreatmentPlanField = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        treatment_plan: prev.treatment_plan.filter((_, i) => i !== index),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        treatment_plan: prev.treatment_plan.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTreatmentPlanField = (
    index: number,
    value: string,
    isEdit: boolean,
  ) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        treatment_plan: prev.treatment_plan.map((plan, i) =>
          i === index ? value : plan,
        ),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        treatment_plan: prev.treatment_plan.map((plan, i) =>
          i === index ? value : plan,
        ),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">住院管理</h4>
          <Badge variant="outline" className="text-gray-600">
            {localHospitalizations.length} 项
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加住院记录
        </Button>
      </div>

      {/* Hospitalization List */}
      <div className="space-y-4">
        {localHospitalizations.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">暂无住院记录</p>
            <p className="text-sm text-gray-400">点击上方按钮添加住院记录</p>
          </div>
        ) : (
          localHospitalizations.map((hospitalization) => (
            <Card
              key={hospitalization._id}
              className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-3 text-base">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      <span className="font-medium text-gray-900">
                        {hospitalization.department}住院
                      </span>
                    </CardTitle>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(
                            hospitalization.admission_date,
                          ).toLocaleDateString("zh-CN")}
                          {hospitalization.discharge_date && (
                            <>
                              {" - "}
                              {new Date(
                                hospitalization.discharge_date,
                              ).toLocaleDateString("zh-CN")}
                            </>
                          )}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[hospitalization.status]}
                      >
                        {statusLabels[hospitalization.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(hospitalization)}
                      className="border-gray-200 text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(hospitalization._id)}
                      className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {editingId === hospitalization._id ? (
                  // Edit mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          入院日期 *
                        </label>
                        <Input
                          type="date"
                          value={editForm.admission_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              admission_date: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          出院日期
                        </label>
                        <Input
                          type="date"
                          value={editForm.discharge_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              discharge_date: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          科室 *
                        </label>
                        <Input
                          placeholder="科室"
                          value={editForm.department}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              department: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          床位号
                        </label>
                        <Input
                          placeholder="床位号"
                          value={editForm.bed_number}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              bed_number: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        主治医师 *
                      </label>
                      <Input
                        placeholder="主治医师"
                        value={editForm.attending_doctor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            attending_doctor: e.target.value,
                          })
                        }
                        className="border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        入院诊断
                      </label>
                      <Textarea
                        placeholder="入院诊断"
                        value={editForm.admission_diagnosis}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditForm({
                            ...editForm,
                            admission_diagnosis: e.target.value,
                          })
                        }
                        rows={2}
                        className="border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        治疗计划
                      </label>
                      <div className="space-y-2">
                        {editForm.treatment_plan.map((plan, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="治疗计划"
                              value={plan}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updateTreatmentPlanField(
                                  index,
                                  e.target.value,
                                  true,
                                )
                              }
                              className="border-gray-300"
                            />
                            {editForm.treatment_plan.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeTreatmentPlanField(index, true)
                                }
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
                          onClick={() => addTreatmentPlanField(true)}
                          className="border-gray-300 text-gray-600"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          添加治疗计划
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="border-gray-300 text-gray-600"
                      >
                        <X className="mr-1 h-3 w-3" />
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Save className="mr-1 h-3 w-3" />
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="mb-1 text-sm font-medium text-gray-900">
                              科室
                            </h5>
                            <p className="text-sm text-gray-600">
                              {hospitalization.department}
                            </p>
                          </div>
                          <div>
                            <h5 className="mb-1 flex items-center text-sm font-medium text-gray-900">
                              <Bed className="mr-1 h-3 w-3" />
                              床位号
                            </h5>
                            <p className="text-sm text-gray-600">
                              {hospitalization.bed_number}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-1 flex items-center text-sm font-medium text-gray-900">
                            <User className="mr-1 h-3 w-3" />
                            主治医师
                          </h5>
                          <p className="text-sm text-gray-600">
                            {hospitalization.attending_doctor}
                          </p>
                        </div>

                        {hospitalization.admission_diagnosis && (
                          <div>
                            <h5 className="mb-2 text-sm font-medium text-gray-900">
                              入院诊断
                            </h5>
                            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                              {hospitalization.admission_diagnosis}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        {hospitalization.treatment_plan.length > 0 && (
                          <div>
                            <h5 className="mb-3 text-sm font-medium text-gray-900">
                              治疗计划
                            </h5>
                            <div className="space-y-2">
                              {hospitalization.treatment_plan.map(
                                (plan, index) => (
                                  <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                  >
                                    <p className="text-sm leading-relaxed text-gray-800">
                                      {plan}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {hospitalization.status === "active" && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-600"
                            >
                              <Calendar className="mr-1 h-3 w-3" />
                              安排出院
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Hospitalization Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加住院记录"
        onSave={handleAdd}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                入院日期 *
              </label>
              <Input
                type="date"
                value={addForm.admission_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, admission_date: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                预计出院日期
              </label>
              <Input
                type="date"
                value={addForm.discharge_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, discharge_date: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                科室 *
              </label>
              <Input
                placeholder="如：心血管内科"
                value={addForm.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, department: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                床位号
              </label>
              <Input
                placeholder="如：15A-203"
                value={addForm.bed_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, bed_number: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              主治医师 *
            </label>
            <Input
              placeholder="请输入主治医师姓名"
              value={addForm.attending_doctor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAddForm({ ...addForm, attending_doctor: e.target.value })
              }
              className="border-gray-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              入院诊断
            </label>
            <Textarea
              placeholder="请输入入院诊断"
              value={addForm.admission_diagnosis}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, admission_diagnosis: e.target.value })
              }
              rows={3}
              className="border-gray-300"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              治疗计划
            </label>
            <div className="space-y-2">
              {addForm.treatment_plan.map((plan, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="请输入治疗计划"
                    value={plan}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateTreatmentPlanField(index, e.target.value, false)
                    }
                    className="border-gray-300"
                  />
                  {addForm.treatment_plan.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTreatmentPlanField(index, false)}
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
                onClick={() => addTreatmentPlanField(false)}
                className="border-gray-300 text-gray-600"
              >
                <Plus className="mr-1 h-3 w-3" />
                添加治疗计划
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

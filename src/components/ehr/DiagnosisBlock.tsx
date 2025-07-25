"use client";

import { useState } from "react";
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
  Stethoscope,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
} from "lucide-react";
import type { Diagnosis } from "~/types";

interface DiagnosisBlockProps {
  diagnoses: Diagnosis[];
  onAdd: (diagnosis: Omit<Diagnosis, "_id">) => void;
  onUpdate: (id: string, diagnosis: Partial<Diagnosis>) => void;
  onDelete: (id: string) => void;
}

interface DiagnosisFormData {
  diagnosis_name: string;
  diagnosis_date: string;
  status: "active" | "resolved" | "recurrent";
  follow_up: string;
  notes?: string;
  additional_info?: string;
}

const statusLabels = {
  active: "活动期",
  resolved: "已解决",
  recurrent: "复发",
};

const statusColors = {
  active: "bg-green-50 text-green-700 border-green-200",
  resolved: "bg-gray-50 text-gray-700 border-gray-200",
  recurrent: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export function DiagnosisBlock({
  diagnoses,
  onAdd,
  onUpdate,
  onDelete,
}: DiagnosisBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DiagnosisFormData>({
    diagnosis_name: "",
    diagnosis_date: "",
    status: "active",
    follow_up: "",
    notes: "",
    additional_info: "",
  });
  const [addForm, setAddForm] = useState<DiagnosisFormData>({
    diagnosis_name: "",
    diagnosis_date: new Date().toISOString().split("T")[0] ?? "",
    status: "active",
    follow_up: "",
    notes: "",
    additional_info: "",
  });

  // Only allow one diagnosis
  const currentDiagnosis = diagnoses[0] ?? null;

  const handleEdit = (diagnosis: Diagnosis) => {
    setEditingId(diagnosis._id);
    setEditForm({
      diagnosis_name: diagnosis.diagnosis_name,
      diagnosis_date:
        new Date(diagnosis.diagnosis_date).toISOString().split("T")[0] ?? "",
      status: diagnosis.status,
      follow_up: diagnosis.follow_up,
      notes: diagnosis.notes ?? "",
      additional_info: diagnosis.additional_info ?? "",
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const updatedDiagnosis = {
        ...editForm,
        diagnosis_date: new Date(editForm.diagnosis_date),
      };
      onUpdate(editingId, updatedDiagnosis);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      diagnosis_name: "",
      diagnosis_date: "",
      status: "active",
      follow_up: "",
      notes: "",
      additional_info: "",
    });
  };

  const handleAdd = () => {
    if (addForm.diagnosis_name && addForm.diagnosis_date && addForm.follow_up) {
      const newDiagnosis = {
        diagnosis_name: addForm.diagnosis_name,
        diagnosis_date: new Date(addForm.diagnosis_date),
        status: addForm.status,
        follow_up: addForm.follow_up,
        notes: addForm.notes,
        additional_info: addForm.additional_info,
        case_id: "", // These will be set by the parent component
        patient_id: "",
        created_at: new Date(),
        updated_at: new Date(),
      };
      onAdd(newDiagnosis);
      setAddForm({
        diagnosis_name: "",
        diagnosis_date: new Date().toISOString().split("T")[0] ?? "",
        status: "active",
        follow_up: "",
        notes: "",
        additional_info: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个诊断吗？")) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-5 w-5 text-red-600" />
          <h4 className="text-lg font-semibold text-gray-900">诊断管理</h4>
          <Badge variant="outline" className="text-gray-600">
            {currentDiagnosis ? "1 项" : "0 项"}
          </Badge>
        </div>
        {!currentDiagnosis && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加诊断
          </Button>
        )}
      </div>

      {/* Diagnosis Content */}
      <div>
        {!currentDiagnosis ? (
          // Empty state
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <Stethoscope className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">暂无诊断记录</p>
            <p className="mb-4 text-sm text-gray-400">
              请从上方问诊内容添加诊断
            </p>
          </div>
        ) : (
          // Diagnosis card
          <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-3 text-base">
                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                    <span className="font-medium text-gray-900">
                      {currentDiagnosis.diagnosis_name}
                    </span>
                  </CardTitle>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(
                          currentDiagnosis.diagnosis_date,
                        ).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusColors[currentDiagnosis.status]}
                    >
                      {statusLabels[currentDiagnosis.status]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(currentDiagnosis)}
                    className="border-gray-200 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(currentDiagnosis._id)}
                    className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {editingId === currentDiagnosis._id ? (
                // Edit mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        诊断名称 *
                      </label>
                      <Input
                        placeholder="诊断名称"
                        value={editForm.diagnosis_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            diagnosis_name: e.target.value,
                          })
                        }
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        诊断日期 *
                      </label>
                      <Input
                        type="date"
                        value={editForm.diagnosis_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            diagnosis_date: e.target.value,
                          })
                        }
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        诊断状态
                      </label>
                      <Select
                        value={editForm.status}
                        onValueChange={(
                          value: "active" | "resolved" | "recurrent",
                        ) => setEditForm({ ...editForm, status: value })}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">活动期</SelectItem>
                          <SelectItem value="resolved">已解决</SelectItem>
                          <SelectItem value="recurrent">复发</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        随访安排 *
                      </label>
                      <Input
                        placeholder="随访安排"
                        value={editForm.follow_up}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            follow_up: e.target.value,
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
                      value={editForm.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      rows={2}
                      className="border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      补充信息
                    </label>
                    <Textarea
                      placeholder="补充信息"
                      value={editForm.additional_info}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditForm({
                          ...editForm,
                          additional_info: e.target.value,
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
                      onClick={handleCancelEdit}
                      className="border-gray-300 text-gray-600"
                    >
                      <X className="mr-1 h-3 w-3" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-red-600 text-white hover:bg-red-700"
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
                    <div>
                      <h5 className="mb-2 text-sm font-medium text-gray-900">
                        随访安排
                      </h5>
                      <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                        {currentDiagnosis.follow_up}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {currentDiagnosis.notes && (
                        <div>
                          <h5 className="mb-2 text-sm font-medium text-gray-900">
                            备注
                          </h5>
                          <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                            {currentDiagnosis.notes}
                          </p>
                        </div>
                      )}
                      {currentDiagnosis.additional_info && (
                        <div>
                          <h5 className="mb-2 text-sm font-medium text-gray-900">
                            补充信息
                          </h5>
                          <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                            {currentDiagnosis.additional_info}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Diagnosis Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加诊断"
        onSave={handleAdd}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                诊断名称 *
              </label>
              <Input
                placeholder="请输入诊断名称"
                value={addForm.diagnosis_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, diagnosis_name: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                诊断日期 *
              </label>
              <Input
                type="date"
                value={addForm.diagnosis_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, diagnosis_date: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                诊断状态
              </label>
              <Select
                value={addForm.status}
                onValueChange={(value: "active" | "resolved" | "recurrent") =>
                  setAddForm({ ...addForm, status: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活动期</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                  <SelectItem value="recurrent">复发</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                随访安排 *
              </label>
              <Input
                placeholder="如：3个月后复查，定期监测血压"
                value={addForm.follow_up}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, follow_up: e.target.value })
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
              placeholder="请输入诊断相关备注"
              value={addForm.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, notes: e.target.value })
              }
              rows={3}
              className="border-gray-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              补充信息
            </label>
            <Textarea
              placeholder="请输入补充信息，如：相关检查结果、症状描述等"
              value={addForm.additional_info}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, additional_info: e.target.value })
              }
              rows={3}
              className="border-gray-300"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

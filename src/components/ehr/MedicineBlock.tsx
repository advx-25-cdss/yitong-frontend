"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
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
import { Pill, Edit, Trash2, Plus, Save, X, RefreshCcw } from "lucide-react";
import type { Medicine } from "~/types";
import { medicinesApi } from "~/lib/api";

interface MedicineBlockProps {
  case_id: string;
  onAdd: (medicine: Omit<Medicine, "_id">) => void;
  onUpdate: (id: string, medicine: Partial<Medicine>) => void;
  onDelete: (id: string) => void;
}

interface MedicineFormData {
  medicine_name: string;
  dosage: string;
  frequency: string;
  route: "oral" | "injection" | "topical" | "inhalation";
  notes?: string;
}

const routeLabels = {
  oral: "口服",
  injection: "注射",
  topical: "外用",
  inhalation: "吸入",
};

const routeColors = {
  oral: "bg-blue-50 text-blue-700",
  injection: "bg-red-50 text-red-700",
  topical: "bg-green-50 text-green-700",
  inhalation: "bg-purple-50 text-purple-700",
};

export function MedicineBlock({
  case_id,
  onAdd,
  onUpdate,
  onDelete,
}: MedicineBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>([]);
  const [editForm, setEditForm] = useState<MedicineFormData>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    route: "oral",
    notes: "",
  });
  const [addForm, setAddForm] = useState<MedicineFormData>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    route: "oral",
    notes: "",
  });

  // Load medicines for this case
  useEffect(() => {
    const loadMedicines = async () => {
      if (!case_id) return;

      setLoading(true);
      try {
        const response = await medicinesApi.getByCase(case_id);
        setLocalMedicines(response.data.data);
      } catch (error) {
        console.error("Failed to load medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, [case_id]);

  async function reloadData() {
    setLoading(true);
    try {
      const response = await medicinesApi.getByCase(case_id);
      setLocalMedicines(response.data.data);
    } catch (error) {
      console.error("Failed to reload medicines:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingId(medicine._id);
    setEditForm({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      route: medicine.route,
      notes: medicine.notes ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        const response = await medicinesApi.update(editingId, editForm);
        const updatedMedicine = response.data;
        setLocalMedicines((prev) =>
          prev.map((med) => (med._id === editingId ? updatedMedicine : med)),
        );
        onUpdate(editingId, editForm);
        setEditingId(null);
      } catch (error) {
        console.error("Failed to update medicine:", error);
        alert("更新药物失败，请重试");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      medicine_name: "",
      dosage: "",
      frequency: "",
      route: "oral",
      notes: "",
    });
  };

  const handleAdd = async () => {
    if (addForm.medicine_name && addForm.dosage && addForm.frequency) {
      const newMedicine: Omit<Medicine, "_id"> = {
        ...addForm,
        case_id: case_id,
        patient_id: "default_patient_id", // Replace with actual logic to get patient_id
        start_date: new Date(), // Default to current date
        created_at: new Date(), // Default to current timestamp
        updated_at: new Date(), // Default to current timestamp
      };

      try {
        const response = await medicinesApi.create(newMedicine);
        const createdMedicine = response.data;
        setLocalMedicines((prev) => [...prev, createdMedicine]);
        onAdd(newMedicine);
        setAddForm({
          medicine_name: "",
          dosage: "",
          frequency: "",
          route: "oral",
          notes: "",
        });
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Failed to create medicine:", error);
        alert("创建药物失败，请重试");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个药物吗？")) {
      try {
        await medicinesApi.delete(id);
        setLocalMedicines((prev) => prev.filter((med) => med._id !== id));
        onDelete(id);
      } catch (error) {
        console.error("Failed to delete medicine:", error);
        alert("删除药物失败，请重试");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center space-x-2 font-medium text-blue-800">
          <Pill className="h-4 w-4" />
          <span>药物治疗</span>
        </h5>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="mr-1 h-3 w-3" />
          添加药物
        </Button>
        <Button size="sm" variant="outline" onClick={reloadData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          重置药物
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-500">加载药物数据...</span>
          </div>
        ) : localMedicines.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
            <Pill className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">暂无药物记录</p>
            <p className="text-sm text-gray-400">点击上方按钮添加药物</p>
          </div>
        ) : (
          localMedicines.map((medicine) => (
            <Card key={medicine._id} className="bg-blue-25/30 border-blue-100">
              <CardContent className="p-3">
                {editingId === medicine._id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        placeholder="药物名称"
                        value={editForm.medicine_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            medicine_name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="剂量"
                        value={editForm.dosage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({ ...editForm, dosage: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        placeholder="用药频次"
                        value={editForm.frequency}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            frequency: e.target.value,
                          })
                        }
                      />
                      <Select
                        value={editForm.route}
                        onValueChange={(
                          value:
                            | "oral"
                            | "injection"
                            | "topical"
                            | "inhalation",
                        ) => setEditForm({ ...editForm, route: value })}
                      >
                        <SelectTrigger>
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
                    <Textarea
                      placeholder="备注"
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-1 h-3 w-3" />
                        取消
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="mr-1 h-3 w-3" />
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h6 className="font-medium text-blue-800">
                        {medicine.medicine_name}
                      </h6>
                      <div className="space-y-1 text-sm text-blue-600">
                        <p>
                          剂量: {medicine.dosage} • 频次: {medicine.frequency}
                        </p>
                        <p>给药途径: {routeLabels[medicine.route]}</p>
                        {medicine.notes && <p>备注: {medicine.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-2">
                      <Badge
                        className={`whitespace-nowrap ${routeColors[medicine.route]}`}
                      >
                        {routeLabels[medicine.route]}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(medicine)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(medicine._id)}
                        className="text-red-500 hover:text-red-600"
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

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加药物"
        onSave={handleAdd}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                药物名称 *
              </label>
              <Input
                placeholder="请输入药物名称"
                value={addForm.medicine_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, medicine_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                剂量 *
              </label>
              <Input
                placeholder="如：100mg"
                value={addForm.dosage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, dosage: e.target.value })
                }
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
                value={addForm.frequency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, frequency: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                给药途径
              </label>
              <Select
                value={addForm.route}
                onValueChange={(
                  value: "oral" | "injection" | "topical" | "inhalation",
                ) => setAddForm({ ...addForm, route: value })}
              >
                <SelectTrigger>
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              备注
            </label>
            <Textarea
              placeholder="请输入用药注意事项或其他备注"
              value={addForm.notes}
              onChange={(e) =>
                setAddForm({ ...addForm, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

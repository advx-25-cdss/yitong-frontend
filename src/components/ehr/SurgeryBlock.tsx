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
  Scissors,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  FileText,
  Activity,
  Calendar,
  Clock,
  User,
  MapPin,
} from "lucide-react";

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
  duration?: number; // in minutes
}

interface SurgeryBlockProps {
  case_id: string;
  surgeries: Surgery[];
  onAdd: (surgery: Omit<Surgery, "_id">) => void;
  onUpdate: (id: string, surgery: Partial<Surgery>) => void;
  onDelete: (id: string) => void;
}

interface SurgeryFormData {
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

const statusLabels = {
  scheduled: "已安排",
  in_progress: "进行中",
  completed: "已完成",
  cancelled: "已取消",
};

const statusColors = {
  scheduled: "bg-orange-50 text-orange-700 border-orange-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

const anesthesiaLabels = {
  general: "全身麻醉",
  regional: "区域麻醉",
  local: "局部麻醉",
  sedation: "镇静",
};

const riskLabels = {
  low: "低风险",
  medium: "中等风险",
  high: "高风险",
};

const riskColors = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export function SurgeryBlock({
  case_id,
  surgeries,
  onAdd,
  onUpdate,
  onDelete,
}: SurgeryBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localSurgeries, setLocalSurgeries] = useState<Surgery[]>(surgeries);
  const [editForm, setEditForm] = useState<SurgeryFormData>({
    surgery_name: "",
    surgery_date: "",
    surgery_room: "",
    surgeon: "",
    anesthesia_type: "general",
    indication: "",
    preparation: [""],
    risk_assessment: "medium",
    status: "scheduled",
    notes: "",
    duration: undefined,
  });
  const [addForm, setAddForm] = useState<SurgeryFormData>({
    surgery_name: "",
    surgery_date: new Date().toISOString().split("T")[0] ?? "",
    surgery_room: "",
    surgeon: "",
    anesthesia_type: "general",
    indication: "",
    preparation: [""],
    risk_assessment: "medium",
    status: "scheduled",
    notes: "",
    duration: undefined,
  });

  // Update local state when props change
  useEffect(() => {
    setLocalSurgeries(surgeries);
  }, [surgeries]);

  const handleEdit = (surgery: Surgery) => {
    setEditingId(surgery._id);
    setEditForm({
      surgery_name: surgery.surgery_name,
      surgery_date:
        new Date(surgery.surgery_date).toISOString().split("T")[0] ?? "",
      surgery_room: surgery.surgery_room,
      surgeon: surgery.surgeon,
      anesthesia_type: surgery.anesthesia_type,
      indication: surgery.indication,
      preparation: surgery.preparation.length > 0 ? surgery.preparation : [""],
      risk_assessment: surgery.risk_assessment,
      status: surgery.status,
      notes: surgery.notes ?? "",
      duration: surgery.duration,
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const filteredPreparation = editForm.preparation.filter(
        (prep) => prep.trim() !== "",
      );
      const updatedSurgery = {
        ...editForm,
        surgery_date: new Date(editForm.surgery_date).toISOString(),
        preparation: filteredPreparation,
      };
      onUpdate(editingId, updatedSurgery);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      surgery_name: "",
      surgery_date: "",
      surgery_room: "",
      surgeon: "",
      anesthesia_type: "general",
      indication: "",
      preparation: [""],
      risk_assessment: "medium",
      status: "scheduled",
      notes: "",
      duration: undefined,
    });
  };

  const handleAdd = () => {
    if (addForm.surgery_name && addForm.surgery_date && addForm.surgeon) {
      const filteredPreparation = addForm.preparation.filter(
        (prep) => prep.trim() !== "",
      );
      const newSurgery = {
        ...addForm,
        surgery_date: new Date(addForm.surgery_date).toISOString(),
        preparation: filteredPreparation,
      };
      onAdd(newSurgery);
      setAddForm({
        surgery_name: "",
        surgery_date: new Date().toISOString().split("T")[0] ?? "",
        surgery_room: "",
        surgeon: "",
        anesthesia_type: "general",
        indication: "",
        preparation: [""],
        risk_assessment: "medium",
        status: "scheduled",
        notes: "",
        duration: undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个手术记录吗？")) {
      onDelete(id);
    }
  };

  const addPreparationField = (isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        preparation: [...prev.preparation, ""],
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        preparation: [...prev.preparation, ""],
      }));
    }
  };

  const removePreparationField = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        preparation: prev.preparation.filter((_, i) => i !== index),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        preparation: prev.preparation.filter((_, i) => i !== index),
      }));
    }
  };

  const updatePreparationField = (
    index: number,
    value: string,
    isEdit: boolean,
  ) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        preparation: prev.preparation.map((prep, i) =>
          i === index ? value : prep,
        ),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        preparation: prev.preparation.map((prep, i) =>
          i === index ? value : prep,
        ),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <Scissors className="h-5 w-5 text-orange-600" />
          <h4 className="text-lg font-semibold text-gray-900">手术管理</h4>
          <Badge variant="outline" className="text-gray-600">
            {localSurgeries.length} 项
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          安排手术
        </Button>
      </div>

      {/* Surgery List */}
      <div className="space-y-4">
        {localSurgeries.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <Scissors className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">暂无手术记录</p>
            <p className="text-sm text-gray-400">点击上方按钮安排手术</p>
          </div>
        ) : (
          localSurgeries.map((surgery) => (
            <Card
              key={surgery._id}
              className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-3 text-base">
                      <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                      <span className="font-medium text-gray-900">
                        {surgery.surgery_name}
                      </span>
                    </CardTitle>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(surgery.surgery_date).toLocaleString(
                            "zh-CN",
                          )}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[surgery.status]}
                      >
                        {statusLabels[surgery.status]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={riskColors[surgery.risk_assessment]}
                      >
                        {riskLabels[surgery.risk_assessment]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(surgery)}
                      className="border-gray-200 text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(surgery._id)}
                      className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {editingId === surgery._id ? (
                  // Edit mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          手术名称 *
                        </label>
                        <Input
                          placeholder="手术名称"
                          value={editForm.surgery_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              surgery_name: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          手术日期 *
                        </label>
                        <Input
                          type="datetime-local"
                          value={editForm.surgery_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              surgery_date: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          手术室
                        </label>
                        <Input
                          placeholder="手术室"
                          value={editForm.surgery_room}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              surgery_room: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          主刀医生 *
                        </label>
                        <Input
                          placeholder="主刀医生"
                          value={editForm.surgeon}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              surgeon: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          麻醉方式
                        </label>
                        <Select
                          value={editForm.anesthesia_type}
                          onValueChange={(
                            value:
                              | "general"
                              | "regional"
                              | "local"
                              | "sedation",
                          ) =>
                            setEditForm({ ...editForm, anesthesia_type: value })
                          }
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">全身麻醉</SelectItem>
                            <SelectItem value="regional">区域麻醉</SelectItem>
                            <SelectItem value="local">局部麻醉</SelectItem>
                            <SelectItem value="sedation">镇静</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          风险评估
                        </label>
                        <Select
                          value={editForm.risk_assessment}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setEditForm({ ...editForm, risk_assessment: value })
                          }
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">低风险</SelectItem>
                            <SelectItem value="medium">中等风险</SelectItem>
                            <SelectItem value="high">高风险</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          预计时长 (分钟)
                        </label>
                        <Input
                          type="number"
                          placeholder="180"
                          value={editForm.duration ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              duration: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        手术适应症
                      </label>
                      <Textarea
                        placeholder="手术适应症"
                        value={editForm.indication}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditForm({
                            ...editForm,
                            indication: e.target.value,
                          })
                        }
                        rows={2}
                        className="border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        术前准备
                      </label>
                      <div className="space-y-2">
                        {editForm.preparation.map((prep, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="术前准备事项"
                              value={prep}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updatePreparationField(
                                  index,
                                  e.target.value,
                                  true,
                                )
                              }
                              className="border-gray-300"
                            />
                            {editForm.preparation.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removePreparationField(index, true)
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
                          onClick={() => addPreparationField(true)}
                          className="border-gray-300 text-gray-600"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          添加准备事项
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        备注
                      </label>
                      <Textarea
                        placeholder="手术相关备注"
                        value={editForm.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditForm({ ...editForm, notes: e.target.value })
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
                        className="bg-orange-600 text-white hover:bg-orange-700"
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
                            <h5 className="mb-1 flex items-center text-sm font-medium text-gray-900">
                              <MapPin className="mr-1 h-3 w-3" />
                              手术室
                            </h5>
                            <p className="text-sm text-gray-600">
                              {surgery.surgery_room}
                            </p>
                          </div>
                          <div>
                            <h5 className="mb-1 flex items-center text-sm font-medium text-gray-900">
                              <User className="mr-1 h-3 w-3" />
                              主刀医生
                            </h5>
                            <p className="text-sm text-gray-600">
                              {surgery.surgeon}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="mb-1 text-sm font-medium text-gray-900">
                              麻醉方式
                            </h5>
                            <p className="text-sm text-gray-600">
                              {anesthesiaLabels[surgery.anesthesia_type]}
                            </p>
                          </div>
                          {surgery.duration && (
                            <div>
                              <h5 className="mb-1 flex items-center text-sm font-medium text-gray-900">
                                <Clock className="mr-1 h-3 w-3" />
                                预计时长
                              </h5>
                              <p className="text-sm text-gray-600">
                                {surgery.duration} 分钟
                              </p>
                            </div>
                          )}
                        </div>

                        {surgery.indication && (
                          <div>
                            <h5 className="mb-2 text-sm font-medium text-gray-900">
                              手术适应症
                            </h5>
                            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                              {surgery.indication}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        {surgery.preparation.length > 0 && (
                          <div>
                            <h5 className="mb-3 text-sm font-medium text-gray-900">
                              术前准备
                            </h5>
                            <div className="space-y-2">
                              {surgery.preparation.map((prep, index) => (
                                <div
                                  key={index}
                                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                >
                                  <p className="flex items-start text-sm leading-relaxed text-gray-800">
                                    <span className="mt-0.5 mr-2 text-green-600">
                                      ✓
                                    </span>
                                    {prep}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {surgery.notes && (
                          <div className="mt-4">
                            <h5 className="mb-2 text-sm font-medium text-gray-900">
                              备注
                            </h5>
                            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                              {surgery.notes}
                            </p>
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

        {/* Post-operative care card */}
        {/* {surgeries.length > 0 && (
          <Card className="border border-gray-200 bg-gray-50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-base">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">术后护理计划</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">术后监护：ICU观察24-48小时</p>
                <div>
                  <p className="mb-2 font-medium">护理要点：</p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>生命体征监测</li>
                    <li>伤口护理和观察</li>
                    <li>疼痛管理</li>
                    <li>早期活动指导</li>
                    <li>呼吸功能锻炼</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>

      {/* Add Surgery Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="安排手术"
        onSave={handleAdd}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                手术名称 *
              </label>
              <Input
                placeholder="请输入手术名称"
                value={addForm.surgery_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, surgery_name: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                手术日期 *
              </label>
              <Input
                type="datetime-local"
                value={addForm.surgery_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, surgery_date: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                手术室
              </label>
              <Input
                placeholder="如：手术室3"
                value={addForm.surgery_room}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, surgery_room: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                主刀医生 *
              </label>
              <Input
                placeholder="请输入主刀医生姓名"
                value={addForm.surgeon}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, surgeon: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                麻醉方式
              </label>
              <Select
                value={addForm.anesthesia_type}
                onValueChange={(
                  value: "general" | "regional" | "local" | "sedation",
                ) => setAddForm({ ...addForm, anesthesia_type: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">全身麻醉</SelectItem>
                  <SelectItem value="regional">区域麻醉</SelectItem>
                  <SelectItem value="local">局部麻醉</SelectItem>
                  <SelectItem value="sedation">镇静</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                风险评估
              </label>
              <Select
                value={addForm.risk_assessment}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setAddForm({ ...addForm, risk_assessment: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低风险</SelectItem>
                  <SelectItem value="medium">中等风险</SelectItem>
                  <SelectItem value="high">高风险</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                预计时长 (分钟)
              </label>
              <Input
                type="number"
                placeholder="180"
                value={addForm.duration ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({
                    ...addForm,
                    duration: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              手术适应症
            </label>
            <Textarea
              placeholder="请输入手术的适应症和必要性"
              value={addForm.indication}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, indication: e.target.value })
              }
              rows={3}
              className="border-gray-300"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              术前准备
            </label>
            <div className="space-y-2">
              {addForm.preparation.map((prep, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="请输入术前准备事项"
                    value={prep}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updatePreparationField(index, e.target.value, false)
                    }
                    className="border-gray-300"
                  />
                  {addForm.preparation.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePreparationField(index, false)}
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
                onClick={() => addPreparationField(false)}
                className="border-gray-300 text-gray-600"
              >
                <Plus className="mr-1 h-3 w-3" />
                添加准备事项
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              备注
            </label>
            <Textarea
              placeholder="请输入手术相关备注"
              value={addForm.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, notes: e.target.value })
              }
              rows={2}
              className="border-gray-300"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

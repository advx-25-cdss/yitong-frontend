"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Modal } from "~/components/ui/modal";
import {
  TestTube,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Upload,
  Eye,
  Calendar,
  Loader2,
  FileImage,
} from "lucide-react";
import type { Test } from "~/types";
import { testsApi } from "~/lib/api";

interface TestBlockProps {
  case_id: string;
  onAdd: (test: Omit<Test, "_id">) => void;
  onUpdate: (id: string, test: Partial<Test>) => void;
  onDelete: (id: string) => void;
}

interface TestFormData {
  test_name: string;
  test_date: string;
  results: string[];
  notes?: string;
}

interface TestImage {
  id: string;
  url: string;
  name: string;
  size: number;
}

export function TestBlock({
  case_id,
  onAdd,
  onUpdate,
  onDelete,
}: TestBlockProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [testImages, setTestImages] = useState<Record<string, TestImage>>({});
  const [loadingResults, setLoadingResults] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [localTests, setLocalTests] = useState<Test[]>([]);

  const [editForm, setEditForm] = useState<TestFormData>({
    test_name: "",
    test_date: "",
    results: [""],
    notes: "",
  });

  const [addForm, setAddForm] = useState<TestFormData>({
    test_name: "",
    test_date: new Date().toISOString().split("T")[0] ?? "",
    results: [""],
    notes: "",
  });

  // Load tests for this case
  useEffect(() => {
    const loadTests = async () => {
      if (!case_id) return;

      setLoading(true);
      try {
        const response = await testsApi.getByCase(case_id);
        setLocalTests(response.data.data);
      } catch (error) {
        console.error("Failed to load tests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [case_id]);

  const handleEdit = (test: Test) => {
    setEditingId(test._id);
    setEditForm({
      test_name: test.test_name,
      test_date: new Date(test.test_date).toISOString().split("T")[0] ?? "",
      results: test.results ?? [""],
      notes: test.notes ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      const filteredResults = editForm.results.filter(
        (result) => result.trim() !== "",
      );
      const updateData = {
        ...editForm,
        results: filteredResults,
        test_date: new Date(editForm.test_date),
      };

      try {
        const response = await testsApi.update(editingId, updateData);
        const updatedTest = response.data;
        setLocalTests((prev) =>
          prev.map((test) => (test._id === editingId ? updatedTest : test)),
        );
        onUpdate(editingId, updateData);
        setEditingId(null);
      } catch (error) {
        console.error("Failed to update test:", error);
        alert("更新检查失败，请重试");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      test_name: "",
      test_date: "",
      results: [""],
      notes: "",
    });
  };

  const handleAdd = async () => {
    if (addForm.test_name && addForm.test_date) {
      const filteredResults = addForm.results.filter(
        (result) => result.trim() !== "",
      );
      const newTest = {
        test_name: addForm.test_name,
        test_date: new Date(addForm.test_date),
        results: filteredResults,
        notes: addForm.notes,
        case_id: case_id,
        patient_id: "", // This should be provided by the parent component
        created_at: new Date(),
        updated_at: new Date(),
      };

      try {
        const response = await testsApi.create(newTest);
        const createdTest = response.data;
        setLocalTests((prev) => [...prev, createdTest]);
        onAdd(newTest);
        setAddForm({
          test_name: "",
          test_date: new Date().toISOString().split("T")[0] ?? "",
          results: [""],
          notes: "",
        });
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Failed to create test:", error);
        alert("创建检查失败，请重试");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个检查项目吗？")) {
      try {
        await testsApi.delete(id);
        setLocalTests((prev) => prev.filter((test) => test._id !== id));
        onDelete(id);
        // Also remove associated image and loading state
        const newImages = { ...testImages };
        const newLoading = { ...loadingResults };
        delete newImages[id];
        delete newLoading[id];
        setTestImages(newImages);
        setLoadingResults(newLoading);
      } catch (error) {
        console.error("Failed to delete test:", error);
        alert("删除检查失败，请重试");
      }
    }
  };

  const handleImageUpload = async (testId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("图片大小不能超过10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      setTestImages((prev) => ({
        ...prev,
        [testId]: {
          id: Date.now().toString(),
          url,
          name: file.name,
          size: file.size,
        },
      }));

      // Start loading state for LLM processing
      setLoadingResults((prev) => ({ ...prev, [testId]: true }));

      // TODO: Send image to LLM for test result extraction
      // Simulate API call delay
      void setTimeout(() => {
        setLoadingResults((prev) => ({ ...prev, [testId]: false }));
        // Here you would update the test results with extracted data
        // For now, we'll just clear the loading state
      }, 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (testId: string) => {
    if (confirm("确定要删除这张图片吗？")) {
      const newImages = { ...testImages };
      const newLoading = { ...loadingResults };
      delete newImages[testId];
      delete newLoading[testId];
      setTestImages(newImages);
      setLoadingResults(newLoading);
    }
  };

  const addResultField = (isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        results: [...prev.results, ""],
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        results: [...prev.results, ""],
      }));
    }
  };

  const removeResultField = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        results: prev.results.filter((_, i) => i !== index),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        results: prev.results.filter((_, i) => i !== index),
      }));
    }
  };

  const updateResultField = (index: number, value: string, isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        results: prev.results.map((result, i) =>
          i === index ? value : result,
        ),
      }));
    } else {
      setAddForm((prev) => ({
        ...prev,
        results: prev.results.map((result, i) =>
          i === index ? value : result,
        ),
      }));
    }
  };

  const truncateFileName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(
      0,
      maxLength - 3 - (extension?.length ?? 0),
    );
    return `${truncated}...${extension ? `.${extension}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <TestTube className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-gray-900">检查项目</h4>
          <Badge variant="outline" className="text-gray-600">
            {localTests.length} 项
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加检查
        </Button>
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-500">加载检查数据...</span>
          </div>
        ) : localTests.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <TestTube className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">暂无检查记录</p>
            <p className="text-sm text-gray-400">点击上方按钮添加检查项目</p>
          </div>
        ) : (
          localTests.map((test) => (
            <Card
              key={test._id}
              className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-3 text-base">
                      <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                      <span className="font-medium text-gray-900">
                        {test.test_name}
                      </span>
                    </CardTitle>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(test.test_date).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                      {testImages[test._id] && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <FileImage className="h-3 w-3" />
                          <span>已上传图像</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(test)}
                      className="border-gray-200 text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(test._id)}
                      className="border-gray-200 text-red-500 hover:border-red-200 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {editingId === test._id ? (
                  // Edit mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          检查名称 *
                        </label>
                        <Input
                          placeholder="检查名称"
                          value={editForm.test_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              test_name: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          检查日期 *
                        </label>
                        <Input
                          type="date"
                          value={editForm.test_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm({
                              ...editForm,
                              test_date: e.target.value,
                            })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        检查结果
                      </label>
                      <div className="space-y-2">
                        {editForm.results.map((result, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="检查结果"
                              value={result}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updateResultField(index, e.target.value, true)
                              }
                              className="border-gray-300"
                            />
                            {editForm.results.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeResultField(index, true)}
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
                          onClick={() => addResultField(true)}
                          className="border-gray-300 text-gray-600"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          添加结果
                        </Button>
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
                        className="bg-purple-600 text-white hover:bg-purple-700"
                      >
                        <Save className="mr-1 h-3 w-3" />
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Test Results */}
                    <div className="space-y-4">
                      {test.results && test.results.length > 0 && (
                        <div>
                          <h5 className="mb-3 text-sm font-medium text-gray-900">
                            检查结果
                          </h5>
                          <div className="space-y-2">
                            {test.results.map((result, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                              >
                                <p className="text-sm leading-relaxed text-gray-800">
                                  {result}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {test.notes && (
                        <div>
                          <h5 className="mb-2 text-sm font-medium text-gray-900">
                            备注
                          </h5>
                          <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                            {test.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Image Upload/Display */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        检查图像
                      </h5>

                      {loadingResults[test._id] && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-blue-800">
                              正在分析图像，提取检查结果...
                            </span>
                          </div>
                        </div>
                      )}

                      {testImages[test._id] ? (
                        // Display uploaded image
                        <div className="space-y-3">
                          <div
                            className="relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-gray-300"
                            onClick={() =>
                              setPreviewImage(testImages[test._id]?.url ?? null)
                            }
                          >
                            <img
                              src={testImages[test._id]?.url}
                              alt="检查图像"
                              className="h-40 w-full object-cover transition-transform hover:scale-105"
                            />
                            <div className="bg-opacity-0 hover:bg-opacity-20 absolute inset-0 flex items-center justify-center bg-black transition-all">
                              <Eye className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {truncateFileName(
                                    testImages[test._id]?.name ?? "",
                                  )}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {(
                                    (testImages[test._id]?.size ?? 0) / 1024
                                  ).toFixed(1)}{" "}
                                  KB
                                </p>
                              </div>
                              <div className="ml-3 flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setPreviewImage(
                                      testImages[test._id]?.url ?? null,
                                    )
                                  }
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveImage(test._id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Upload area
                        <div className="rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
                          <input
                            type="file"
                            id={`file-upload-${test._id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void handleImageUpload(test._id, file);
                              }
                            }}
                          />
                          <label
                            htmlFor={`file-upload-${test._id}`}
                            className="flex cursor-pointer flex-col items-center justify-center px-4 py-8 transition-colors hover:bg-gray-50"
                          >
                            <Upload className="mb-3 h-8 w-8 text-gray-400" />
                            <div className="text-center">
                              <p className="mb-1 text-sm font-medium text-gray-900">
                                点击上传检查图像
                              </p>
                              <p className="text-xs text-gray-500">
                                支持 JPG, PNG 格式，最大 10MB
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Test Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加检查项目"
        onSave={handleAdd}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                检查名称 *
              </label>
              <Input
                placeholder="请输入检查名称"
                value={addForm.test_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, test_name: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                检查日期 *
              </label>
              <Input
                type="date"
                value={addForm.test_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAddForm({ ...addForm, test_date: e.target.value })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              检查结果
            </label>
            <div className="space-y-2">
              {addForm.results.map((result, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="请输入检查结果"
                    value={result}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateResultField(index, e.target.value, false)
                    }
                    className="border-gray-300"
                  />
                  {addForm.results.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeResultField(index, false)}
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
                onClick={() => addResultField(false)}
                className="border-gray-300 text-gray-600"
              >
                <Plus className="mr-1 h-3 w-3" />
                添加结果
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              备注
            </label>
            <Textarea
              placeholder="请输入检查相关备注"
              value={addForm.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAddForm({ ...addForm, notes: e.target.value })
              }
              rows={3}
              className="border-gray-300"
            />
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-h-full max-w-full">
            <img
              src={previewImage}
              alt="检查图像预览"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader2 } from "lucide-react";
import { AddWorkloadFormData } from "@/types/workload";
import { useWorkloadNameValidation } from "@/hooks/workload/use-workload-name-validation";

interface WorkloadBasicFormProps {
  formData: AddWorkloadFormData;
  onUpdateFormData: (updates: Partial<AddWorkloadFormData>) => void;
  errors?: Record<string, string>;
}

export function WorkloadBasicForm({
  formData,
  onUpdateFormData,
  errors,
}: WorkloadBasicFormProps) {
  const {
    validatingWorkloadName,
    workloadNameValidation,
    debouncedValidateWorkloadName,
    resetValidation,
  } = useWorkloadNameValidation();

  const prevNameRef = useRef(formData.name);

  const handleFieldChange = (field: keyof AddWorkloadFormData, value: any) => {
    onUpdateFormData({ [field]: value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    handleFieldChange("name", newName);

    // Trigger debounced validation
    debouncedValidateWorkloadName(newName);
  };

  // Reset validation when component unmounts
  useEffect(() => {
    return () => {
      resetValidation();
    };
  }, [resetValidation]);

  // Get input styling based on validation state
  const getInputClassName = () => {
    let baseClasses = "";

    if (errors?.name) {
      baseClasses += "border-red-500 focus:border-red-500 ";
    } else if (
      !workloadNameValidation.isValid &&
      workloadNameValidation.message
    ) {
      baseClasses += "border-red-500 focus:border-red-500 ";
    } else if (
      workloadNameValidation.isValid &&
      workloadNameValidation.message
    ) {
      baseClasses += "border-green-500 focus:border-green-500 ";
    }

    return baseClasses;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên workload <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Nhập tên workload (ví dụ: ubuntu-24-04)"
                className={getInputClassName()}
              />
              {validatingWorkloadName && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              )}
            </div>

            {/* Error messages */}
            {errors?.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}

            {/* Validation messages */}
            {workloadNameValidation.message && !errors?.name && (
              <p
                className={`text-sm ${
                  workloadNameValidation.isValid
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {workloadNameValidation.isValid ? "✅" : "❌"}{" "}
                {workloadNameValidation.message}
              </p>
            )}

            {/* Loading indicator text */}
            {validatingWorkloadName && (
              <p className="text-sm text-blue-600">
                🔍 Đang kiểm tra tên workload (sẽ hoàn thành trong vài giây)...
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Mô tả mục đích và phạm vi của workload này..."
              rows={4}
              className={errors?.description ? "border-red-500" : ""}
            />
            {errors?.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Bước tiếp theo: Upload file cấu hình rules
                </p>
                <p className="text-xs text-blue-700">
                  Sau khi hoàn thành form này, bạn sẽ upload file Excel chứa các
                  quy tắc bảo mật.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

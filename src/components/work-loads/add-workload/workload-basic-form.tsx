// src/components/work-loads/add-workload/workload-basic-form.tsx
import React from "react";
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
import { Info } from "lucide-react";
import { AddWorkloadFormData } from "@/types/add-workload";

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
  const handleFieldChange = (field: keyof AddWorkloadFormData, value: any) => {
    onUpdateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>
            Cấu hình thông tin cơ bản cho workload mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên workload <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Nhập tên workload (ví dụ: ubuntu-24-04)"
              className={errors?.name ? "border-red-500" : ""}
            />
            {errors?.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
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

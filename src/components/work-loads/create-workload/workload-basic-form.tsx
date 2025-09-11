import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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

import { useWorkloadNameValidation } from "@/hooks/workload/use-workload-name-validation";
import { OSSelector } from "./os-selector/os-selector";
import { CreateWorkloadRequest } from "@/types/workload";

interface WorkloadBasicFormProps {
  formData: CreateWorkloadRequest;
  onUpdateFormData: (updates: Partial<CreateWorkloadRequest>) => void;
  errors?: Record<string, string>;
}

export function WorkloadBasicForm({
  formData,
  onUpdateFormData,
  errors,
}: WorkloadBasicFormProps) {
  const { t } = useTranslation("workload");
  const {
    validatingWorkloadName,
    workloadNameValidation,
    debouncedValidateWorkloadName,
    resetValidation,
  } = useWorkloadNameValidation();

  const handleFieldChange = (
    field: keyof CreateWorkloadRequest,
    value: any
  ) => {
    onUpdateFormData({ [field]: value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    handleFieldChange("workload", { ...formData.workload, name: newName });

    // Trigger debounced validation
    debouncedValidateWorkloadName(newName);
  };

  // Updated to handle number instead of string
  const handleOSVersionChange = (osVersionId: number) => {
    handleFieldChange("workload", {
      ...formData.workload,
      os_id: osVersionId,
    });
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
            {t("add.basicInfo.title")}
          </CardTitle>
          <CardDescription>{t("add.basicInfo.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("add.basicInfo.nameLabel")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.workload.name}
                onChange={handleNameChange}
                placeholder={t("add.basicInfo.namePlaceholder")}
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
                {workloadNameValidation.isValid
                  ? "✓ " + workloadNameValidation.message
                  : "✗ " + workloadNameValidation.message}
              </p>
            )}
          </div>

          {/* OS Version Selector */}
          <OSSelector
            value={formData.workload.os_id}
            onValueChange={handleOSVersionChange}
            placeholder={t("add.basicInfo.osPlaceholder")}
            error={errors?.os_id}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("add.basicInfo.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              value={formData.workload.description || ""}
              onChange={(e) =>
                handleFieldChange("workload", {
                  ...formData.workload,
                  description: e.target.value,
                })
              }
              placeholder={t("add.basicInfo.descriptionPlaceholder")}
              rows={4}
            />
            {errors?.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

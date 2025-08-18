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
import { Switch } from "@/components/ui/switch";
import { Info, Server, Database, Globe, BarChart3 } from "lucide-react";
import { AddWorkloadFormData } from "@/types/add-workload";
import { WorkloadType } from "@/types/workload";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("workload");

  const handleFieldChange = (field: keyof AddWorkloadFormData, value: any) => {
    onUpdateFormData({ [field]: value });
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Configure the basic settings for your new workload. This information
            will be used to identify and categorize the workload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name and Display Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder={t("workloads.form.namePlaceholder")}
                className={errors?.name ? "border-red-500" : ""}
              />
              {errors?.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("workloads.form.nameHelp")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">
                {t("workloads.form.displayName")}
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  handleFieldChange("display_name", e.target.value)
                }
                placeholder={t("workloads.form.displayNamePlaceholder")}
                className={errors?.display_name ? "border-red-500" : ""}
              />
              {errors?.display_name && (
                <p className="text-sm text-red-600">{errors.display_name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("workloads.form.displayNameHelp")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("workloads.form.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder={t("workloads.form.descriptionPlaceholder")}
              rows={3}
              className={errors?.description ? "border-red-500" : ""}
            />
            {errors?.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                {t("workloads.form.isActive")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("workloads.form.activeHelp")}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                handleFieldChange("is_active", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

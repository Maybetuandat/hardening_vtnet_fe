import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, Boxes } from "lucide-react";
import {
  Workload,
  WorkloadCreate,
  WorkloadUpdate,
  WorkloadType,
  WorkloadFormData,
} from "@/types/workload";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface WorkloadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingWorkload?: Workload | null;
  createWorkload: (data: WorkloadCreate) => Promise<void>;
  updateWorkload: (id: number, data: WorkloadUpdate) => Promise<void>;
  onSuccess: () => void;
}

const workloadTypeOptions = [
  {
    value: WorkloadType.OS,
    label: "Operating System",
    description: "CentOS, Ubuntu servers",
  },
  {
    value: WorkloadType.DATABASE,
    label: "Database",
    description: "Oracle, MySQL, PostgreSQL",
  },
  {
    value: WorkloadType.BIG_DATA,
    label: "Big Data",
    description: "Elasticsearch, Hadoop",
  },
  {
    value: WorkloadType.APP,
    label: "Application",
    description: "Web apps, microservices",
  },
];

const getWorkloadTypeColor = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "bg-blue-500";
    case WorkloadType.DATABASE:
      return "bg-orange-500";
    case WorkloadType.BIG_DATA:
      return "bg-purple-500";
    case WorkloadType.APP:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export function WorkloadFormDialog({
  open,
  onOpenChange,
  onClose,
  editingWorkload,
  createWorkload,
  updateWorkload,
  onSuccess,
}: WorkloadFormDialogProps) {
  const { t } = useTranslation("workload");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<WorkloadFormData>({
    name: "",
    display_name: "",
    description: "",
    workload_type: WorkloadType.OS,
    is_active: true,
  });

  // Reset form when dialog opens/closes or editing workload changes
  useEffect(() => {
    if (open) {
      if (editingWorkload) {
        setFormData({
          name: editingWorkload.name,
          display_name: editingWorkload.display_name || "",
          description: editingWorkload.description || "",
          workload_type: editingWorkload.workload_type,
          is_active: editingWorkload.is_active,
        });
      } else {
        setFormData({
          name: "",
          display_name: "",
          description: "",
          workload_type: WorkloadType.OS,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [open, editingWorkload]);

  const updateField = (field: keyof WorkloadFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("workloads.validation.nameRequired");
    } else if (formData.name.length > 100) {
      newErrors.name = t("workloads.validation.nameTooLong");
    }

    if (!formData.workload_type) {
      newErrors.workload_type = t("workloads.validation.typeRequired");
    }

    if (formData.display_name && formData.display_name.length > 150) {
      newErrors.display_name = t("workloads.validation.displayNameTooLong");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        display_name: formData.display_name.trim() || undefined,
        description: formData.description.trim() || undefined,
        workload_type: formData.workload_type,
        is_active: formData.is_active,
      };

      if (editingWorkload) {
        await updateWorkload(editingWorkload.id, submitData);
        toast.success(t("workloads.workloadUpdated"));
      } else {
        await createWorkload(submitData);
        toast.success(t("workloads.workloadCreated"));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || t("common.actionFailed"));
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!editingWorkload;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            {isEdit
              ? t("workloads.form.editWorkload")
              : t("workloads.form.createWorkload")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update workload information and settings"
              : "Create a new workload to manage your infrastructure components"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-4 w-4" />
                {t("workloads.form.basicInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t("workloads.form.name")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={t("workloads.form.namePlaceholder")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("workloads.form.nameHelp")}
                  </p>
                </div>

                {/* Workload Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {t("workloads.form.workloadType")}{" "}
                    <span className="text-red-500">*</span>
                    <Badge
                      className={`${getWorkloadTypeColor(
                        formData.workload_type
                      )} text-white text-xs`}
                    >
                      {formData.workload_type.toUpperCase()}
                    </Badge>
                  </Label>
                  <Select
                    value={formData.workload_type}
                    onValueChange={(value: WorkloadType) =>
                      updateField("workload_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workloadTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workload_type && (
                    <p className="text-sm text-red-600">
                      {errors.workload_type}
                    </p>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">
                  {t("workloads.form.displayName")}
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => updateField("display_name", e.target.value)}
                  placeholder={t("workloads.form.displayNamePlaceholder")}
                  className={errors.display_name ? "border-red-500" : ""}
                />
                {errors.display_name && (
                  <p className="text-sm text-red-600">{errors.display_name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("workloads.form.displayNameHelp")}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("workloads.form.description")}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={t("workloads.form.descriptionPlaceholder")}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">
                    {t("workloads.form.isActive")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("workloads.form.activeHelp")}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    updateField("is_active", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? t("common.update") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

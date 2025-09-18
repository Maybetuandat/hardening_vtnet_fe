import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useWorkloads } from "@/hooks/workload/use-workloads";
import { OSSelector } from "@/components/work-loads/create-workload/os-selector/os-selector";
import { useOS } from "@/hooks/os/use-os";
import { toast } from "sonner";
import { WorkloadUpdate, WorkloadResponse } from "@/types/workload";

interface EditWorkloadDialogProps {
  workload: WorkloadResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditWorkloadDialog: React.FC<EditWorkloadDialogProps> = ({
  workload,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation("workload");
  const [loading, setLoading] = useState(false);
  const [selectedOSVersionId, setSelectedOSVersionId] = useState<number>(0);
  const [formData, setFormData] = useState<WorkloadUpdate>({
    name: workload.name,
    description: workload.description || "",
    os_id: undefined,
  });

  const { updateWorkload } = useWorkloads();
  const { osVersions, fetchOSVersions } = useOS();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: workload.name,
        description: workload.description || "",
        os_id: undefined,
      });

      // Load OS versions để tìm current OS ID
      fetchOSVersions("", 1, 100);
    }
  }, [open, workload, fetchOSVersions]);

  // Set initial OS version ID when OS versions are loaded
  useEffect(() => {
    if (osVersions.length > 0 && workload.os_version) {
      // Tìm OS ID từ version string của workload hiện tại
      const currentOS = osVersions.find(
        (os) => os.version === workload.os_version
      );

      if (currentOS) {
        setSelectedOSVersionId(currentOS.id);
        setFormData((prev) => ({
          ...prev,
          os_id: currentOS.id,
        }));
      }
    }
  }, [osVersions, workload.os_version]);

  // Handle OS ID change from OSSelector
  const handleOSChange = (osVersionId: number) => {
    setSelectedOSVersionId(osVersionId);
    setFormData((prev) => ({
      ...prev,
      os_id: osVersionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error(t("workloadDetail.editDialog.validation.nameRequired"));
      return;
    }

    if (!formData.os_id) {
      toast.error(t("workloadDetail.editDialog.validation.osRequired"));
      return;
    }

    try {
      setLoading(true);

      // Gọi updateWorkload từ useWorkloads hook
      await updateWorkload(workload.id, formData);

      // Hiển thị thông báo thành công
      toast.success(t("workloadDetail.editDialog.messages.updateSuccess"));

      // Đóng dialog
      onOpenChange(false);

      onSuccess();
    } catch (error: any) {
      // Hiển thị lỗi nếu có
      toast.error(
        error.message || t("workloadDetail.editDialog.messages.updateError")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    setFormData({
      name: workload.name,
      description: workload.description || "",
      os_id: undefined,
    });

    // Reset selected OS version ID
    if (osVersions.length > 0 && workload.os_version) {
      const currentOS = osVersions.find(
        (os) => os.version === workload.os_version
      );
      if (currentOS) {
        setSelectedOSVersionId(currentOS.id);
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("workloadDetail.editDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("workloadDetail.editDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("workloadDetail.editDialog.fields.name")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("workloadDetail.editDialog.placeholders.name")}
              disabled={loading}
              required
            />
          </div>

          {/* OS Version Selector */}
          <OSSelector
            value={selectedOSVersionId}
            onValueChange={handleOSChange}
            placeholder={t("workloadDetail.editDialog.placeholders.os")}
            disabled={loading}
          />

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("workloadDetail.editDialog.fields.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t(
                "workloadDetail.editDialog.placeholders.description"
              )}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              {t("workloadDetail.editDialog.actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name?.trim() || !formData.os_id}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading
                ? t("workloadDetail.editDialog.actions.saving")
                : t("workloadDetail.editDialog.actions.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

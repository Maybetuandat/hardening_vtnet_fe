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

import { useWorkloadDetail } from "@/hooks/workload/use-workload-detail";
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkloadUpdate>({
    name: workload.name,
    description: workload.description || "",
  });

  const { updateWorkload } = useWorkloadDetail();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: workload.name,
        description: workload.description || "",
      });
    }
  }, [open, workload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Tên workload không được để trống");
      return;
    }

    try {
      setLoading(true);
      await updateWorkload(workload.id, formData);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: workload.name,
      description: workload.description || "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Workload</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin workload. Nhấn lưu để áp dụng thay đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên workload <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nhập tên workload"
              disabled={loading}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả cho workload (tùy chọn)"
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
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !formData.name?.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

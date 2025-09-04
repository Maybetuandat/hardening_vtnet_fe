import React, { useState } from "react";
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

import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";
import { useRules } from "@/hooks/rule/use-rules";
import { RuleCreate } from "@/types/rule";

interface CreateRuleDialogProps {
  workloadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({
  workloadId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RuleCreate>({
    name: "",
    description: "",

    workload_id: workloadId,
    parameters: {},
    is_active: true,
  });

  const { createRule } = useRules();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      workload_id: workloadId,
      parameters: {},
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await createRule(formData);
      resetForm();
      onSuccess();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo Rule Mới</DialogTitle>
          <DialogDescription>
            Tạo rule mới cho workload. Điền thông tin cần thiết và nhấn lưu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên rule <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nhập tên rule"
              disabled={loading}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả cho rule (tùy chọn)"
              rows={3}
              disabled={loading}
            />
          </div>
          {/* Parameters Field */}
          <div className="space-y-2">
            <Label htmlFor="parameters">Tham số (JSON)</Label>
            <Textarea
              id="parameters"
              value={JSON.stringify(formData.parameters, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setFormData((prev) => ({ ...prev, parameters: params }));
                } catch {
                  // Ignore invalid JSON and do not update parameters
                }
              }}
              placeholder='{"key": "value"}'
              rows={4}
              disabled={loading}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Nhập tham số dưới dạng JSON. Ví dụ: {"{"}"key": "value"{"}"}
            </p>
          </div>

          {/* Is Active Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Trạng thái hoạt động</Label>
              <p className="text-sm text-muted-foreground">
                Rule sẽ được kích hoạt ngay sau khi tạo
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
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
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Đang tạo..." : "Tạo Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

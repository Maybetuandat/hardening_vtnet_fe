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

import { Switch } from "@/components/ui/switch";
import { Save, X, Terminal } from "lucide-react";
import { useRules } from "@/hooks/rule/use-rules";
import { RuleCreate, RuleResponse } from "@/types/rule";

interface EditRuleDialogProps {
  rule: RuleResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditRuleDialog: React.FC<EditRuleDialogProps> = ({
  rule,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RuleCreate>({
    name: rule.name,
    description: rule.description || "",
    workload_id: rule.workload_id,
    parameters: rule.parameters || {},
    is_active: rule.is_active,
    command: rule.command || "",
  });

  const { updateRule } = useRules();

  useEffect(() => {
    if (open) {
      setFormData({
        name: rule.name,
        description: rule.description || "",
        workload_id: rule.workload_id,
        parameters: rule.parameters || {},
        is_active: rule.is_active,
        command: rule.command || "",
      });
    }
  }, [open, rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.command.trim()) {
      return;
    }

    try {
      setLoading(true);
      await updateRule(rule.id, formData);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: rule.name,
      description: rule.description || "",
      workload_id: rule.workload_id,
      parameters: rule.parameters || {},
      is_active: rule.is_active,
      command: rule.command || "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Chỉnh sửa Rule
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin rule. Nhấn lưu để áp dụng thay đổi.
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

          {/* Command Field - NEW */}
          <div className="space-y-2">
            <Label htmlFor="command">
              Lệnh thực thi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="command"
              value={formData.command}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, command: e.target.value }))
              }
              placeholder="Nhập lệnh sẽ được thực thi khi rule được kích hoạt"
              rows={4}
              disabled={loading}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Lệnh này sẽ được thực thi khi rule được kích hoạt. Ví dụ: bash
              script, API call, etc.
            </p>
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
                Bật/tắt trạng thái hoạt động của rule
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
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.name.trim() || !formData.command.trim()
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

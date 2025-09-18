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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Terminal } from "lucide-react";
import { useRules } from "@/hooks/rule/use-rules";
import { RuleCreate, RuleResponse } from "@/types/rule";
import { useTranslation } from "react-i18next";

interface EditRuleDialogProps {
  rule: RuleResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Các giá trị có thể có cho is_active
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const EditRuleDialog: React.FC<EditRuleDialogProps> = ({
  rule,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation("workload");
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

  const handleSubmit = async () => {
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

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option ? t(`ruleDialog.status.${option.value}`) : status;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {t("ruleDialog.title")}
          </DialogTitle>
          <DialogDescription>{t("ruleDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6" onKeyDown={handleKeyDown}>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("ruleDialog.nameLabel")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("ruleDialog.namePlaceholder")}
              disabled={loading}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("ruleDialog.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("ruleDialog.descriptionPlaceholder")}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Command Field */}
          <div className="space-y-2">
            <Label htmlFor="command">
              {t("ruleDialog.commandLabel")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="command"
              value={formData.command}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, command: e.target.value }))
              }
              placeholder={t("ruleDialog.commandPlaceholder")}
              rows={4}
              disabled={loading}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("ruleDialog.commandHelp")}
            </p>
          </div>

          {/* Parameters Field */}
          <div className="space-y-2">
            <Label htmlFor="parameters">
              {t("ruleDialog.parametersLabel")}
            </Label>
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
              {t("ruleDialog.parametersHelp")}
            </p>
          </div>

          {/* Status Field - Updated to use Select instead of Switch */}
          <div className="space-y-2">
            <Label htmlFor="is_active">{t("ruleDialog.statusLabel")}</Label>
            <Select
              value={formData.is_active}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, is_active: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("ruleDialog.selectStatusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          option.value === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {getStatusLabel(option.value)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading || !formData.name.trim() || !formData.command.trim()
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

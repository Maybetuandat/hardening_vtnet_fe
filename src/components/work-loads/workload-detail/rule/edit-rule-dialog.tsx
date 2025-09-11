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
import { useTranslation } from "react-i18next"; // Import useTranslation

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
            {t("ruleDialog.title")}
          </DialogTitle>
          <DialogDescription>{t("ruleDialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            </Label>{" "}
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

          {/* Command Field - NEW */}
          <div className="space-y-2">
            <Label htmlFor="command">
              {t("ruleDialog.commandLabel")}{" "}
              <span className="text-red-500">*</span> {/* Translated */}
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
              {t("ruleDialog.commandHelp")} {/* Translated */}
            </p>
          </div>

          {/* Parameters Field */}
          <div className="space-y-2">
            <Label htmlFor="parameters">
              {t("ruleDialog.parametersLabel")}
            </Label>{" "}
            {/* Translated */}
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
              {t("ruleDialog.parametersHelp")} {/* Translated */}
            </p>
          </div>

          {/* Is Active Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">{t("ruleDialog.statusLabel")}</Label>{" "}
              {/* Translated */}
              <p className="text-sm text-muted-foreground">
                {t("ruleDialog.statusHelp")} {/* Translated */}
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
              {t("common.cancel")} {/* Translated */}
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.name.trim() || !formData.command.trim()
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? t("common.saving") : t("common.saveChanges")}{" "}
              {/* Translated */}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

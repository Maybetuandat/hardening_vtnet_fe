// src/components/rule-request/edit-request-dialog.tsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { RuleChangeRequestResponse } from "@/hooks/rule/use-rule-change-request";

interface EditRequestDialogProps {
  request: RuleChangeRequestResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (requestId: number, newValue: Record<string, any>) => Promise<void>;
}

export const EditRequestDialog: React.FC<EditRequestDialogProps> = ({
  request,
  open,
  onOpenChange,
  onSave,
}) => {
  const { t } = useTranslation("request");
  const [loading, setLoading] = useState(false);
  const [parametersText, setParametersText] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    command: "",
    suggested_fix: "",
    parameters: {} as Record<string, any>,
  });

  useEffect(() => {
    if (open && request.new_value) {
      const newVal = request.new_value;
      setFormData({
        name: newVal.name || "",
        description: newVal.description || "",
        command: newVal.command || "",
        suggested_fix: newVal.suggested_fix || "",
        parameters: newVal.parameters || {},
      });

      const paramsStr = JSON.stringify(newVal.parameters || {}, null, 2);
      setParametersText(paramsStr);
      setIsValidJson(true);
    }
  }, [open, request]);

  const handleParametersChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newText = e.target.value;
    setParametersText(newText);

    try {
      const params = JSON.parse(newText);
      setFormData((prev) => ({ ...prev, parameters: params }));
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.command.trim() || !isValidJson) {
      return;
    }

    try {
      setLoading(true);

      const newValue: Record<string, any> = {};
      if (formData.name) newValue.name = formData.name;
      if (formData.description) newValue.description = formData.description;
      if (formData.command) newValue.command = formData.command;
      if (formData.suggested_fix)
        newValue.suggested_fix = formData.suggested_fix;
      if (formData.parameters) newValue.parameters = formData.parameters;

      await onSave(request.id, newValue);
      onOpenChange(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editDialog.title")}</DialogTitle>
          <DialogDescription>{t("editDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("editDialog.fields.name.label")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("editDialog.fields.name.placeholder")}
              disabled={loading}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("editDialog.fields.description.label")}
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
              placeholder={t("editDialog.fields.description.placeholder")}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Command Field */}
          <div className="space-y-2">
            <Label htmlFor="command">
              {t("editDialog.fields.command.label")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="command"
              value={formData.command}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, command: e.target.value }))
              }
              placeholder={t("editDialog.fields.command.placeholder")}
              rows={4}
              disabled={loading}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("editDialog.fields.command.help")}
            </p>
          </div>

          {/* Parameters Field */}
          <div className="space-y-2">
            <Label htmlFor="parameters">
              {t("editDialog.fields.parameters.label")}
            </Label>
            <Textarea
              id="parameters"
              value={parametersText}
              onChange={handleParametersChange}
              placeholder={t("editDialog.fields.parameters.placeholder")}
              rows={4}
              disabled={loading}
              className={`font-mono text-sm ${
                !isValidJson ? "border-red-300 focus:border-red-500" : ""
              }`}
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">
                {t("editDialog.fields.parameters.help")}
              </p>
              {!isValidJson && (
                <p className="text-xs text-red-500">
                  {t("editDialog.fields.parameters.invalidJson")}
                </p>
              )}
            </div>
          </div>

          {/* Suggested Fix Field */}
          <div className="space-y-2">
            <Label htmlFor="suggested_fix">
              {t("editDialog.fields.suggestedFix.label")}
            </Label>
            <Textarea
              id="suggested_fix"
              value={formData.suggested_fix}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  suggested_fix: e.target.value,
                }))
              }
              placeholder={t("editDialog.fields.suggestedFix.placeholder")}
              rows={3}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {t("editDialog.fields.suggestedFix.help")}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            {t("editDialog.actions.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              !isValidJson ||
              !formData.name.trim() ||
              !formData.command.trim()
            }
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("editDialog.actions.saving")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t("editDialog.actions.save")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, Terminal, Lock, Info, Send } from "lucide-react";
import { useRules } from "@/hooks/rule/use-rules";

import { usePermissions } from "@/hooks/authentication/use-permissions";
import { RuleCreate, RuleResponse } from "@/types/rule";
import { useTranslation } from "react-i18next";
import { useRuleChangeRequests } from "@/hooks/rule/use-rule-change-request";

interface EditRuleDialogProps {
  rule: RuleResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

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
  const { isAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [parametersText, setParametersText] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);

  const [formData, setFormData] = useState<RuleCreate>({
    name: rule.name,
    description: rule.description || "",
    workload_id: rule.workload_id,
    parameters: rule.parameters || {},
    is_active: rule.is_active,
    command: rule.command || "",
    suggested_fix: rule.suggested_fix || "",
  });

  const { updateRule } = useRules();
  const { createUpdateRequest } = useRuleChangeRequests();

  // Kiểm tra quyền
  const canDirectEdit = () => isAdmin();
  const canRequestEdit = () => !isAdmin() && rule.can_be_copied === true;
  const isEditDisabled = !canDirectEdit() && !canRequestEdit();

  // Reset form khi dialog mở
  useEffect(() => {
    if (open) {
      const initialParams = JSON.stringify(rule.parameters || {}, null, 2);
      setParametersText(initialParams);
      setIsValidJson(true);
      setFormData({
        name: rule.name,
        description: rule.description || "",
        workload_id: rule.workload_id,
        parameters: rule.parameters || {},
        is_active: rule.is_active,
        command: rule.command || "",
        suggested_fix: rule.suggested_fix || "",
      });
    }
  }, [open, rule]);

  // Handle submit
  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.command.trim() ||
      isEditDisabled ||
      !isValidJson
    ) {
      return;
    }

    try {
      setLoading(true);

      if (canDirectEdit()) {
        // Admin: Sửa trực tiếp
        await updateRule(rule.id, formData);
        onSuccess();
      } else if (canRequestEdit()) {
        // User: Tạo request
        const changedFields: Record<string, any> = {};
        if (formData.name !== rule.name) changedFields.name = formData.name;
        if (formData.description !== rule.description)
          changedFields.description = formData.description;
        if (formData.command !== rule.command)
          changedFields.command = formData.command;
        if (formData.suggested_fix !== rule.suggested_fix)
          changedFields.suggested_fix = formData.suggested_fix;
        if (
          JSON.stringify(formData.parameters) !==
          JSON.stringify(rule.parameters)
        ) {
          changedFields.parameters = formData.parameters;
        }

        await createUpdateRequest({
          rule_id: rule.id,
          new_value: changedFields,
        });
        onSuccess();
      }
    } catch (error) {
      // Error handled in hooks
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setParametersText(JSON.stringify(rule.parameters || {}, null, 2));
    setIsValidJson(true);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      workload_id: rule.workload_id,
      parameters: rule.parameters || {},
      is_active: rule.is_active,
      command: rule.command || "",
      suggested_fix: rule.suggested_fix || "",
    });
    onOpenChange(false);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      (e.ctrlKey || e.metaKey) &&
      !isEditDisabled &&
      isValidJson
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Button config
  const getButtonConfig = () => {
    if (canDirectEdit()) {
      return {
        text: "Save Changes",
        icon: <Save className="w-4 h-4" />,
        loadingText: "Saving...",
      };
    } else if (canRequestEdit()) {
      return {
        text: "Request Change",
        icon: <Send className="w-4 h-4" />,
        loadingText: "Requesting...",
      };
    }
    return null;
  };

  const buttonConfig = getButtonConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Edit Rule
            {isEditDisabled && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </DialogTitle>
          <DialogDescription>
            {canDirectEdit()
              ? "Update rule information. Click save to apply changes."
              : canRequestEdit()
              ? "You can request changes to this rule. An admin will review your request."
              : "You don't have permission to edit or request changes to this rule."}
          </DialogDescription>
        </DialogHeader>

        {/* Alert cho User cần request */}
        {canRequestEdit() && !canDirectEdit() && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              As a user, your changes will be submitted as a request for admin
              approval. The rule will not be updated immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert không có quyền */}
        {isEditDisabled && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              You don't have permission to edit or request changes to this rule.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6" onKeyDown={handleKeyDown}>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Rule Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter rule name"
              disabled={loading || isEditDisabled}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter rule description (optional)"
              rows={3}
              disabled={loading || isEditDisabled}
            />
          </div>

          {/* Command Field */}
          <div className="space-y-2">
            <Label htmlFor="command">
              Execution Command <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="command"
              value={formData.command}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, command: e.target.value }))
              }
              placeholder="Enter the command to be executed"
              rows={4}
              disabled={loading || isEditDisabled}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              This command will be executed when the rule is triggered.
            </p>
          </div>

          {/* Parameters Field */}
          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Textarea
              id="parameters"
              value={parametersText}
              onChange={handleParametersChange}
              placeholder='{"key": "value"}'
              rows={4}
              disabled={loading || isEditDisabled}
              className={`font-mono text-sm ${
                !isValidJson ? "border-red-300 focus:border-red-500" : ""
              }`}
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">
                Enter parameters as JSON. For example: {'{"key": "value"}'}
              </p>
              {!isValidJson && (
                <p className="text-xs text-red-500">
                  Invalid JSON format. Please check your syntax.
                </p>
              )}
            </div>
          </div>

          {/* Suggested Fix Field */}
          <div className="space-y-2">
            <Label htmlFor="suggested_fix">Suggested Fix</Label>
            <Textarea
              id="suggested_fix"
              value={formData.suggested_fix}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  suggested_fix: e.target.value,
                }))
              }
              placeholder="Enter suggested fix (optional)"
              rows={3}
              disabled={loading || isEditDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Provide a suggested fix or remediation steps for this rule.
            </p>
          </div>

          {/* Status Field - Only admin */}
          {isAdmin() && rule.is_active !== "pending" && (
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, is_active: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
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
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {buttonConfig && (
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                isEditDisabled ||
                !isValidJson ||
                !formData.name.trim() ||
                !formData.command.trim()
              }
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {buttonConfig.loadingText}
                </>
              ) : (
                <>
                  {buttonConfig.icon}
                  <span className="ml-2">{buttonConfig.text}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

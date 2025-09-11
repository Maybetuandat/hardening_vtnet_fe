import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRules } from "@/hooks/rule/use-rules";
import { RuleResponse } from "@/types/rule";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface DeleteRuleDialogProps {
  rule: RuleResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteRuleDialog: React.FC<DeleteRuleDialogProps> = ({
  rule,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation("workload");
  const [loading, setLoading] = useState(false);
  const { deleteRule } = useRules();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRule(rule.id);
      onSuccess();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>{t("ruleDeleteDialog.title")}</AlertDialogTitle>{" "}
          </div>
          <AlertDialogDescription className="text-left space-y-2">
            <p
              dangerouslySetInnerHTML={{
                __html: t("ruleDeleteDialog.description", {
                  ruleName: rule.name,
                }),
              }}
            />
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>{t("ruleDeleteDialog.warningTitle")}</strong>{" "}
              </p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• {t("ruleDeleteDialog.warningBullet1")}</li>{" "}
                <li>• {t("ruleDeleteDialog.warningBullet2")}</li>{" "}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {loading
              ? t("ruleDeleteDialog.deleting")
              : t("ruleDeleteDialog.deleteButton")}{" "}
            {/* Translated */}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, XCircle, Wrench, Copy, Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RuleResult } from "@/types/rule-result";

interface SuggestedFixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ruleResult: RuleResult | null;
  suggestedFix: string;
  ruleName: string;
  onExecuteFix: (ruleResultId: number) => void;
}

export function SuggestedFixDialog({
  isOpen,
  onClose,
  ruleResult,
  suggestedFix,
  ruleName,
  onExecuteFix,
}: SuggestedFixDialogProps) {
  const { t } = useTranslation("compliance");

  const handleExecuteFix = () => {
    if (ruleResult) {
      onExecuteFix(ruleResult.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            {t("suggestedFix.title")} - {ruleName}
          </DialogTitle>
          <DialogDescription>{t("suggestedFix.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="space-y-4">
            {/* Rule Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                {t("suggestedFix.ruleInfo")}
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">
                    {t("table.headers.ruleName")}:
                  </span>{" "}
                  {ruleName}
                </div>
                <div>
                  <span className="font-medium">
                    {t("table.headers.status")}:
                  </span>{" "}
                  <Badge variant="destructive" className="ml-1">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t("table.status.failed")}
                  </Badge>
                </div>
                {ruleResult?.message && (
                  <div>
                    <span className="font-medium">
                      {t("suggestedFix.message")}:
                    </span>{" "}
                    {ruleResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Fix Command */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {t("suggestedFix.command")}
                </h4>
              </div>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap break-words">
                  {suggestedFix}
                </pre>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    {t("suggestedFix.warning.title")}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {t("suggestedFix.warning.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            {t("suggestedFix.cancel")}
          </Button>
          <Button
            onClick={handleExecuteFix}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {t("suggestedFix.execute")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

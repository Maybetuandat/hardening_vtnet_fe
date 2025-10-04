import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  XCircle,
  Wrench,
  Copy,
  Play,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RuleResult } from "@/types/rule-result";
import { toast } from "sonner";

interface SuggestedFixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ruleResult: RuleResult | null;
  suggestedFix: string;
  ruleName: string;
  onExecuteFix: (ruleResultId: number) => Promise<void>;
  executing?: boolean;
}

export function SuggestedFixDialog({
  isOpen,
  onClose,
  ruleResult,
  suggestedFix,
  ruleName,
  onExecuteFix,
  executing = false,
}: SuggestedFixDialogProps) {
  const { t } = useTranslation("compliance");
  const [isExecuting, setIsExecuting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExecuteFix = async () => {
    if (!ruleResult || isExecuting) return;

    setIsExecuting(true);
    try {
      await onExecuteFix(ruleResult.id);
      toast.success(t("suggestedFix.messages.executeSuccess"));
      // Dialog sẽ được đóng từ parent component sau khi thành công
    } catch (error) {
      toast.error(t("suggestedFix.messages.executeError"));
      // Không đóng dialog nếu có lỗi để user có thể thử lại
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(suggestedFix);
    setCopySuccess(true);
    toast.success(t("suggestedFix.messages.copied"));
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClose = () => {
    if (!isExecuting) {
      onClose();
    }
  };

  const isLoading = isExecuting || executing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("suggestedFix.executing")}
              </p>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            {t("suggestedFix.title")} - {ruleName}
          </DialogTitle>
          <DialogDescription>{t("suggestedFix.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCommand}
                  disabled={isLoading}
                  className="h-8"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      {t("suggestedFix.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t("suggestedFix.copyCommand")}
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">
                  {suggestedFix}
                </pre>
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-amber-900">
                  {t("suggestedFix.warning.title")}
                </p>
                <p className="text-amber-700">
                  {t("suggestedFix.warningMessage")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            <X className="h-4 w-4 mr-2" />
            {t("suggestedFix.cancel")}
          </Button>
          <Button
            onClick={handleExecuteFix}
            disabled={isLoading || !ruleResult}
            className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("suggestedFix.executing")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t("suggestedFix.executeFix")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

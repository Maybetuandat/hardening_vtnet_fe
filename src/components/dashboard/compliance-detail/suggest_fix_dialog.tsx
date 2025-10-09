// src/components/dashboard/compliance-detail/suggest_fix_dialog.tsx
import React, { useState, useEffect } from "react";
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
  Send,
  AlertTriangle,
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
import { useFixRequest } from "@/hooks/fix-request/use-fix-request";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface SuggestedFixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ruleResult: RuleResult | null;
  suggestedFix: string;
  ruleName: string;
  instanceId: string;
  loading?: boolean;
  onExecuteFix: (ruleResultId: number) => Promise<void>;
  executing?: boolean;
}

export function SuggestedFixDialog({
  isOpen,
  onClose,
  ruleResult,
  suggestedFix,
  ruleName,
  instanceId,
  loading = false,
  onExecuteFix,
  executing = false,
}: SuggestedFixDialogProps) {
  const { t } = useTranslation("compliance");
  const { isAdmin } = usePermissions();
  const [isExecuting, setIsExecuting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { createFixRequest, loading: creatingFixRequest } = useFixRequest();

  // 🔥 FIX: Lưu ruleResult vào state nội bộ để tránh bị null khi parent reset
  const [savedRuleResult, setSavedRuleResult] = useState<RuleResult | null>(
    ruleResult
  );

  // Cập nhật savedRuleResult khi dialog mở và có ruleResult mới
  useEffect(() => {
    if (isOpen && ruleResult) {
      console.log("💾 Saving ruleResult to internal state:", ruleResult);
      setSavedRuleResult(ruleResult);
    }
  }, [isOpen, ruleResult]);

  // Reset savedRuleResult khi dialog đóng hoàn toàn
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        console.log("🗑️ Clearing saved ruleResult");
        setSavedRuleResult(null);
      }, 300); // Delay để animation đóng hoàn tất
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handler thực thi fix trực tiếp (CHỈ ADMIN)
  const handleExecuteFix = async () => {
    if (!savedRuleResult || isExecuting || !isAdmin()) return;

    setIsExecuting(true);
    try {
      await onExecuteFix(savedRuleResult.id);
      toast.success(t("suggestedFix.messages.executeSuccess"));
      onClose();
    } catch (error) {
      toast.error(t("suggestedFix.messages.executeError"));
    } finally {
      setIsExecuting(false);
    }
  };

  // Mở confirmation dialog
  const handleOpenConfirmDialog = () => {
    console.log("🔵 Opening confirmation dialog");
    console.log("🔵 Current savedRuleResult:", savedRuleResult);
    console.log("🔵 Current instanceId:", instanceId);
    setShowConfirmDialog(true);
  };

  // Xác nhận và tạo fix request
  const handleConfirmRequestFix = async () => {
    console.log("🔵 handleConfirmRequestFix called");
    console.log("🔵 savedRuleResult:", savedRuleResult);
    console.log("🔵 instanceId:", instanceId);
    console.log("🔵 ruleName:", ruleName);
    console.log("🔵 suggestedFix:", suggestedFix);

    if (!savedRuleResult) {
      console.log("🔴 No savedRuleResult, returning early");
      toast.error("Rule result data is missing. Please try again.");
      return;
    }

    const requestData = {
      rule_result_id: savedRuleResult.id,
      instance_id: parseInt(instanceId),
      title: `Fix request for: ${ruleName}`,
      description: `Please fix the failed rule: ${ruleName}\n\nSuggested fix command:\n${suggestedFix}\n\nError message: ${
        savedRuleResult.message || "N/A"
      }`,
    };

    console.log("🟢 Request data to be sent:", requestData);

    try {
      console.log("🟡 Calling createFixRequest...");
      await createFixRequest(requestData);
      console.log("✅ Fix request created successfully");
      toast.success("Fix request sent to admin successfully!");
      setShowConfirmDialog(false);
      onClose();
    } catch (error) {
      console.error("❌ Error in handleConfirmRequestFix:", error);
      // Error đã được handle trong hook
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(suggestedFix);
    setCopySuccess(true);
    toast.success(t("suggestedFix.messages.copied"));
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClose = () => {
    if (!isExecuting && !loading && !creatingFixRequest) {
      onClose();
    }
  };

  const isLoading = isExecuting || executing || loading || creatingFixRequest;

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  {creatingFixRequest
                    ? "Creating fix request..."
                    : loading
                    ? "Loading fix..."
                    : t("suggestedFix.executing")}
                </p>
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              {t("suggestedFix.title")} - {ruleName}
            </DialogTitle>
            <DialogDescription>
              {t("suggestedFix.description")}
            </DialogDescription>
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
                  {savedRuleResult?.message && (
                    <div>
                      <span className="font-medium">
                        {t("suggestedFix.message")}:
                      </span>{" "}
                      {savedRuleResult.message}
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

              {/* Info about fix options */}
              {isAdmin() && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-blue-900">
                      Admin Options Available:
                    </p>
                    <ul className="text-blue-700 space-y-1 list-disc list-inside">
                      <li>
                        <strong>Execute Now:</strong> Run the fix immediately on
                        the server
                      </li>
                      <li>
                        <strong>Request Admin Fix:</strong> Create a fix request
                        for tracking
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {!isAdmin() && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-blue-900">User Notice:</p>
                    <p className="text-blue-700">
                      You can send a fix request to admin for review and
                      approval. The admin will execute the fix after
                      verification.
                    </p>
                  </div>
                </div>
              )}
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

            {/* Request Admin Fix Button - CHO CẢ USER VÀ ADMIN */}
            <Button
              onClick={handleOpenConfirmDialog}
              disabled={isLoading || !savedRuleResult}
              variant="outline"
              className="flex-1 sm:flex-initial border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Send className="h-4 w-4 mr-2" />
              Request Admin Fix
            </Button>

            {/* Execute Fix Button - CHỈ CHO ADMIN */}
            {isAdmin() && (
              <Button
                onClick={handleExecuteFix}
                disabled={isLoading || !savedRuleResult}
                className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-700"
              >
                {isExecuting || executing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("suggestedFix.executing")}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Now
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận gửi yêu cầu sửa lỗi
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">
                  ⚠️ Cảnh báo quan trọng:
                </p>
                <p className="text-sm text-orange-800">
                  Thao tác này sẽ <strong>ảnh hưởng đến dịch vụ</strong> của
                  bạn. Yêu cầu sửa lỗi sẽ được gửi tới admin để xem xét và thực
                  hiện.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Thông tin yêu cầu:</p>
                <div className="space-y-1 ml-2">
                  <div className="flex gap-2 text-muted-foreground">
                    <span>•</span>
                    <div>
                      <strong>Rule:</strong> {ruleName}
                    </div>
                  </div>
                  <div className="flex gap-2 text-muted-foreground">
                    <span>•</span>
                    <div>
                      <strong>Instance:</strong> {instanceId}
                    </div>
                  </div>
                  <div className="flex gap-2 text-muted-foreground">
                    <span>•</span>
                    <div>
                      <strong>Lỗi:</strong> {savedRuleResult?.message || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 space-y-1">
                  <div>✓ Yêu cầu sẽ được admin xem xét trước khi thực hiện</div>
                  <div>✓ Bạn sẽ nhận được thông báo về kết quả</div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={creatingFixRequest}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRequestFix}
              disabled={creatingFixRequest}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {creatingFixRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Xác nhận và gửi"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

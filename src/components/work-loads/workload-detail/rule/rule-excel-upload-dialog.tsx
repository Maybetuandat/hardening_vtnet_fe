import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Terminal,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";

import { useRuleExcelUpload } from "@/hooks/rule/use-rule-excel-upload";
import { ExcelUploadForm } from "../../create-workload/excel-upload-form";
import { RulePreviewDialog } from "../../create-workload/rule-preview-dialog";

interface RuleExcelUploadDialogProps {
  workloadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const RuleExcelUploadDialog: React.FC<RuleExcelUploadDialogProps> = ({
  workloadId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation("workload");
  const [showPreview, setShowPreview] = useState(false);

  const {
    loading,
    checkingExistence,
    error,
    rules,
    checkResults,
    canAddRules,
    parseExcelFile,
    checkRulesExistence,
    createUniqueRules,
    resetState,
  } = useRuleExcelUpload();

  const handleFileUpload = useCallback(
    async (file: File) => {
      return await parseExcelFile(file);
    },
    [parseExcelFile]
  );

  const handleCheckExistence = useCallback(async () => {
    await checkRulesExistence(workloadId);
  }, [checkRulesExistence, workloadId]);

  const handleCreateRules = useCallback(async () => {
    try {
      await createUniqueRules(workloadId);
      handleClose();
      onSuccess();
    } catch (err: any) {}
  }, [createUniqueRules, workloadId, onSuccess]);

  /**
   * Reset và đóng dialog
   */
  const handleClose = useCallback(() => {
    setShowPreview(false);
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const duplicateCount =
    checkResults?.filter((r) => r.is_duplicate).length || 0;
  const uniqueCount = checkResults?.filter((r) => !r.is_duplicate).length || 0;
  const nameDuplicates =
    checkResults?.filter((r) => r.duplicate_reason === "name").length || 0;
  const paramDuplicates =
    checkResults?.filter((r) => r.duplicate_reason === "parameter_hash")
      .length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto [&>button]:top-6">
          <div className="space-y-6 mt-10">
            <ExcelUploadForm
              rules={rules.map((r) => ({
                name: r.name,
                description: r.description,
                parameters: r.parameters ?? {},
                is_active: r.is_active,
                command: r.command,
              }))}
              loading={loading}
              onFileUpload={handleFileUpload}
              onRulesChange={() => {}}
            />

            {rules.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={handleCheckExistence}
                    disabled={checkingExistence || rules.length === 0}
                    className="flex items-center gap-2"
                    variant={checkResults ? "outline" : "default"}
                  >
                    {checkingExistence ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {checkResults
                      ? t("ruleExcelUpload.recheckDuplicates")
                      : t("ruleExcelUpload.checkDuplicates")}
                  </Button>
                </div>
              </div>
            )}
            {checkResults && (
              <div className="space-y-4">
                {/* Duplicate Warning */}
                {duplicateCount > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {t("ruleExcelUpload.duplicateWarning.detected", {
                            count: duplicateCount,
                          })}
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>
                            {t("ruleExcelUpload.duplicateWarning.nameCount", {
                              count: nameDuplicates,
                            })}
                          </li>
                          <li>
                            {t(
                              "ruleExcelUpload.duplicateWarning.parameterCount",
                              { count: paramDuplicates }
                            )}
                          </li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("common.cancel")}
                  </Button>

                  <Button
                    onClick={handleCreateRules}
                    disabled={!canAddRules || loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {t("ruleExcelUpload.addRules", { count: uniqueCount })}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RulePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        rules={rules.map((r) => ({
          name: r.name,
          description: r.description,
          parameters: r.parameters ?? {},
          is_active: r.is_active,
          command: r.command,
        }))}
      />
    </>
  );
};

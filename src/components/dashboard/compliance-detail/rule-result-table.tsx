import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Wrench } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { AdminOnly } from "@/components/auth/role-guard";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import { RuleResult } from "@/types/rule-result";
import { useRules } from "@/hooks/rule/use-rules";
import { RuleResponse } from "@/types/rule";
import { SuggestedFixDialog } from "./suggest_fix_dialog";

interface RuleResultTableProps {
  ruleResults: RuleResult[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onStatusToggle: (
    ruleResultId: number,
    newStatus: "passed" | "failed"
  ) => void;
}

export function RuleResultTable({
  ruleResults,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStatusToggle,
}: RuleResultTableProps) {
  const { t } = useTranslation("compliance");
  const { isAdmin } = usePermissions();
  const { getRuleById } = useRules();

  // State for suggested fix dialog
  const [fixDialogState, setFixDialogState] = useState<{
    isOpen: boolean;
    ruleResult: RuleResult | null;
    suggestedFix: string;
    ruleName: string;
    loading: boolean;
  }>({
    isOpen: false,
    ruleResult: null,
    suggestedFix: "",
    ruleName: "",
    loading: false,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      passed: {
        variant: "success",
        icon: CheckCircle,
        label: t("table.status.passed"),
        color: "text-green-600",
      },
      failed: {
        variant: "destructive",
        icon: XCircle,
        label: t("table.status.failed"),
        color: "text-red-600",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      icon: AlertCircle,
      label: status,
      color: "text-gray-600",
    };

    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant as any}
        className="flex items-center gap-1.5 px-2.5 py-1"
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("table.values.notAvailable");
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOutput = (
    output: Record<string, any> | null | undefined
  ): string => {
    if (!output) return t("table.values.noOutput");

    const values = Object.values(output);
    if (values.length === 0) return t("table.values.noValues");

    return values.map((v) => JSON.stringify(v)).join(", ");
  };

  const handleStatusToggle = (ruleResult: RuleResult) => {
    if (!isAdmin()) return;
    const newStatus = ruleResult.status === "passed" ? "failed" : "passed";
    onStatusToggle(ruleResult.id, newStatus);
  };

  const handleShowSuggestedFix = async (ruleResult: RuleResult) => {
    setFixDialogState((prev) => ({ ...prev, loading: true }));

    try {
      // Fetch rule details to get suggested_fix
      const rule: RuleResponse = await getRuleById(ruleResult.rule_id);

      if (!rule.suggested_fix || rule.suggested_fix.trim() === "") {
        // Show error toast or message that no suggested fix available
        console.error("No suggested fix available for this rule");
        return;
      }

      setFixDialogState({
        isOpen: true,
        ruleResult,
        suggestedFix: rule.suggested_fix,
        ruleName: rule.name,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching rule details:", error);
      setFixDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCloseSuggestedFixDialog = () => {
    setFixDialogState({
      isOpen: false,
      ruleResult: null,
      suggestedFix: "",
      ruleName: "",
      loading: false,
    });
  };

  const handleExecuteFix = (ruleResultId: number, fixCommand: string) => {
    // TODO: Implement the API call to execute the fix
    console.log("Executing fix for rule result:", ruleResultId);
    console.log("Fix command:", fixCommand);

    // Close dialog after execution
    handleCloseSuggestedFixDialog();

    // Show success message or handle the execution result
    // This will be implemented when you need the actual API call
  };

  const getSuggestedFixButton = (ruleResult: RuleResult) => {
    // Only show for failed status
    if (ruleResult.status !== "failed") {
      return null;
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShowSuggestedFix(ruleResult)}
        className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        disabled={fixDialogState.loading}
      >
        <Wrench className="h-3.5 w-3.5" />
        {t("suggestedFix.viewFix")}
      </Button>
    );
  };

  const getToggleButton = (ruleResult: RuleResult) => {
    const isToggleable =
      ruleResult.status === "passed" || ruleResult.status === "failed";
    const isPassed = ruleResult.status === "passed";

    if (!isToggleable) {
      return (
        <div className="w-14 h-7 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-500">
            {t("table.values.notAvailable")}
          </span>
        </div>
      );
    }

    if (!isAdmin()) {
      return (
        <div className="w-14 h-7 bg-gray-200 rounded-full flex items-center justify-center">
          <span
            className={`
              inline-block w-5 h-5 bg-white rounded-full shadow-lg
              ${isPassed ? "translate-x-8" : "translate-x-1"}
            `}
          >
            {isPassed ? (
              <CheckCircle className="w-3 h-3 text-green-600 m-1" />
            ) : (
              <XCircle className="w-3 h-3 text-red-600 m-1" />
            )}
          </span>
        </div>
      );
    }

    const toggleAction = isPassed
      ? t("table.actions.toggleToFailed")
      : t("table.actions.toggleToPassed");

    return (
      <button
        onClick={() => handleStatusToggle(ruleResult)}
        className={`
          relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-200 ease-in-out
          ${
            isPassed
              ? "bg-sidebar-primary shadow-sm"
              : "bg-gray-200 hover:bg-gray-300"
          }
        `}
        title={toggleAction}
      >
        <span
          className={`
            inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
            ${isPassed ? "translate-x-8" : "translate-x-1"}
          `}
        >
          {isPassed ? (
            <CheckCircle className="w-3 h-3 text-green-600 m-1" />
          ) : (
            <XCircle className="w-3 h-3 text-red-600 m-1" />
          )}
        </span>
      </button>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("table.loading")}</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            {t("table.error")}
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {ruleResults && ruleResults.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      {t("table.headers.index")}
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      {t("table.headers.ruleName")}
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("table.headers.status")}
                    </TableHead>
                    <TableHead className="min-w-[250px]">
                      {t("table.headers.parameter")}
                    </TableHead>
                    <TableHead className="min-w-[250px]">
                      {t("table.headers.output")}
                    </TableHead>
                    <TableHead className="w-[180px]">
                      {t("table.headers.createdDate")}
                    </TableHead>
                    <TableHead className="w-[150px] text-center">
                      {t("table.headers.actions")}
                    </TableHead>
                    <AdminOnly>
                      <TableHead className="w-[100px] text-center">
                        {t("table.headers.toggle")}
                      </TableHead>
                    </AdminOnly>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ruleResults.map((ruleResult, index) => (
                    <TableRow key={ruleResult.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm text-muted-foreground align-top">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground break-words">
                            {ruleResult.rule_name ||
                              `Rule ${ruleResult.rule_id}`}
                          </div>
                          {ruleResult.message && (
                            <div className="text-sm text-muted-foreground break-words">
                              {ruleResult.message}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        {getStatusBadge(ruleResult.status)}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="max-w-[250px]">
                          <div className="text-sm font-mono break-words whitespace-pre-wrap">
                            {formatOutput(ruleResult.parameters)}
                          </div>
                          {ruleResult.details && (
                            <div className="text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap">
                              {ruleResult.details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="max-w-[250px]">
                          <div className="text-sm font-mono break-words whitespace-pre-wrap">
                            {formatOutput(ruleResult.output)}
                          </div>
                          {ruleResult.details && (
                            <div className="text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap">
                              {ruleResult.details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm whitespace-nowrap">
                          {formatDate(ruleResult.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        {getSuggestedFixButton(ruleResult)}
                      </TableCell>
                      <AdminOnly>
                        <TableCell className="text-center align-top">
                          {getToggleButton(ruleResult)}
                        </TableCell>
                      </AdminOnly>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              loading={loading}
              showInfo={true}
              showPageSizeSelector={true}
              className="px-6 py-4"
            />
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">{t("table.empty")}</div>
          </div>
        )}
      </Card>

      {/* Suggested Fix Dialog */}
      <SuggestedFixDialog
        isOpen={fixDialogState.isOpen}
        onClose={handleCloseSuggestedFixDialog}
        ruleResult={fixDialogState.ruleResult}
        suggestedFix={fixDialogState.suggestedFix}
        ruleName={fixDialogState.ruleName}
        onExecuteFix={handleExecuteFix}
      />
    </>
  );
}

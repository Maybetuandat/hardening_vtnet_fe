import React from "react";
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
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { RuleResult } from "@/types/rule-result";

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
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      passed: {
        variant: "success",
        icon: CheckCircle,
        label: "Đạt",
        color: "text-green-600",
      },
      failed: {
        variant: "destructive",
        icon: XCircle,
        label: "Lỗi",
        color: "text-red-600",
      },
      skipped: {
        variant: "secondary",
        icon: MinusCircle,
        label: "Bỏ qua",
        color: "text-gray-600",
      },
      error: {
        variant: "destructive",
        icon: AlertCircle,
        label: "Lỗi thực thi",
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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExecutionTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "N/A";
    if (seconds < 1) return "< 1s";
    return `${seconds}s`;
  };

  const formatOutput = (output: Record<string, any> | null | undefined) => {
    if (!output) return "No output";

    if (output.single_value) {
      return output.single_value;
    }

    if (output.all_values) {
      return output.all_values;
    }

    if (output.error || output.parse_error) {
      return `Error: ${output.error || output.parse_error}`;
    }

    const keyCount = Object.keys(output).length;
    return `${keyCount} values`;
  };

  const getOutputTooltip = (output: Record<string, any> | null | undefined) => {
    if (!output) return "No output";
    return JSON.stringify(output, null, 2);
  };

  const handleStatusToggle = (ruleResult: RuleResult) => {
    // Chỉ cho phép toggle giữa passed và failed
    if (ruleResult.status === "skipped" || ruleResult.status === "error") {
      return;
    }

    const newStatus = ruleResult.status === "passed" ? "failed" : "passed";
    onStatusToggle(ruleResult.id, newStatus);
  };

  const getToggleButton = (ruleResult: RuleResult) => {
    const isToggleable =
      ruleResult.status === "passed" || ruleResult.status === "failed";
    const isPassed = ruleResult.status === "passed";

    if (!isToggleable) {
      return (
        <div className="w-14 h-7 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-500">N/A</span>
        </div>
      );
    }

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
        title={`Chuyển trạng thái thành ${isPassed ? "Failed" : "Passed"}`}
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
          <p className="text-muted-foreground">Đang tải rule results...</p>
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
            Có lỗi xảy ra
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {ruleResults && ruleResults.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="min-w-[250px]">Rule Name</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px]">Output</TableHead>
                <TableHead className="w-[100px]">Thời gian</TableHead>
                <TableHead className="w-[180px]">Ngày tạo</TableHead>
                <TableHead className="w-[100px] text-center">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ruleResults.map((ruleResult, index) => (
                <TableRow key={ruleResult.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {ruleResult.rule_name || `Rule ${ruleResult.rule_id}`}
                      </div>
                      {ruleResult.message && (
                        <div className="text-sm text-muted-foreground">
                          {ruleResult.message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(ruleResult.status)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div
                        className="truncate text-sm font-mono"
                        title={getOutputTooltip(ruleResult.output)}
                      >
                        {formatOutput(ruleResult.output)}
                      </div>
                      {ruleResult.details && (
                        <div
                          className="text-xs text-muted-foreground truncate mt-1"
                          title={ruleResult.details}
                        >
                          {ruleResult.details}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatExecutionTime(ruleResult.execution_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(ruleResult.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getToggleButton(ruleResult)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
          <div className="text-muted-foreground">
            Không tìm thấy rule results nào
          </div>
        </div>
      )}
    </Card>
  );
}

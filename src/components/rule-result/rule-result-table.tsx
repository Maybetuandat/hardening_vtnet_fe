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
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { RuleResult } from "@/types/compliance";

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
      passed: { variant: "success", icon: CheckCircle, label: "Đạt" },
      failed: { variant: "destructive", icon: AlertCircle, label: "Lỗi" },
      skipped: { variant: "secondary", icon: AlertCircle, label: "Bỏ qua" },
      error: {
        variant: "destructive",
        icon: AlertCircle,
        label: "Lỗi thực thi",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      icon: AlertCircle,
      label: status,
    };

    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant as any}
        className="flex items-center gap-1"
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      high: { variant: "destructive", label: "Cao" },
      medium: { variant: "default", label: "Trung bình" },
      low: { variant: "secondary", label: "Thấp" },
      info: { variant: "outline", label: "Thông tin" },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || {
      variant: "outline",
      label: severity,
    };

    return <Badge variant={config.variant as any}>{config.label}</Badge>;
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

  const handleStatusToggle = (ruleResult: RuleResult) => {
    const newStatus = ruleResult.status === "passed" ? "failed" : "passed";
    onStatusToggle(ruleResult.id, newStatus);
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
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="min-w-[200px]">Rule Name</TableHead>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px]">Output</TableHead>
                <TableHead className="w-[150px]">Thời gian</TableHead>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ruleResults.map((ruleResult, index) => (
                <TableRow key={ruleResult.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{ruleResult.rule_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Rule ID: {ruleResult.rule_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(ruleResult.severity || "info")}
                  </TableCell>
                  <TableCell>{getStatusBadge(ruleResult.status)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div
                        className="truncate text-sm"
                        title={ruleResult.output}
                      >
                        {ruleResult.output || "No output"}
                      </div>
                      {ruleResult.error_message && (
                        <div
                          className="text-xs text-destructive truncate"
                          title={ruleResult.error_message}
                        >
                          Error: {ruleResult.error_message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(ruleResult.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(ruleResult)}
                      className="h-8 w-8 p-0"
                      title={`Chuyển trạng thái thành ${
                        ruleResult.status === "passed" ? "Failed" : "Passed"
                      }`}
                    >
                      {ruleResult.status === "passed" ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
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

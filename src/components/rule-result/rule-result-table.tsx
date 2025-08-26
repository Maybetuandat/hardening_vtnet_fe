import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { RuleResult } from "@/hooks/rule-result/use-rule-result";

interface RuleResultTableProps {
  ruleResults: RuleResult[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onStatusToggle: (
    ruleResultId: number,
    newStatus: "passed" | "failed"
  ) => void;
  onRefresh: () => void;
}

export function RuleResultTable({
  ruleResults,
  loading,
  error,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStatusToggle,
  onRefresh,
}: RuleResultTableProps) {
  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      high: {
        label: "Cao",
        className: "bg-red-100 text-red-800",
      },
      medium: {
        label: "Trung bình",
        className: "bg-orange-100 text-orange-800",
      },
      low: {
        label: "Thấp",
        className: "bg-yellow-100 text-yellow-800",
      },
      info: {
        label: "Thông tin",
        className: "bg-blue-100 text-blue-800",
      },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || {
      label: severity,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "passed" ? (
      <Badge className="bg-green-100 text-green-800">Đạt</Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        Lỗi
      </Badge>
    );
  };

  const handleStatusToggle = (ruleResult: RuleResult, checked: boolean) => {
    const newStatus = checked ? "passed" : "failed";
    onStatusToggle(ruleResult.id, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Đang tải rule results...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      ) : !ruleResults || ruleResults.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">Chưa có rule results</p>
            <p className="text-sm">
              Không tìm thấy rule result nào cho compliance này.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Rule Name</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="w-20">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ruleResults.map((ruleResult, index) => (
                <TableRow key={ruleResult.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ruleResult.rule_name}</div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(ruleResult.severity)}</TableCell>
                  <TableCell>{getStatusBadge(ruleResult.status)}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      {ruleResult.output && (
                        <div className="text-sm text-muted-foreground truncate">
                          {ruleResult.output}
                        </div>
                      )}
                      {ruleResult.error_message && (
                        <div className="text-sm text-destructive truncate mt-1">
                          {ruleResult.error_message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(ruleResult.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ruleResult.status === "passed"}
                      onCheckedChange={(checked) =>
                        handleStatusToggle(ruleResult, checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
      )}
    </Card>
  );
}

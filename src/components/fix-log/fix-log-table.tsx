import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { FixLog } from "@/types/fix-log";
import {
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface FixLogTableProps {
  fixLogs: FixLog[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function FixLogTable({
  fixLogs,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: FixLogTableProps) {
  const { t } = useTranslation("fixLog");

  type StatusKey = "success" | "failed" | "pending";

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      StatusKey,
      {
        icon: React.ElementType;
        className: string;
        label: string;
      }
    > = {
      success: {
        icon: CheckCircle2,
        className: "bg-green-500/10 text-green-700 border-green-200",
        label: t("table.status.success", { defaultValue: "Success" }),
      },
      failed: {
        icon: XCircle,
        className: "bg-red-500/10 text-red-700 border-red-200",
        label: t("table.status.failed", { defaultValue: "Failed" }),
      },
      pending: {
        icon: AlertCircle,
        className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
        label: t("table.status.pending", { defaultValue: "Pending" }),
      },
    };

    const key: StatusKey = (
      ["success", "failed", "pending"].includes(status) ? status : "pending"
    ) as StatusKey;
    const config = statusConfig[key];
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.className} flex items-center gap-1 w-fit`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("table.error.title", { defaultValue: "Error loading logs" })}
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20">
                  {t("table.columns.id", { defaultValue: "ID" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.ruleName", { defaultValue: "Rule Name" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.user", { defaultValue: "User" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.action", { defaultValue: "Action" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.status", { defaultValue: "Status" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.time", { defaultValue: "Time" })}
                </TableHead>
                <TableHead>
                  {t("table.columns.description", {
                    defaultValue: "Description",
                  })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">
                        {t("table.loading", {
                          defaultValue: "Loading logs...",
                        })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : fixLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {t("table.empty", { defaultValue: "No logs found" })}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                fixLogs.map((log, index) => (
                  <TableRow className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {log.rule_name || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.username || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.old_status} → {log.new_status}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.is_success ? "success" : "failed")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div
                        className="text-sm text-muted-foreground truncate"
                        title={log.execution_output || log.error_message || ""}
                      >
                        {log.execution_output || log.error_message || "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {!loading && fixLogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalItems}
          pageSize={pageSize}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showInfo={true}
          showPageSizeSelector={true}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </>
  );
}

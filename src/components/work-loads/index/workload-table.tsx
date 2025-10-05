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
import { WorkloadResponse } from "@/types/workload";
import { Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import i18n from "@/i18n";

interface WorkloadTableProps {
  workloads: WorkloadResponse[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onEdit: (workload: WorkloadResponse) => void;
  onDelete: (workload: WorkloadResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function WorkloadTable({
  workloads,
  loading,
  error,
  totalItems,
  currentPage,
  totalPages,
  pageSize = 10,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: WorkloadTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("workload");
  const { isAdmin } = usePermissions();

  // Format date with locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    return new Date(dateString).toLocaleDateString(locale);
  };

  // Handle row click to navigate to detail page
  const handleRowClick = (
    workload: WorkloadResponse,
    event: React.MouseEvent
  ) => {
    // Prevent navigation if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }

    navigate(`/workloads/${workload.id}`);
  };

  // Handle action clicks with event stopping
  const handleEdit = (workload: WorkloadResponse, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isAdmin()) {
      return; // Không cho phép edit nếu không phải admin
    }
    onEdit(workload);
  };

  const handleDelete = (
    workload: WorkloadResponse,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!isAdmin()) {
      return; // Không cho phép delete nếu không phải admin
    }
    onDelete(workload);
  };

  return (
    <div className="space-y-4">
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t("workloads.loading")}</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        ) : !workloads || workloads.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              {t("workloads.empty.noWorkloads")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("workloads.empty.addFirst")}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("workloads.table.name")}</TableHead>
                <TableHead>{t("workloads.table.description")}</TableHead>
                <TableHead>{t("workloads.table.createdDate")}</TableHead>
                <TableHead className="text-center">
                  {t("workloads.table.instanceCount") || "Instances"}
                </TableHead>
                <TableHead className="text-center">
                  {t("workloads.table.ruleCount") || "Rules"}
                </TableHead>
                <TableHead>{t("workloads.table.status")}</TableHead>
                <TableHead className="text-right">
                  {t("workloads.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workloads.map((workload) => (
                <TableRow
                  key={workload.id}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={(event) => handleRowClick(workload, event)}
                >
                  <TableCell className="font-medium">{workload.name}</TableCell>
                  <TableCell>
                    {workload.description ? (
                      <span className="text-sm text-muted-foreground">
                        {workload.description.length > 50
                          ? `${workload.description.substring(0, 50)}...`
                          : workload.description}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t("workloads.table.noDescription")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(workload.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {workload.count_instances}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {workload.count_rules}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      {t("workloads.table.active")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => handleEdit(workload, event)}
                        className="h-8 w-8 p-0"
                        title={
                          isAdmin()
                            ? t("workloads.table.editTooltip")
                            : "Chỉ admin mới có thể chỉnh sửa"
                        }
                        disabled={!isAdmin()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => handleDelete(workload, event)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive disabled:text-muted-foreground disabled:hover:text-muted-foreground"
                        title={
                          isAdmin()
                            ? t("workloads.table.deleteTooltip")
                            : "Chỉ admin mới có thể xóa"
                        }
                        disabled={!isAdmin()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {!loading && !error && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
          showInfo={true}
          showPageSizeSelector={!!onPageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}

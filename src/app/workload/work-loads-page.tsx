// src/app/workload/work-loads-page.tsx
import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";
import { useWorkloads } from "@/hooks/use-workloads";
import { Workload } from "@/types/workload";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { WorkloadDeleteDialog } from "@/components/work-loads/workload-delete-dialog";
import WorkloadHeader from "@/components/work-loads/workload-header";
import { WorkloadList } from "@/components/work-loads/workload-list";

export default function WorkloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingWorkload, setEditingWorkload] = useState<Workload | null>(null);
  const [deletingWorkload, setDeletingWorkload] = useState<Workload | null>(
    null
  );

  const { t } = useTranslation("workload");

  const {
    workloads,
    loading,
    error,
    fetchWorkloads,
    updateWorkload,
    deleteWorkload,
    getNumberOfServersByWorkload,
  } = useWorkloads();

  // Date filter logic
  const isWithinDateRange = useCallback(
    (dateString: string, filter: string) => {
      if (filter === "all") return true;

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (filter) {
        case "today":
          return diffDays < 1;
        case "week":
          return diffDays < 7;
        case "month":
          return diffDays < 30;
        default:
          return true;
      }
    },
    []
  );

  // Filter workloads - Updated for new structure
  const filteredWorkloads = useMemo(() => {
    if (!workloads || !Array.isArray(workloads)) {
      return [];
    }

    return workloads.filter((workload) => {
      // Search filter - only check name and description since display_name is removed
      const matchesSearch =
        searchTerm.trim() === "" ||
        workload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workload.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter - assuming all workloads are active by default since is_active is removed
      const matchesStatus = status === "status" || status === "active";

      // Date filter
      const matchesDate = isWithinDateRange(
        workload.created_at ?? "",
        dateFilter
      );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [workloads, searchTerm, status, dateFilter, isWithinDateRange]);

  // Statistics
  const workloadStats = useMemo(() => {
    if (!workloads || !Array.isArray(workloads)) {
      return { total: 0, active: 0, withRules: 0 };
    }

    return {
      total: workloads.length,
      active: workloads.length, // Assuming all are active since is_active is removed
      withRules: 0, // This would need to be calculated from rules data
    };
  }, [workloads]);

  // Handle edit workload
  const handleEditWorkload = useCallback((workload: Workload) => {
    setEditingWorkload(workload);
    // Note: In the original implementation, this would open a form dialog
    // For now, we'll just show a toast since we're focusing on the add functionality
    toast.info("Chức năng chỉnh sửa sẽ được triển khai riêng");
  }, []);

  // Handle delete workload
  const handleDeleteWorkload = useCallback((workload: Workload) => {
    setDeletingWorkload(workload);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      await deleteWorkload(id);
    },
    [deleteWorkload]
  );

  const handleDeleteSuccess = useCallback(() => {
    setDeletingWorkload(null);
    setDeleteDialogOpen(false);
    toast.success("Workload đã được xóa thành công");
    fetchWorkloads();
  }, [fetchWorkloads]);

  const handleRefresh = useCallback(() => {
    fetchWorkloads();
    toast.success("Danh sách workload đã được làm mới");
  }, [fetchWorkloads]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatus("status");
    setDateFilter("all");
    toast.info("Đã xóa tất cả bộ lọc");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkloadHeader
        onRefresh={handleRefresh}
        loading={loading}
        stats={workloadStats}
      />

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Primary Filter Bar */}
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              {
                value: status,
                onChange: setStatus,
                placeholder: "Trạng thái",
                options: [
                  { value: "status", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Không hoạt động" },
                ],
                widthClass: "w-40",
              },
              {
                value: dateFilter,
                onChange: (value: string) =>
                  setDateFilter(value as typeof dateFilter),
                placeholder: "Thời gian tạo",
                options: [
                  { value: "all", label: "Tất cả" },
                  { value: "today", label: "Hôm nay" },
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                ],
                widthClass: "w-36",
              },
            ]}
            onClear={handleClearFilters}
          />

          {/* Filter Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                Hiển thị{" "}
                <span className="font-medium text-foreground">
                  {filteredWorkloads.length}
                </span>{" "}
                trong số{" "}
                <span className="font-medium text-foreground">
                  {workloadStats.total}
                </span>{" "}
                workload
              </span>
              {(searchTerm || status !== "status" || dateFilter !== "all") && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Đang lọc
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{workloadStats.active} hoạt động</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{workloadStats.withRules} có quy tắc</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Workload List */}
      <WorkloadList
        workloads={filteredWorkloads}
        loading={loading}
        error={error}
        onEdit={handleEditWorkload}
        onDelete={handleDeleteWorkload}
        onRetry={handleRefresh}
        getNumberOfServersByWorkload={getNumberOfServersByWorkload}
        emptyStateProps={{
          title: searchTerm
            ? "Không tìm thấy workload"
            : "Chưa có workload nào",
          description: searchTerm
            ? `Không có workload nào phù hợp với "${searchTerm}"`
            : "Tạo workload đầu tiên của bạn để bắt đầu",
          showAddButton: !searchTerm,
        }}
      />

      {/* Delete Dialog */}
      <WorkloadDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingWorkload(null);
        }}
        workload={deletingWorkload}
        onConfirm={handleConfirmDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

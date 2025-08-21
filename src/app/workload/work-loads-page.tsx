// src/app/workload/work-loads-page.tsx
import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workload } from "@/types/workload";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { WorkloadDeleteDialog } from "@/components/work-loads/workload-delete-dialog";
import WorkloadHeader from "@/components/work-loads/workload-header";
import { WorkloadTable } from "@/components/work-loads/workload-table";
import FilterBar from "@/components/ui/filter-bar";
import { useNavigate } from "react-router-dom";
import { useWorkloads } from "@/hooks/workload/use-workloads";

export default function WorkloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWorkload, setDeletingWorkload] = useState<Workload | null>(
    null
  );

  const { t } = useTranslation("workload");
  const navigate = useNavigate();

  const {
    workloads,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    fetchWorkloads,
    searchWorkloads,
    deleteWorkload,
  } = useWorkloads();

  // Auto search when dependencies change
  useEffect(() => {
    searchWorkloads(searchTerm, 1, 10);
  }, [searchTerm, status, dateFilter]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle search execution (manual trigger if needed)
  const handleSearch = useCallback(() => {
    searchWorkloads(searchTerm, 1, 10);
  }, [searchWorkloads, searchTerm]);

  const handleRefresh = useCallback(() => {
    searchWorkloads(searchTerm, currentPage, 10);
    toast.success("Danh sách workload đã được làm mới");
  }, [searchWorkloads, searchTerm, currentPage]);

  const handleAddWorkload = useCallback(() => {
    navigate("/workloads/add");
  }, [navigate]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      searchWorkloads(searchTerm, page, 10);
    },
    [searchWorkloads, searchTerm]
  );

  // Handle edit workload - navigate to edit page
  const handleEditWorkload = useCallback(
    (workload: Workload) => {
      navigate(`/workloads/edit/${workload.id}`);
    },
    [navigate]
  );

  // Handle delete workload - open confirmation dialog
  const handleDeleteWorkload = useCallback((workload: Workload) => {
    setDeletingWorkload(workload);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      try {
        await deleteWorkload(id);
        toast.success("Workload đã được xóa thành công");
        setDeletingWorkload(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa workload");
      }
    },
    [deleteWorkload]
  );

  const handleDeleteSuccess = useCallback(() => {
    setDeletingWorkload(null);
    setDeleteDialogOpen(false);
    toast.success("Workload đã được xóa thành công");
  }, []);

  // Filter options for FilterBar
  const filterOptions = [
    {
      value: status,
      onChange: setStatus,
      placeholder: "Trạng thái",
      options: [
        { value: "all", label: "Tất cả" },
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Không hoạt động" },
      ],
      widthClass: "w-36",
    },
    {
      value: dateFilter,
      onChange: setDateFilter,
      placeholder: "Ngày tạo",
      options: [
        { value: "all", label: "Tất cả" },
        { value: "today", label: "Hôm nay" },
        { value: "week", label: "Tuần này" },
        { value: "month", label: "Tháng này" },
      ],
      widthClass: "w-36",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkloadHeader
        onAddWorkload={handleAddWorkload}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filters={filterOptions}
          />
        </div>
      </Card>

      {/* Workload Table */}
      <WorkloadTable
        workloads={workloads || []}
        loading={loading}
        error={error}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        onEdit={handleEditWorkload}
        onDelete={handleDeleteWorkload}
        onPageChange={handlePageChange}
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

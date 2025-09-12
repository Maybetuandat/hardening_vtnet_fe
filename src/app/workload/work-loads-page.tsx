import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { WorkloadDeleteDialog } from "@/components/work-loads/index/workload-delete-dialog";
import WorkloadHeader from "@/components/work-loads/index/workload-header";
import { WorkloadTable } from "@/components/work-loads/index/workload-table";
import FilterBar from "@/components/ui/filter-bar";
import { useNavigate } from "react-router-dom";
import { useWorkloads } from "@/hooks/workload/use-workloads";
import { WorkloadResponse } from "@/types/workload";

export default function WorkloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(""); // Keyword thực sự dùng để search
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWorkload, setDeletingWorkload] =
    useState<WorkloadResponse | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const { t } = useTranslation("workload");
  const navigate = useNavigate();

  const {
    workloads,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    searchWorkloads,
    deleteWorkload,
  } = useWorkloads();

  // Initial data load
  useEffect(() => {
    searchWorkloads("", 1, pageSize);
  }, [searchWorkloads, pageSize]);

  // Effect khi searchKeyword hoặc status thay đổi
  useEffect(() => {
    searchWorkloads(searchKeyword, 1, pageSize);
  }, [searchKeyword, status, dateFilter, pageSize, searchWorkloads]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    // KHÔNG tự động search gì cả, chỉ update UI
  }, []);

  // Xử lý khi nhấn Enter
  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = searchTerm.trim();
    setSearchKeyword(trimmedSearch);
  }, [searchTerm]);

  // Xử lý khi clear search
  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword(""); // Reset về rỗng để fetch lại all data
  }, []);

  const handleRefresh = useCallback(() => {
    searchWorkloads(searchKeyword, currentPage, pageSize);
    toast.success(t("workloads.refreshed"));
  }, [searchWorkloads, searchKeyword, currentPage, pageSize, t]);

  const handleAddWorkload = useCallback(() => {
    navigate("/workloads/add");
  }, [navigate]);

  const handlePageChange = useCallback(
    (page: number) => {
      searchWorkloads(searchKeyword, page, pageSize);
    },
    [searchWorkloads, searchKeyword, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      searchWorkloads(searchKeyword, 1, newPageSize); // Reset về trang 1 khi thay đổi page size
    },
    [searchWorkloads, searchKeyword]
  );

  const handleEditWorkload = useCallback(
    (workload: WorkloadResponse) => {
      navigate(`/workloads/${workload.id}`);
      console.log("Edit workload:", workload);
    },
    [navigate]
  );

  const handleDeleteWorkload = useCallback((workload: WorkloadResponse) => {
    setDeletingWorkload(workload);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      try {
        await deleteWorkload(id);
        toast.success(t("workloads.workloadDeleted"));
        setDeletingWorkload(null);
        setDeleteDialogOpen(false);
        // Refresh lại danh sách sau khi xóa
        searchWorkloads(searchKeyword, currentPage, pageSize);
      } catch (error) {
        toast.error(t("workloads.form.delete.messages.deleteError"));
      }
    },
    [deleteWorkload, t, searchWorkloads, searchKeyword, currentPage, pageSize]
  );

  const handleDeleteSuccess = useCallback(() => {
    setDeletingWorkload(null);
    setDeleteDialogOpen(false);
    toast.success(t("workloads.workloadDeleted"));
    // Refresh lại danh sách
    searchWorkloads(searchKeyword, currentPage, pageSize);
  }, [t, searchWorkloads, searchKeyword, currentPage, pageSize]);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingWorkload(null);
  }, []);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full px-6 space-y-6">
      {/* Header */}
      <WorkloadHeader
        onAddWorkload={handleAddWorkload}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Search and Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          placeholder={t("common.search")}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [
                { value: "all", label: t("workloads.all") },
                { value: "active", label: t("workloads.active") },
                { value: "inactive", label: t("workloads.inactive") },
              ],
              placeholder: t("workloads.status"),
              widthClass: "w-36",
            },
          ]}
        />
      </Card>

      {/* Workload Table with Pagination */}
      <WorkloadTable
        workloads={workloads || []}
        loading={loading}
        error={error}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onEdit={handleEditWorkload}
        onDelete={handleDeleteWorkload}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Delete Dialog */}
      <WorkloadDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        workload={deletingWorkload}
        onConfirm={handleConfirmDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

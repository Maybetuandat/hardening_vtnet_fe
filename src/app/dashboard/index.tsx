import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ComplianceResult } from "@/types/compliance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCompliance } from "@/hooks/compliance/use-compliance";

import { ComplianceTable } from "@/components/dashboard/compliance-table";
import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";
import { DeleteComplianceDialog } from "@/components/dashboard/delete-compliance-dialog";

export default function SystemHardeningDashboard() {
  const navigate = useNavigate();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [serverId, setServerId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("all");

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    compliance: null as ComplianceResult | null,
  });

  // Hook for compliance data
  const {
    complianceResults,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchComplianceResults,
    deleteCompliance,
    startScan,
    refreshData,
  } = useCompliance();

  // Initial data load and search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComplianceResults(
        searchTerm || undefined,
        serverId,
        status === "all" ? undefined : status,
        1,
        pageSize
      );
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, serverId, status, pageSize, fetchComplianceResults]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Refresh compliance data function for dashboard
  const handleRefreshCompliance = useCallback(async () => {
    await fetchComplianceResults(
      searchTerm || undefined,
      serverId,
      status === "all" ? undefined : status,
      currentPage,
      pageSize
    );
  }, [
    fetchComplianceResults,
    searchTerm,
    serverId,
    status,
    currentPage,
    pageSize,
  ]);

  const handleRefresh = useCallback(() => {
    refreshData();
    toast.success("Dữ liệu đã được làm mới");
  }, [refreshData]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchComplianceResults(
        searchTerm || undefined,
        serverId,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [fetchComplianceResults, searchTerm, serverId, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchComplianceResults(
        searchTerm || undefined,
        serverId,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [fetchComplianceResults, searchTerm, serverId, status]
  );

  const handleViewDetail = useCallback(
    (compliance: ComplianceResult) => {
      navigate(`/compliance/${compliance.id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((compliance: ComplianceResult) => {
    setDeleteDialog({
      open: true,
      compliance,
    });
  }, []);

  const handleDeleteConfirm = useCallback(
    async (complianceId: number) => {
      const success = await deleteCompliance(complianceId);

      if (success) {
        toast.success("Đã xóa kết quả compliance thành công");
      } else {
        toast.error("Có lỗi xảy ra khi xóa compliance result");
      }
    },
    [deleteCompliance]
  );

  // Filter options for FilterBar
  const filterOptions = [
    {
      value: status,
      onChange: setStatus,
      placeholder: "Trạng thái",
      options: [
        { value: "all", label: "Tất cả" },
        { value: "completed", label: "Hoàn thành" },
        { value: "running", label: "Đang chạy" },
        { value: "pending", label: "Chờ xử lý" },
        { value: "failed", label: "Thất bại" },
      ],
      widthClass: "w-36",
    },
  ];

  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      <HeaderDashBoard onRefreshCompliance={handleRefreshCompliance} />

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filters={filterOptions}
          />

          {/* Additional info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {totalItems > 0 && (
                <span>Tìm thấy {totalItems} kết quả compliance</span>
              )}
            </div>
            <div>
              {error && <span className="text-destructive">Lỗi: {error}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <ComplianceTable
        complianceResults={complianceResults}
        loading={loading}
        error={error}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDetail={handleViewDetail}
        onDelete={handleDeleteClick}
        onRefresh={handleRefresh}
      />

      {/* Delete Dialog */}
      <DeleteComplianceDialog
        compliance={deleteDialog.compliance}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}

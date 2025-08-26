// src/app/compliance/compliance-page.tsx
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ComplianceResult } from "@/types/compliance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCompliance } from "@/hooks/compliance/use-compliance";

import { ComplianceTable } from "@/components/dashboard/compliance-table";
import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";

export default function SystemHardeningDashboard() {
  const navigate = useNavigate();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [serverId, setServerId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("all");

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

  const handleStartScan = useCallback(async () => {
    try {
      const success = await startScan();
      if (success) {
        toast.success("Scan compliance đã được khởi động thành công");
      } else {
        toast.error("Không thể khởi động scan compliance");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi khởi động scan");
    }
  }, [startScan]);

  const handleViewDetail = useCallback(
    (compliance: ComplianceResult) => {
      navigate(`/compliance/${compliance.id}`);
    },
    [navigate]
  );

  const handleExportReport = useCallback(() => {
    // TODO: Implement export functionality
    toast.info("Tính năng xuất báo cáo đang được phát triển");
  }, []);

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
        { value: "cancelled", label: "Đã hủy" },
      ],
      widthClass: "w-36",
    },
  ];

  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      <HeaderDashBoard />

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
        onRefresh={handleRefresh}
      />
    </div>
  );
}

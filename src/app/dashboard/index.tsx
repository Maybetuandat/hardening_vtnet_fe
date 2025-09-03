import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { useCompliance } from "@/hooks/compliance/use-compliance";
import { ComplianceTable } from "@/components/dashboard/compliance-table";
import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";
import { useSSENotifications } from "@/hooks/notifications/use-sse-notifications";

export default function SystemHardeningDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
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
    refreshData,
    updateComplianceResult, // 🔥 NEW - Function to update specific record
  } = useCompliance();

  // 🔥 SSE NOTIFICATION HOOK - UPDATE IN-PLACE
  const { isConnected, connectionError } = useSSENotifications(
    useCallback(
      (completedData: any) => {
        console.log(
          "🎉 Compliance completed, updating existing record:",
          completedData.id
        );

        // 🎯 UPDATE IN-PLACE - tìm theo compliance_id và update thuộc tính
        updateComplianceResult(completedData);

        // React sẽ tự động re-render component khi state thay đổi
        // KHÔNG cần refreshData() nữa
      },
      [updateComplianceResult]
    )
  );

  // Initial data load and search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComplianceResults(
        searchTerm || undefined,
        status === "all" ? undefined : status,
        1,
        pageSize
      );
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, status, pageSize, fetchComplianceResults]);

  // 🔥 HIỂN THỊ CONNECTION ERROR
  useEffect(() => {
    if (connectionError) {
      toast.error(`Lỗi kết nối realtime: ${connectionError}`, {
        duration: 5000,
      });
    }
  }, [connectionError]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Refresh compliance data function for dashboard
  const handleRefreshCompliance = useCallback(async () => {
    await fetchComplianceResults(
      searchTerm || undefined,
      status === "all" ? undefined : status,
      currentPage,
      pageSize
    );
  }, [fetchComplianceResults, searchTerm, status, currentPage, pageSize]);

  const handleRefresh = useCallback(() => {
    refreshData();
    toast.success("Dữ liệu đã được làm mới");
  }, [refreshData]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchComplianceResults(
        searchTerm || undefined,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [fetchComplianceResults, searchTerm, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchComplianceResults(
        searchTerm || undefined,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [fetchComplianceResults, searchTerm, status]
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

      {/* 🔥 SSE CONNECTION STATUS INDICATOR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Realtime connected" : "Realtime disconnected"}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filterOptions}
        />
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
        onRefresh={handleRefresh}
      />
    </div>
  );
}

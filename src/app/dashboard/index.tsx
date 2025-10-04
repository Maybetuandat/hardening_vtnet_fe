import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useAutoRequestPermission } from "@/hooks/notifications/use-auto-request-permission";
import { useCompliance } from "@/hooks/compliance/use-compliance";
import { ComplianceTable } from "@/components/dashboard/compliance-table";
import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";
import { useSSENotifications } from "@/hooks/notifications/use-sse-notifications";
import toastHelper from "@/utils/toast-helper";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";

export default function SystemHardeningDashboard() {
  const { t } = useTranslation("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("all");

  // Hook for dashboard stats
  const {
    stats,
    loading: dashboardLoading,
    error: dashboardError,
    fetchStatistics,
  } = useDashboard();

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
  } = useCompliance();

  useAutoRequestPermission();

  // Initial data load
  useEffect(() => {
    fetchComplianceResults(
      undefined,
      status === "all" ? undefined : status,
      1,
      pageSize
    );
  }, [fetchComplianceResults, pageSize, status]);

  // ✅ CALLBACK khi nhận SSE "completed" hoặc "failed"
  // Hàm này sẽ refresh CẢ dashboard stats VÀ compliance table
  const handleComplianceUpdate = useCallback(async () => {
    console.log("🔄 [Dashboard] handleComplianceUpdate triggered by SSE!");
    console.log("📊 [Dashboard] Current filters:", {
      searchKeyword,
      status,
      currentPage,
      pageSize,
    });

    try {
      // 1. Refresh dashboard statistics (biểu đồ)
      await fetchStatistics();
      console.log("✅ [Dashboard] Dashboard charts refreshed");

      // 2. Refresh compliance table
      await fetchComplianceResults(
        searchKeyword || undefined,
        status === "all" ? undefined : status,
        currentPage,
        pageSize
      );
      console.log("✅ [Dashboard] Compliance table refreshed");

      // 3. Show success toast
      toastHelper.success(t("messages.dataRefreshed"));
    } catch (error) {
      console.error("❌ [Dashboard] Error refreshing data:", error);
      toastHelper.error(t("messages.refreshError"));
    }
  }, [
    fetchStatistics,
    fetchComplianceResults,
    searchKeyword,
    status,
    currentPage,
    pageSize,
    t,
  ]);

  // SSE connection
  const { isConnected, connectionError } = useSSENotifications(
    handleComplianceUpdate, // ✅ Callback sẽ được gọi khi có completed/failed event
    undefined // onNewNotification - không cần ở dashboard
  );

  // Effect khi searchKeyword hoặc status thay đổi
  useEffect(() => {
    fetchComplianceResults(
      searchKeyword || undefined,
      status === "all" ? undefined : status,
      1,
      pageSize
    );
  }, [searchKeyword, status, pageSize, fetchComplianceResults]);

  useEffect(() => {
    if (connectionError) {
      toastHelper.error(
        t("realtime.connectionError", { error: connectionError })
      );
    }
  }, [connectionError, t]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = searchTerm.trim();
    setSearchKeyword(trimmedSearch);
  }, [searchTerm]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword("");
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
    toastHelper.success(t("messages.dataRefreshed"));
  }, [refreshData, t]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchComplianceResults(
        searchKeyword || undefined,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [fetchComplianceResults, searchKeyword, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchComplianceResults(
        searchKeyword || undefined,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [fetchComplianceResults, searchKeyword, status]
  );

  const filterOptions = [
    {
      value: status,
      onChange: setStatus,
      placeholder: t("filters.status"),
      options: [
        { value: "all", label: t("filters.all") },
        { value: "completed", label: t("filters.completed") },
        { value: "failed", label: t("filters.failed") },
      ],
      widthClass: "w-36",
    },
  ];

  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      {/* Pass stats và fetchStatistics để HeaderDashBoard có thể hiển thị và refresh */}
      <HeaderDashBoard
        stats={stats}
        loading={dashboardLoading}
        onRefreshDashboard={fetchStatistics}
        error={dashboardError}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? t("realtime.connected") : t("realtime.disconnected")}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          filters={filterOptions}
          placeholder={t("filters.placeholder")}
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

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { useCompliance } from "@/hooks/compliance/use-compliance";
import { ComplianceTable } from "@/components/dashboard/compliance-table";
import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";
import { useSSENotifications } from "@/hooks/notifications/use-sse-notifications";
import { ComplianceResult } from "@/types/compliance";

export default function SystemHardeningDashboard() {
  const { t } = useTranslation("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(""); // Keyword thực sự dùng để search
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
    updateComplianceResult,
  } = useCompliance();

  const { isConnected, connectionError } = useSSENotifications(
    useCallback(
      (completedData: ComplianceResult) => {
        updateComplianceResult(completedData);
      },
      [updateComplianceResult]
    )
  );

  // Initial data load
  useEffect(() => {
    fetchComplianceResults(
      undefined,
      status === "all" ? undefined : status,
      1,
      pageSize
    );
  }, [fetchComplianceResults]);

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
      toast.error(t("realtime.connectionError", { error: connectionError }), {
        duration: 5000,
      });
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

  // Refresh compliance data function for dashboard
  const handleRefreshCompliance = useCallback(async () => {
    await fetchComplianceResults(
      searchKeyword || undefined,
      status === "all" ? undefined : status,
      currentPage,
      pageSize
    );
  }, [fetchComplianceResults, searchKeyword, status, currentPage, pageSize]);

  const handleRefresh = useCallback(() => {
    refreshData();
    toast.success(t("messages.dataRefreshed"));
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
      <HeaderDashBoard onRefreshCompliance={handleRefreshCompliance} />

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

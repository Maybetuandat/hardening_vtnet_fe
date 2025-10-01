import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { useFixLogs } from "@/hooks/fix-log/use-fix-logs";
import { useTranslation } from "react-i18next";
import toastHelper from "@/utils/toast-helper";
import { FixLogHeader } from "@/components/fix-log/fix-log-header";
import { FixLogTable } from "@/components/fix-log/fix-log-table";

export default function FixLogPage() {
  const { t } = useTranslation("fixLog");
  const navigate = useNavigate();

  const {
    fixLogs,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchFixLogs,
    refreshData,
  } = useFixLogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  useEffect(() => {
    fetchFixLogs(undefined, undefined, undefined, undefined, 1, pageSize);
  }, [fetchFixLogs, pageSize]);

  useEffect(() => {
    const userId = userFilter === "all" ? undefined : parseInt(userFilter);
    fetchFixLogs(
      undefined,
      undefined,
      userId,
      searchKeyword || undefined,
      1,
      pageSize
    );
  }, [searchKeyword, statusFilter, userFilter, pageSize, fetchFixLogs]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refreshData();
    toastHelper.success(
      t("messages.refreshSuccess", { defaultValue: "Refreshed successfully" })
    );
  }, [refreshData, t]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchKeyword(searchTerm.trim());
  }, [searchTerm]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword("");
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const userId = userFilter === "all" ? undefined : parseInt(userFilter);
      fetchFixLogs(
        undefined,
        undefined,
        userId,
        searchKeyword || undefined,
        page,
        pageSize
      );
    },
    [fetchFixLogs, userFilter, searchKeyword, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      const userId = userFilter === "all" ? undefined : parseInt(userFilter);
      fetchFixLogs(
        undefined,
        undefined,
        userId,
        searchKeyword || undefined,
        1,
        newPageSize
      );
    },
    [fetchFixLogs, userFilter, searchKeyword]
  );

  useEffect(() => {
    if (error) {
      toastHelper.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full px-4 md:px-6 space-y-6">
      <FixLogHeader
        onBack={handleBack}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          placeholder={t("filters.searchPlaceholder", {
            defaultValue: "Search by rule name, action, or description...",
          })}
          filters={[
            {
              value: statusFilter,
              onChange: handleStatusFilterChange,
              placeholder: t("filters.status", { defaultValue: "Status" }),
              options: [
                {
                  value: "all",
                  label: t("filters.allStatus", { defaultValue: "All Status" }),
                },
                {
                  value: "success",
                  label: t("filters.success", { defaultValue: "Success" }),
                },
                {
                  value: "failed",
                  label: t("filters.failed", { defaultValue: "Failed" }),
                },
                {
                  value: "pending",
                  label: t("filters.pending", { defaultValue: "Pending" }),
                },
              ],
              widthClass: "w-40",
            },
          ]}
        />
      </Card>

      <FixLogTable
        fixLogs={fixLogs}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

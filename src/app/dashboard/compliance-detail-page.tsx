import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useCompliance } from "@/hooks/compliance/use-compliance";

import FilterBar from "@/components/ui/filter-bar";
import HeaderDashBoard from "@/components/dashboard/header-dashboard";
import { ComplianceDetailInfo } from "@/components/dashboard/compliance-detail-info";
import { RuleResultTable } from "@/components/rule-result/rule-result-table";
import { useRuleResults } from "@/hooks/rule-result/use-rule-result";
import { ComplianceResultDetail } from "@/types/compliance";

export default function ComplianceDetailPage() {
  const { t } = useTranslation("compliance");
  const { complianceId: id } = useParams<{ complianceId: string }>();
  const navigate = useNavigate();
  const complianceId = parseInt(id || "0", 10);

  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState(""); // real search for input field

  // Compliance detail hook
  const { getComplianceDetail } = useCompliance();
  const [complianceDetail, setComplianceDetail] =
    useState<ComplianceResultDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Rule results hook
  const {
    ruleResults,
    loading: loadingRules,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchRuleResults,
    updateRuleStatus,
    refreshData,
  } = useRuleResults();

  // Load compliance detail
  const loadComplianceDetail = useCallback(async () => {
    if (!complianceId || complianceId <= 0) return;

    setLoadingDetail(true);
    try {
      const detail = await getComplianceDetail(complianceId);
      setComplianceDetail(detail);
    } catch (err) {
      toast.error(t("detail.messages.loadDetailError"));
    } finally {
      setLoadingDetail(false);
    }
  }, [complianceId, getComplianceDetail, t]);

  // Load rule results with debounce
  useEffect(() => {
    if (!complianceId || complianceId <= 0) return;

    fetchRuleResults(
      complianceId,
      searchKeyword || undefined,
      status === "all" ? undefined : status,
      1,
      pageSize
    );
  }, [complianceId, searchKeyword, status, pageSize, fetchRuleResults]);

  // Initial load
  useEffect(() => {
    if (complianceId && complianceId > 0) {
      loadComplianceDetail();
    }
  }, [loadComplianceDetail]);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = searchTerm.trim();
    setSearchKeyword(trimmedSearch);
  }, [searchTerm]);

  const handleClearFilters = useCallback(() => {
    setSearchKeyword("");
    setSearchTerm("");
    setStatus("all");
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchRuleResults(
        complianceId,
        searchKeyword || undefined,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [complianceId, searchKeyword, status, pageSize, fetchRuleResults]
  );

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword(""); // Reset về rỗng để fetch lại all data
  }, []);
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchRuleResults(
        complianceId,
        searchKeyword || undefined,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [complianceId, searchKeyword, status, fetchRuleResults]
  );

  const handleStatusToggle = useCallback(
    async (ruleResultId: number, newStatus: "passed" | "failed") => {
      const success = await updateRuleStatus(ruleResultId, newStatus);

      if (success) {
        const statusText =
          newStatus === "passed"
            ? t("detail.status.passed")
            : t("detail.status.failed");

        toast.success(
          t("detail.messages.updateStatusSuccess", { status: statusText })
        );
        // Refresh compliance detail to update scores
        await loadComplianceDetail();
      } else {
        toast.error(t("detail.messages.updateStatusError"));
      }
    },
    [updateRuleStatus, loadComplianceDetail, t]
  );

  const handleRefresh = useCallback(() => {
    refreshData();
    loadComplianceDetail();
    toast.success(t("detail.messages.dataRefreshed"));
  }, [refreshData, loadComplianceDetail, t]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const hasActiveFilters = searchKeyword.trim() || (status && status !== "all");

  if (!id || complianceId <= 0) {
    return (
      <div className="min-h-screen w-full px-4 px-6 space-y-6">
        <HeaderDashBoard />
        <div className="text-center py-12">
          <p className="text-destructive">
            {t("detail.invalidId", { id, parsedId: complianceId })}
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.backButton")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("detail.backButton")}
        </Button>
      </div>

      {/* Compliance Detail Info */}
      <ComplianceDetailInfo
        compliance={complianceDetail}
        loading={loadingDetail}
      />

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            placeholder={t("detail.searchPlaceholder")}
            filters={[
              {
                value: status,
                onChange: setStatus,
                placeholder: t("detail.filters.status"),
                options: [
                  { value: "all", label: t("detail.filters.allStatus") },
                  { value: "passed", label: t("detail.filters.passed") },
                  { value: "failed", label: t("detail.filters.failed") },
                ],
                widthClass: "w-40",
              },
            ]}
          />

          {/* Action Buttons */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                {t("detail.actions.clearFilters")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-sm"
              >
                {t("detail.actions.refresh")}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Rule Results Table */}
      <RuleResultTable
        ruleResults={ruleResults}
        loading={loadingRules}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}

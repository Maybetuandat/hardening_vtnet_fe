import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const complianceId = parseInt(id || "0", 10);

  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");

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
    if (!complianceId) return;

    setLoadingDetail(true);
    try {
      const detail = await getComplianceDetail(complianceId);
      setComplianceDetail(detail);
    } catch (err) {
      toast.error("Không thể tải chi tiết compliance");
    } finally {
      setLoadingDetail(false);
    }
  }, [complianceId, getComplianceDetail]);

  // Load rule results with debounce
  useEffect(() => {
    if (!complianceId) return;

    const timeoutId = setTimeout(() => {
      fetchRuleResults(
        complianceId,
        searchTerm || undefined,
        status === "all" ? undefined : status,
        1,
        pageSize
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [complianceId, searchTerm, status, pageSize, fetchRuleResults]);

  // Initial load
  useEffect(() => {
    if (complianceId) {
      loadComplianceDetail();
    }
  }, [loadComplianceDetail]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setSearchTerm(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setStatus("all");
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchRuleResults(
        complianceId,
        searchTerm || undefined,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [complianceId, searchTerm, status, pageSize, fetchRuleResults]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchRuleResults(
        complianceId,
        searchTerm || undefined,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [complianceId, searchTerm, status, fetchRuleResults]
  );

  const handleStatusToggle = useCallback(
    async (ruleResultId: number, newStatus: "passed" | "failed") => {
      const success = await updateRuleStatus(ruleResultId, newStatus);

      if (success) {
        toast.success(
          `Đã cập nhật trạng thái thành ${
            newStatus === "passed" ? "Đạt" : "Lỗi"
          }`
        );
        // Refresh compliance detail to update scores
        await loadComplianceDetail();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    },
    [updateRuleStatus, loadComplianceDetail]
  );

  const handleRefresh = useCallback(() => {
    refreshData();
    loadComplianceDetail();
    toast.success("Dữ liệu đã được làm mới");
  }, [refreshData, loadComplianceDetail]);

  const handleBack = () => {
    navigate("/compliance");
  };

  const hasActiveFilters = searchInput.trim() || (status && status !== "all");

  if (!complianceId) {
    return (
      <div className="min-h-screen w-full px-4 px-6 space-y-6">
        <HeaderDashBoard />
        <div className="text-center py-12">
          <p className="text-destructive">ID compliance không hợp lệ</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      <HeaderDashBoard />

      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>

      {/* Compliance Detail Info */}
      {complianceDetail && (
        <ComplianceDetailInfo
          compliance={complianceDetail}
          loading={loadingDetail}
        />
      )}

      {/* Rule Results Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Rule Results</h2>

        <Card className="p-6">
          <FilterBar
            searchTerm={searchInput}
            onSearchChange={handleSearchChange}
            filters={[
              {
                value: status,
                onChange: setStatus,
                placeholder: "Trạng thái",
                options: [
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "passed", label: "Đạt" },
                  { value: "failed", label: "Lỗi" },
                ],
                widthClass: "w-48",
              },
            ]}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loadingRules}
              >
                Làm mới
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={loadingRules}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {totalItems > 0 && (
                <span>Tìm thấy {totalItems} rule results</span>
              )}
            </div>
          </div>
        </Card>

        {/* Results Table */}
        <RuleResultTable
          ruleResults={ruleResults}
          loading={loadingRules}
          error={error}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onStatusToggle={handleStatusToggle}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}

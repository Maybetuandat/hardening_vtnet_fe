import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { ComplianceResult } from "@/types/compliance";

import FilterBar from "@/components/ui/filter-bar";

import { ComplianceHistoryTable } from "@/components/dashboard/compliance-history/compliance-history-table";
import { useHistoryCompliance } from "@/hooks/compliance/use-history-compliance";

export default function ServerHardeningHistoryPage() {
  const { serverIp } = useParams<{ serverIp: string }>();
  const navigate = useNavigate();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

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
  } = useHistoryCompliance();

  // Initial data load and search effect
  useEffect(() => {
    if (!serverIp) return;

    const timeoutId = setTimeout(() => {
      fetchComplianceResults(
        searchTerm || serverIp,

        status === "all" ? undefined : status,
        1,
        pageSize
      );
    }, 500); // Debounce search
    console.log("Fetching compliance results for server IP:", serverIp);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, status, pageSize, fetchComplianceResults, serverIp]);

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
        undefined,
        status === "all" ? undefined : status,
        page,
        pageSize
      );
    },
    [fetchComplianceResults, serverIp, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchComplianceResults(
        undefined,
        status === "all" ? undefined : status,
        1,
        newPageSize
      );
    },
    [fetchComplianceResults, serverIp, status]
  );

  const handleViewDetail = useCallback(
    (compliance: ComplianceResult) => {
      navigate(`/compliance/${compliance.id}`);
    },
    [navigate]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!serverIp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Server IP không hợp lệ</p>
          <Button onClick={handleBack}>Quay lại danh sách server</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Lịch sử Hardening
            </h1>
            <p className="text-muted-foreground mt-2 italic">
              Server: {serverIp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={[
          {
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "Tất cả trạng thái" },
              { value: "completed", label: "Hoàn thành" },
              { value: "failed", label: "Thất bại" },
              { value: "pending", label: "Đang xử lý" },
              { value: "running", label: "Đang chạy" },
            ],
            placeholder: "Trạng thái",
            widthClass: "w-40",
          },
        ]}
      />

      <ComplianceHistoryTable
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

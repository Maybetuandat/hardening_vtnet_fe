import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { RequestsTable } from "@/components/rule-request/request-table";
import { EditRequestDialog } from "@/components/rule-request/edit-request-dialog";

import {
  useRuleChangeRequests,
  RuleChangeRequestResponse,
} from "@/hooks/rule/use-rule-change-request";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import { FileEdit, RefreshCw, ShieldCheck } from "lucide-react";
import { AdminRequestsTable } from "@/components/rule-request/admin-requests-table";
import toastHelper from "@/utils/toast-helper";

export default function RequestPage() {
  const { t } = useTranslation("request");
  const { isAdmin } = usePermissions();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    requests,
    loading,
    fetchMyRequests,
    fetchPendingRequests,
    fetchAllRequests, // Thêm hook này để fetch tất cả requests cho admin
    updateMyRequest,
    deleteMyRequest,
    approveRequest,
    rejectRequest,
  } = useRuleChangeRequests();

  // Get query params from URL
  const requestIdFromUrl = searchParams.get("requestId");
  const workloadIdFromUrl = searchParams.get("workloadId");
  const ruleNameFromUrl = searchParams.get("ruleName");

  // Filter states
  const [filterStatus, setFilterStatus] = useState("pending"); // Admin mặc định xem pending
  const [searchTerm, setSearchTerm] = useState(ruleNameFromUrl || "");
  const [searchKeyword, setSearchKeyword] = useState(ruleNameFromUrl || "");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [editingRequest, setEditingRequest] =
    useState<RuleChangeRequestResponse | null>(null);

  // Initial load - phụ thuộc vào role và filter status
  useEffect(() => {
    if (isAdmin()) {
      if (filterStatus === "all") {
        fetchAllRequests(); // Fetch tất cả requests
      } else {
        fetchPendingRequests(); // Fetch chỉ pending requests
      }
    } else {
      fetchMyRequests(); // User: xem my requests
    }
  }, [filterStatus]); // Thêm filterStatus vào dependency

  // Handle highlighting request from notification
  useEffect(() => {
    if (requestIdFromUrl && requests.length > 0) {
      // Find the request in the list
      const targetRequest = requests.find(
        (req) => req.id === parseInt(requestIdFromUrl)
      );

      if (targetRequest) {
        // Scroll to the request element
        setTimeout(() => {
          const element = document.getElementById(
            `request-${requestIdFromUrl}`
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // Add highlight animation
            element.classList.add("highlight-request");

            // Remove highlight after 2 seconds
            setTimeout(() => {
              element.classList.remove("highlight-request");
            }, 2000);
          }
        }, 100);

        // Show toast notification
        toastHelper.info(
          `Showing request: ${targetRequest.rule_name || "Rule"}`
        );
      } else {
        toastHelper.warning("Request not found in current view");
      }
    }
  }, [requestIdFromUrl, requests]);

  // Handle search
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchKeyword(searchTerm.trim());
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (isAdmin()) {
      if (filterStatus === "all") {
        fetchAllRequests();
      } else {
        fetchPendingRequests();
      }
    } else {
      fetchMyRequests();
    }
  }, [
    isAdmin,
    filterStatus,
    fetchAllRequests,
    fetchPendingRequests,
    fetchMyRequests,
  ]);

  // User actions
  const handleEdit = (request: RuleChangeRequestResponse) => {
    setEditingRequest(request);
  };

  const handleDelete = async (requestId: number) => {
    if (!confirm(t("deleteConfirm.message"))) return;
    await deleteMyRequest(requestId);
  };

  const handleSaveEdit = async (
    requestId: number,
    newValue: Record<string, any>
  ) => {
    await updateMyRequest(requestId, newValue);
    setEditingRequest(null);
  };

  // Admin actions
  const handleApprove = async (requestId: number, adminNote?: string) => {
    await approveRequest(requestId, adminNote);
  };

  const handleReject = async (requestId: number, adminNote?: string) => {
    await rejectRequest(requestId, adminNote);
  };

  // Filter requests based on status and search
  const filteredRequests = requests.filter((request) => {
    // Xử lý filter status cho cả admin và user
    const matchStatus =
      filterStatus === "all" || request.status === filterStatus;

    const matchSearch =
      !searchKeyword ||
      request.rule_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.workload_name
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());

    // If workloadId is in URL, filter by it
    const matchWorkload = workloadIdFromUrl
      ? request.workload_id === parseInt(workloadIdFromUrl)
      : true;

    return matchStatus && matchSearch && matchWorkload;
  });

  // Pagination
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {isAdmin() ? (
              <>
                <ShieldCheck className="h-8 w-8" />
                {t("page.titleAdmin")}
              </>
            ) : (
              <>
                <FileEdit className="h-8 w-8" />
                {t("page.title")}
              </>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin() ? t("page.subtitleAdmin") : t("page.subtitle")}
          </p>

          {/* Show filter info if coming from notification */}
          {(workloadIdFromUrl || ruleNameFromUrl) && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Filtered by:</span>
              {ruleNameFromUrl && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  Rule: {ruleNameFromUrl}
                </span>
              )}
              {workloadIdFromUrl && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  Workload ID: {workloadIdFromUrl}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/requests")}
                className="h-6 text-xs"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("page.refresh")}
        </Button>
      </div>

      {/* Filter Bar - Admin cũng có filter status */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        filters={
          isAdmin()
            ? [
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [
                    { value: "pending", label: t("filters.pending") },
                    { value: "approved", label: t("filters.approved") },
                    { value: "rejected", label: t("filters.rejected") },
                    { value: "all", label: t("filters.allStatus") },
                  ],
                  placeholder: t("filters.status"),
                  widthClass: "w-40",
                },
              ]
            : [
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [
                    { value: "all", label: t("filters.allStatus") },
                    { value: "pending", label: t("filters.pending") },
                    { value: "approved", label: t("filters.approved") },
                    { value: "rejected", label: t("filters.rejected") },
                  ],
                  placeholder: t("filters.status"),
                  widthClass: "w-40",
                },
              ]
        }
      />

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isAdmin() ? (
          <AdminRequestsTable
            requests={paginatedRequests}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <RequestsTable
            requests={paginatedRequests}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              showInfo={true}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      {editingRequest && (
        <EditRequestDialog
          request={editingRequest}
          open={!!editingRequest}
          onOpenChange={() => setEditingRequest(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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

export default function RequestPage() {
  const { t } = useTranslation("request");
  const { isAdmin } = usePermissions();

  const {
    requests,
    loading,
    fetchMyRequests,
    fetchPendingRequests,
    updateMyRequest,
    deleteMyRequest,
    approveRequest,
    rejectRequest,
  } = useRuleChangeRequests();

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [editingRequest, setEditingRequest] =
    useState<RuleChangeRequestResponse | null>(null);

  // Initial load - phụ thuộc vào role
  useEffect(() => {
    if (isAdmin()) {
      fetchPendingRequests(); // Admin: xem pending requests
    } else {
      fetchMyRequests(); // User: xem my requests
    }
  }, []);

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
      fetchPendingRequests();
    } else {
      fetchMyRequests();
    }
  }, []);

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
    // Admin chỉ thấy pending, User thấy all/pending/approved/rejected
    const matchStatus = isAdmin()
      ? true // Admin luôn thấy (vì đã fetch pending only)
      : filterStatus === "all" || request.status === filterStatus;

    const matchSearch =
      !searchKeyword ||
      request.rule_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.workload_name
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());

    return matchStatus && matchSearch;
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

      {/* Filter Bar - User có filter status, Admin không cần */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        filters={
          isAdmin()
            ? [] // Admin không cần filter status
            : [
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [
                    { value: "all", label: t("filters.status.all") },
                    { value: "pending", label: t("filters.status.pending") },
                    { value: "approved", label: t("filters.status.approved") },
                    { value: "rejected", label: t("filters.status.rejected") },
                  ],
                  placeholder: t("filters.status.placeholder"),
                  widthClass: "w-40",
                },
              ]
        }
      />

      {/* Table - Khác nhau cho User vs Admin */}
      <Card>
        {isAdmin() ? (
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
        {!loading && paginatedRequests.length > 0 && (
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
        )}
      </Card>

      {/* Edit Request Dialog - chỉ cho User */}
      {!isAdmin() && editingRequest && (
        <EditRequestDialog
          request={editingRequest}
          open={!!editingRequest}
          onOpenChange={(open) => !open && setEditingRequest(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

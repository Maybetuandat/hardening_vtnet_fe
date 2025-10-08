// src/app/fix-requests/fix-requests-page.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { RefreshCw, Wrench, ShieldCheck } from "lucide-react";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import { useFixRequest } from "@/hooks/fix-request/use-fix-request";
import { FixRequestsTable } from "@/components/fix-request/fix-requests-table";
import { AdminFixRequestsTable } from "@/components/fix-request/admin-fix-requests-table";

export default function FixRequestsPage() {
  const { t } = useTranslation();
  const { isAdmin } = usePermissions();

  const {
    requests,
    loading,
    fetchMyRequests,
    fetchAllRequests,
    deleteMyRequest,
    approveRequest,
    rejectRequest,
  } = useFixRequest();

  // Filter states
  const [filterStatus, setFilterStatus] = useState(
    isAdmin() ? "pending" : "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Initial load
  useEffect(() => {
    const statusParam = filterStatus === "all" ? undefined : filterStatus;

    if (isAdmin()) {
      fetchAllRequests(statusParam);
    } else {
      fetchMyRequests(statusParam);
    }
  }, [filterStatus, isAdmin, fetchAllRequests, fetchMyRequests]);

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
    const statusParam = filterStatus === "all" ? undefined : filterStatus;

    if (isAdmin()) {
      fetchAllRequests(statusParam);
    } else {
      fetchMyRequests(statusParam);
    }
  }, [filterStatus, isAdmin, fetchAllRequests, fetchMyRequests]);

  // User actions
  const handleDelete = async (requestId: number) => {
    if (!confirm("Are you sure you want to delete this fix request?")) return;
    await deleteMyRequest(requestId);
  };

  // Admin actions
  const handleApprove = async (requestId: number, adminComment?: string) => {
    await approveRequest(requestId, adminComment);
  };

  const handleReject = async (requestId: number, adminComment?: string) => {
    await rejectRequest(requestId, adminComment);
  };

  // Filter requests based on search
  const filteredRequests = requests.filter((request) => {
    const matchSearch =
      !searchKeyword ||
      request.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.instance_id?.toString().includes(searchKeyword) || // FIXED: Convert number to string for search
      request.created_by?.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchSearch;
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
                Fix Requests Management
              </>
            ) : (
              <>
                <Wrench className="h-8 w-8" />
                My Fix Requests
              </>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin()
              ? "Review and manage fix requests from users"
              : "View and manage your fix requests"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
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
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "executing", label: "Executing" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                    { value: "all", label: "All Status" },
                  ],
                  placeholder: "Status",
                  widthClass: "w-40",
                },
              ]
            : [
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "executing", label: "Executing" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                  ],
                  placeholder: "Status",
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
          <AdminFixRequestsTable
            requests={paginatedRequests}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <FixRequestsTable
            requests={paginatedRequests}
            loading={loading}
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
    </div>
  );
}

// src/app/server/server-page.tsx - Simplified version

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useServers } from "@/hooks/use-servers";
import { Server, ServerStatus } from "@/types/server";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { ServerHeader } from "@/components/servers/server-header";
import { ServerList } from "@/components/servers/server-list";
import { Pagination } from "@/components/ui/pagination";

export default function ServersPage() {
  const {
    servers,
    loading,
    error,
    totalServers,
    totalPages,
    currentPage,
    pageSize,
    searchServers,
  } = useServers();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status"); // Default filter value

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchServers(
        searchTerm,
        status === "status" ? undefined : status,
        1,
        pageSize
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, status, pageSize, searchServers]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    searchServers(
      searchTerm,
      status === "status" ? undefined : status,
      currentPage,
      pageSize
    );
  }, [searchServers, currentPage, pageSize, searchTerm, status]);

  const handlePageChange = useCallback(
    (page: number) => {
      searchServers(
        searchTerm,
        status === "status" ? undefined : status,
        page,
        pageSize
      );
    },
    [searchServers, searchTerm, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      searchServers(
        searchTerm,
        status === "status" ? undefined : status,
        1,
        newPageSize
      );
    },
    [searchServers, searchTerm, status]
  );

  const handleUploadServers = useCallback(() => {
    // TODO: Implement upload servers functionality
    toast.info("Chức năng upload server sẽ được triển khai sau");
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    // TODO: Implement download template functionality
    toast.info("Chức năng download template sẽ được triển khai sau");
  }, []);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header with Upload/Download buttons */}
      <ServerHeader
        onUploadServers={handleUploadServers}
        onDownloadTemplate={handleDownloadTemplate}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Filter Bar */}
      <Card className="p-4">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [
                { value: "status", label: "Tất cả trạng thái" },
                { value: ServerStatus.ONLINE, label: "Online" },
                { value: ServerStatus.OFFLINE, label: "Offline" },
                { value: ServerStatus.MAINTENANCE, label: "Bảo trì" },
                { value: ServerStatus.ERROR, label: "Lỗi" },
                { value: ServerStatus.UNKNOWN, label: "Không xác định" },
              ],
              placeholder: "Trạng thái",
              widthClass: "w-36",
            },
          ]}
        />
      </Card>

      {/* Server List */}
      <ServerList servers={servers} loading={loading} error={error} />

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage} // Sử dụng 1-based indexing
          totalPages={totalPages}
          totalElements={totalServers}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showInfo={true}
          showPageSizeSelector={true}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}

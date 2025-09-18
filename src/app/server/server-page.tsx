import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useServers } from "@/hooks/server/use-servers";
import { Server } from "@/types/server";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { ServerList } from "@/components/servers/index/server-list";
import { ServerFormDialog } from "@/components/servers/form-dialog/server-form-dialog";
import { ServerDeleteDialog } from "@/components/servers/form-dialog/server-delete-dialog";
import { ServerViewDialog } from "@/components/servers/form-dialog/server-view-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ServerHeader } from "@/components/servers/index/server-header";

export default function ServersPage() {
  const { t } = useTranslation("server");

  const {
    servers,
    loading,
    error,
    totalServers,
    totalPages,
    currentPage,
    pageSize,
    searchServers,
    updateServer,
    deleteServer,
    getServerById,
  } = useServers();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(""); // Keyword thực sự dùng để search
  const [status, setStatus] = useState("status");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);
  const [viewingServer, setViewingServer] = useState<Server | null>(null);

  // Initial data load
  useEffect(() => {
    searchServers("", status === "status" ? undefined : status, 1, pageSize);
  }, [searchServers, pageSize]);

  // Effect khi searchKeyword hoặc status thay đổi
  useEffect(() => {
    searchServers(
      searchKeyword,
      status === "status" ? undefined : status,
      1,
      pageSize
    );
  }, [searchKeyword, status, pageSize, searchServers]);

  const navigate = useNavigate();

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    // KHÔNG tự động search gì cả, chỉ update UI
  }, []);

  // Xử lý khi nhấn Enter
  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = searchTerm.trim();
    setSearchKeyword(trimmedSearch);
  }, [searchTerm]);

  // Xử lý khi clear search
  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword(""); // Reset về rỗng để fetch lại all data
  }, []);

  const handleRefresh = useCallback(() => {
    searchServers(
      searchKeyword,
      status === "status" ? undefined : status,
      currentPage,
      pageSize
    );
  }, [searchServers, currentPage, pageSize, searchKeyword, status]);

  const handlePageChange = useCallback(
    (page: number) => {
      searchServers(
        searchKeyword,
        status === "status" ? undefined : status,
        page,
        pageSize
      );
    },
    [searchServers, searchKeyword, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      searchServers(
        searchKeyword,
        status === "status" ? undefined : status,
        1,
        newPageSize
      );
    },
    [searchServers, searchKeyword, status]
  );

  // Dialog event handlers
  const handleViewServer = useCallback((server: Server) => {
    setViewingServer(server);
    setViewDialogOpen(true);
  }, []);

  const handleEditServer = useCallback((server: Server) => {
    setEditingServer(server);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteServer = useCallback((server: Server) => {
    setDeletingServer(server);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormDialogClose = useCallback(() => {
    setFormDialogOpen(false);
    setEditingServer(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingServer(null);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      toast.success(message);
      handleRefresh();
    },
    [handleRefresh]
  );

  const handleDeleteSuccess = useCallback(
    (message: string) => {
      toast.success(message);
      handleRefresh();
    },
    [handleRefresh]
  );

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      await deleteServer(id);
    },
    [deleteServer]
  );

  const handleViewHardeningHistory = useCallback(
    (server: Server) => {
      navigate(`/${encodeURIComponent(server.ip_address)}/hardening-history`);
    },
    [navigate]
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full px-6 space-y-6">
      <ServerHeader onRefresh={handleRefresh} loading={loading} />

      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [
                { value: "status", label: t("serverPage.filter.allStatuses") },
                { value: "true", label: t("serverPage.filter.active") },
                { value: "false", label: t("serverPage.filter.inactive") },
              ],
              placeholder: t("serverPage.filter.statusPlaceholder"),
              widthClass: "w-36",
            },
          ]}
          placeholder={t("serverPage.filter.searchPlaceholder")}
        />
      </Card>

      <ServerList
        key={`server-list-${Date.now()}`}
        servers={servers}
        loading={loading}
        error={error}
        onView={handleViewServer}
        onEdit={handleEditServer}
        onDelete={handleDeleteServer}
        onViewHardeningHistory={handleViewHardeningHistory}
      />

      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
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

      {/* View Dialog - Chỉ cần quyền user */}
      <ServerViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        server={viewingServer}
        getServerById={getServerById}
      />

      {/* Edit Dialog - Chỉ admin (đã có phân quyền trong ServerList) */}
      <ServerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingServer={editingServer}
        updateServer={updateServer}
        getServerById={getServerById}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog - Chỉ admin (đã có phân quyền trong ServerList) */}
      <ServerDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        server={deletingServer}
        onConfirm={handleConfirmDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

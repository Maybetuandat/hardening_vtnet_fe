import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useServers } from "@/hooks/server/use-servers";
import { Server } from "@/types/server";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { ServerHeader } from "@/components/servers/server-header";
import { ServerList } from "@/components/servers/server-list";
import { ServerFormDialog } from "@/components/servers/server-form-dialog";
import { ServerDeleteDialog } from "@/components/servers/server-delete-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";

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
    updateServer,
    deleteServer,
    getServerById,
  } = useServers();

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);

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

  const navigate = useNavigate();
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

  // Dialog event handlers
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
          onSearchChange={setSearchTerm}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [
                { value: "status", label: "Tất cả trạng thái" },
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Không hoạt động" },
              ],
              placeholder: "Trạng thái",
              widthClass: "w-36",
            },
          ]}
          placeholder="Tìm kiếm theo địa chỉ IP hoặc hostname"
        />
      </Card>

      <ServerList
        key={`server-list-${Date.now()}`}
        servers={servers}
        loading={loading}
        error={error}
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
      
      <ServerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingServer={editingServer}
        updateServer={updateServer}
        getServerById={getServerById}
        onSuccess={handleFormSuccess}
      />
      
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
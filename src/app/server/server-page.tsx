import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useServers } from "@/hooks/use-servers";
import { Server } from "@/types/server";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { ServerHeader } from "@/components/servers/server-header";
import { ServerList } from "@/components/servers/server-list";
import { ServerFormDialog } from "@/components/servers/server-form-dialog";
import { ServerDeleteDialog } from "@/components/servers/server-delete-dialog";
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

    updateServer,
    deleteServer,
    getServerById,
  } = useServers();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status"); // Default filter value

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);

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
      handleRefresh(); // Refresh the list after successful operation
    },
    [handleRefresh]
  );

  const handleDeleteSuccess = useCallback(
    (message: string) => {
      toast.success(message);
      handleRefresh(); // Refresh the list after successful deletion
    },
    [handleRefresh]
  );

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      await deleteServer(id);
    },
    [deleteServer]
  );

  const handleViewHardeningHistory = useCallback((server: Server) => {
    // TODO: Implement view hardening history functionality
    toast.info(`Xem lịch sử hardening cho server: ${server.hostname}`);
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
      <ServerHeader onRefresh={handleRefresh} loading={loading} />

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
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Không hoạt động" },
              ],
              placeholder: "Trạng thái",
              widthClass: "w-36",
            },
          ]}
        />
      </Card>

      {/* Server List */}
      <ServerList
        key={`server-list-${Date.now()}`}
        servers={servers}
        loading={loading}
        error={error}
        onEdit={handleEditServer}
        onDelete={handleDeleteServer}
        onViewHardeningHistory={handleViewHardeningHistory}
      />

      {/* Pagination */}
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

      {/* Form Dialog for Create/Edit */}
      <ServerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingServer={editingServer}
        updateServer={updateServer}
        getServerById={getServerById}
        onSuccess={handleFormSuccess}
      />

      {/* Form Dialog for Create/Edit */}
      <ServerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingServer={editingServer}
        updateServer={updateServer}
        getServerById={getServerById}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
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

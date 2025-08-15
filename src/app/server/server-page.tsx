// src/app/server/servers-page.tsx
import { useState, useCallback, useMemo } from "react";
import ServerHeader from "@/components/servers/server-header";
import FilterBar from "@/components/ui/filter-bar";
import { useServers } from "@/hooks/use-servers";
import { ServerList } from "@/components/servers/server-list";
import { ServerFormDialog } from "@/components/servers/server-form-dialog";
import { ServerDeleteDialog } from "@/components/servers/server-delete-dialog";
import {
  Server,
  ServerEnvironment,
  ServerStatus,
  ServerOSType,
} from "@/types/server";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function ServersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status");
  const [environment, setEnvironment] = useState("environment");
  const [osType, setOSType] = useState<ServerOSType | "all">("all");

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);

  const { t } = useTranslation("server");

  const {
    servers,
    loading,
    error,
    fetchServers,
    createServer,
    updateServer,
    deleteServer,
    getServerById,
  } = useServers();

  // Filter servers
  const filteredServers = useMemo(() => {
    if (!servers || !Array.isArray(servers)) {
      return [];
    }

    return servers.filter((server) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.ip_address.includes(searchTerm) ||
        server.server_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.os_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = status === "status" || server.status === status;

      const matchesEnvironment =
        environment === "environment" || server.environment === environment;

      const matchesOSType = osType === "all" || server.os_type === osType;

      return (
        matchesSearch && matchesStatus && matchesEnvironment && matchesOSType
      );
    });
  }, [servers, searchTerm, status, environment, osType]);

  // Calculate stats
  const totalServers = servers?.length || 0;
  const activeServers =
    servers?.filter((server) => server.is_active).length || 0;

  // Event handlers
  const handleAddServer = useCallback(() => {
    setEditingServer(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((server: Server) => {
    setEditingServer(server);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((server: Server) => {
    setDeletingServer(server);
    setDeleteDialogOpen(true);
  }, []);

  const handleViewHardeningHistory = useCallback((server: Server) => {
    // TODO: Implement hardening history view
    toast.info(`Xem lịch sử hardening cho server: ${server.name}`);
    console.log("View hardening history for server:", server);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchServers();
  }, [fetchServers]);

  const handleFormDialogClose = useCallback(() => {
    setFormDialogOpen(false);
    setEditingServer(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingServer(null);
  }, []);

  const handleOperationSuccess = useCallback(() => {
    toast.success("Thao tác thành công!");
    fetchServers();
  }, [fetchServers]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ServerHeader
        onAddServer={handleAddServer}
        onRefresh={handleRefresh}
        loading={loading}
        totalServers={totalServers}
        activeServers={activeServers}
      />

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
          {
            value: environment,
            onChange: setEnvironment,
            options: [
              { value: "environment", label: "Tất cả môi trường" },
              { value: ServerEnvironment.PRODUCTION, label: "Production" },
              { value: ServerEnvironment.STAGING, label: "Staging" },
              { value: ServerEnvironment.DEVELOPMENT, label: "Development" },
              { value: ServerEnvironment.TESTING, label: "Testing" },
            ],
            placeholder: "Môi trường",
            widthClass: "w-36",
          },
          {
            value: osType,
            onChange: (value) => setOSType(value as ServerOSType | "all"),
            options: [
              { value: "all", label: "Tất cả OS" },
              { value: ServerOSType.LINUX, label: "Linux" },
              { value: ServerOSType.WINDOWS, label: "Windows" },
              { value: ServerOSType.UNIX, label: "Unix" },
              { value: ServerOSType.MACOS, label: "MacOS" },
            ],
            placeholder: "Hệ điều hành",
            widthClass: "w-32",
          },
        ]}
      />

      <ServerList
        key={`server-list-${servers.length}-${Date.now()}`}
        servers={filteredServers}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewHardeningHistory={handleViewHardeningHistory}
      />

      {/* Server Form Dialog */}
      <ServerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingServer={editingServer}
        createServer={createServer}
        updateServer={updateServer}
        getServerById={getServerById}
        onSuccess={handleOperationSuccess}
      />

      {/* Server Delete Dialog */}
      <ServerDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        server={deletingServer}
        onConfirm={deleteServer}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}

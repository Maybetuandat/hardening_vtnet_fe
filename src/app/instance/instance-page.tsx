import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useInstances } from "@/hooks/instance/use-instance";

import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";

import { InstanceList } from "@/components/instances/index/instance-list";

import { InstanceViewDialog } from "@/components/instances/form-dialog/instance-view-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import toastHelper from "@/utils/toast-helper";
import { Instance } from "@/types/instance";
import { InstanceHeader } from "@/components/instances/index/instance-header";

export default function ServersPage() {
  const { t } = useTranslation("instance");

  const {
    instances,
    loading,
    error,
    totalInstances,
    totalPages,
    currentPage,
    pageSize,
    searchInstances,
    updateInstance,
    deleteInstance,
    getInstanceById,
    syncFromDCIM,
  } = useInstances();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("status");
  const [syncing, setSyncing] = useState(false);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Instance | null>(null);
  const [deletingServer, setDeletingServer] = useState<Instance | null>(null);
  const [viewingServer, setViewingServer] = useState<Instance | null>(null);

  useEffect(() => {
    searchInstances("", status === "status" ? undefined : status, 1, pageSize);
  }, [searchInstances, pageSize]);

  useEffect(() => {
    searchInstances(
      searchKeyword,
      status === "status" ? undefined : status,
      1,
      pageSize
    );
  }, [searchKeyword, status, pageSize, searchInstances]);

  const navigate = useNavigate();

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = searchTerm.trim();
    setSearchKeyword(trimmedSearch);
  }, [searchTerm]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchKeyword("");
  }, []);

  const handleRefresh = useCallback(() => {
    searchInstances(
      searchKeyword,
      status === "status" ? undefined : status,
      currentPage,
      pageSize
    );
    toastHelper.success(
      t("instancePage.refreshSuccess") || "Refreshed successfully"
    );
  }, [searchInstances, searchKeyword, status, currentPage, pageSize, t]);

  const handleSyncDCIM = useCallback(async () => {
    setSyncing(true);
    try {
      await syncFromDCIM();

      toastHelper.success(t("dcimSync.successMessage"));

      await searchInstances(
        searchKeyword,
        status === "status" ? undefined : status,
        currentPage,
        pageSize
      );
    } catch (error) {
      console.error("Sync DCIM error:", error);
      toastHelper.error(
        error instanceof Error ? error.message : t("dcimSync.errorMessage")
      );
    } finally {
      setSyncing(false);
    }
  }, [
    syncFromDCIM,
    searchInstances,
    searchKeyword,
    status,
    currentPage,
    pageSize,
    t,
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      searchInstances(
        searchKeyword,
        status === "status" ? undefined : status,
        page,
        pageSize
      );
    },
    [searchInstances, searchKeyword, status, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      searchInstances(
        searchKeyword,
        status === "status" ? undefined : status,
        1,
        newPageSize
      );
    },
    [searchInstances, searchKeyword, status]
  );

  const handleViewServer = useCallback((instance: Instance) => {
    setViewingServer(instance);
    setViewDialogOpen(true);
  }, []);

  const handleEditServer = useCallback((instance: Instance) => {
    setEditingServer(instance);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteServer = useCallback((instance: Instance) => {
    setDeletingServer(instance);
    setDeleteDialogOpen(true);
  }, []);

  const handleViewHardeningHistory = useCallback(
    (instance: Instance) => {
      navigate(`/${encodeURIComponent(instance.name)}/hardening-history`);
    },
    [navigate]
  );

  useEffect(() => {
    if (error) {
      toastHelper.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full px-6 space-y-6 mb-10">
      <InstanceHeader
        onRefresh={handleRefresh}
        onSyncDCIM={handleSyncDCIM}
        loading={loading}
        syncing={syncing}
      />

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
                {
                  value: "status",
                  label: t("instancePage.filter.allStatuses"),
                },
                { value: "true", label: t("instancePage.filter.active") },
                { value: "false", label: t("instancePage.filter.inactive") },
              ],
              placeholder: t("instancePage.filter.statusPlaceholder"),
              widthClass: "w-36",
            },
          ]}
          placeholder={t("instancePage.filter.searchPlaceholder")}
        />
      </Card>

      <InstanceList
        key={`instance-list-${Date.now()}`}
        instances={instances}
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
          totalElements={totalInstances}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showInfo={true}
          showPageSizeSelector={true}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      <InstanceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        instance={viewingServer}
        getInstanceById={getInstanceById}
      />
    </div>
  );
}

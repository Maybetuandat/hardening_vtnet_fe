import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";

import FilterBar from "@/components/ui/filter-bar";
import { useWorkloads } from "@/hooks/use-workloads";
import { Workload, WorkloadType } from "@/types/workload";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { WorkloadDeleteDialog } from "@/components/work-loads/workload-delete-dialog";

import WorkloadHeader from "@/components/work-loads/workload-header";
import { WorkloadList } from "@/components/work-loads/workload-list";

export default function WorkloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("status");
  const [workloadType, setWorkloadType] = useState<WorkloadType | "all">("all");

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingWorkload, setEditingWorkload] = useState<Workload | null>(null);
  const [deletingWorkload, setDeletingWorkload] = useState<Workload | null>(
    null
  );

  const { t } = useTranslation("workload");

  const {
    workloads,
    loading,
    error,
    fetchWorkloads,
    createWorkload,
    updateWorkload,
    deleteWorkload,
    getNumberOfServersByWorkload,
  } = useWorkloads();

  // Filter workloads
  const filteredWorkloads = useMemo(() => {
    if (!workloads || !Array.isArray(workloads)) {
      return [];
    }

    return workloads.filter((workload) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        workload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workload.display_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workload.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        status === "status" ||
        (status === "active" && workload.is_active) ||
        (status === "inactive" && !workload.is_active);

      const matchesType =
        workloadType === "all" || workload.workload_type === workloadType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [workloads, searchTerm, status, workloadType]);

  // Event handlers
  const handleAdd = useCallback(() => {
    setEditingWorkload(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((workload: Workload) => {
    setEditingWorkload(workload);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((workload: Workload) => {
    setDeletingWorkload(workload);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormDialogClose = useCallback(() => {
    setFormDialogOpen(false);
    setEditingWorkload(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingWorkload(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log("Manual refresh triggered");
    try {
      await fetchWorkloads();
      toast.success(t("workloads.refreshed"));
    } catch (error) {
      console.error("Error during manual refresh:", error);
    }
  }, [fetchWorkloads, t]);

  const handleOperationSuccess = useCallback(async () => {
    console.log("Operation successful, refreshing data...");

    try {
      // Reset dialog states BEFORE refresh
      setFormDialogOpen(false);
      setDeleteDialogOpen(false);
      setEditingWorkload(null);
      setDeletingWorkload(null);

      // Refresh data
      await fetchWorkloads();
    } catch (error) {
      console.error("Error during success refresh:", error);
    }
  }, [fetchWorkloads]);

  return (
    <div className="min-h-screen w-full px-4 lg:px-6 py-6 space-y-6">
      <WorkloadHeader
        onAdd={handleAdd}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            value: status,
            onChange: setStatus,
            options: [
              { value: "status", label: t("workloads.status") },
              { value: "active", label: t("workloads.active") },
              { value: "inactive", label: t("workloads.inactive") },
            ],
            placeholder: t("workloads.status"),
            widthClass: "w-32",
          },
          {
            value: workloadType,
            onChange: (value) => setWorkloadType(value as WorkloadType | "all"),
            options: [
              { value: "all", label: t("workloads.all") },
              { value: WorkloadType.OS, label: "Operating System" },
              { value: WorkloadType.DATABASE, label: "Database" },
              { value: WorkloadType.BIG_DATA, label: "Big Data" },
              { value: WorkloadType.APP, label: "Application" },
            ],
            placeholder: "Workload Type",
            widthClass: "w-40",
          },
        ]}
      />

      <WorkloadList
        workloads={filteredWorkloads}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={handleRefresh}
        getNumberOfServersByWorkload={getNumberOfServersByWorkload}
      />

      <WorkloadDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        workload={deletingWorkload}
        onConfirm={deleteWorkload}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}

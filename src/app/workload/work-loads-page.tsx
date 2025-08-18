// src/app/workload/work-loads-page.tsx
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

  // Handle edit workload
  const handleEditWorkload = useCallback((workload: Workload) => {
    setEditingWorkload(workload);
    // Note: In the original implementation, this would open a form dialog
    // For now, we'll just show a toast since we're focusing on the add functionality
    toast.info("Edit functionality will be implemented separately");
  }, []);

  // Handle delete workload
  const handleDeleteWorkload = useCallback((workload: Workload) => {
    setDeletingWorkload(workload);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      await deleteWorkload(id);
    },
    [deleteWorkload]
  );

  const handleDeleteSuccess = useCallback(() => {
    setDeletingWorkload(null);
    setDeleteDialogOpen(false);
    toast.success(t("workloads.workloadDeleted"));
    fetchWorkloads();
  }, [fetchWorkloads, t]);

  const handleRefresh = useCallback(() => {
    fetchWorkloads();
    toast.success(t("workloads.refreshed"));
  }, [fetchWorkloads, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkloadHeader onRefresh={handleRefresh} loading={loading} />

      {/* Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              value: status,
              onChange: setStatus,
              placeholder: t("workloads.status"),
              options: [
                { value: "status", label: t("workloads.status") },
                { value: "active", label: t("workloads.active") },
                { value: "inactive", label: t("workloads.inactive") },
                { value: "all", label: t("workloads.all") },
              ],
              widthClass: "w-32",
            },
            {
              value: workloadType,
              onChange: (value: string) =>
                setWorkloadType(value as WorkloadType | "all"),
              placeholder: "Workload Type",
              options: [
                { value: "all", label: t("workloads.all") },
                { value: WorkloadType.OS, label: "OS" },
                { value: WorkloadType.DATABASE, label: "Database" },
                { value: WorkloadType.APP, label: "Application" },
                { value: WorkloadType.BIG_DATA, label: "Big Data" },
              ],
              widthClass: "w-40",
            },
          ]}
        />
      </Card>

      {/* Workload List */}
      <WorkloadList
        workloads={filteredWorkloads}
        loading={loading}
        error={error}
        onEdit={handleEditWorkload}
        onDelete={handleDeleteWorkload}
        onRetry={handleRefresh}
        getNumberOfServersByWorkload={getNumberOfServersByWorkload}
      />

      {/* Delete Dialog */}
      <WorkloadDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingWorkload(null);
        }}
        workload={deletingWorkload}
        onConfirm={handleConfirmDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

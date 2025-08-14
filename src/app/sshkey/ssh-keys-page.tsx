import { useState, useCallback } from "react";
import HeaderSshKeyManagement from "@/components/ssh-keys/ssh-key-header";
import { SshKeyDeleteDialog } from "@/components/ssh-keys/ssh-key-delete-dialog";
import FilterBar from "@/components/ui/filter-bar";
import { useSshKeys } from "@/hooks/use-ssh-keys";
import { SshKeyFormDialog } from "@/components/ssh-keys/ssh-key-form-dialog";
import { SshKeyList } from "@/components/ssh-keys/ssh-key-list";
import { SshKey, SshKeyType } from "@/types/ssh-key";
import React from "react";
import { useTranslation } from "react-i18next";

export default function SshKeyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation("sshkey");
  const [status, setStatus] = useState("status");
  const [sshKeyType, setSshKeyType] = useState<SshKeyType | "all">("all");

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSshKey, setEditingSshKey] = useState<SshKey | null>(null);
  const [deletingSshKey, setDeletingSshKey] = useState<SshKey | null>(null);

  const {
    sshKeys,
    loading,
    error,
    fetchSshKeys,
    createSshKey,
    updateSshKey,
    deleteSshKey,
    getSshKeyById,
  } = useSshKeys();

  const filteredSshKeys = React.useMemo(() => {
    if (!sshKeys || !Array.isArray(sshKeys)) {
      return [];
    }

    return sshKeys.filter((sshKey) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        sshKey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sshKey.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        status === "status" ||
        (status === "active" && sshKey.is_active) ||
        (status === "inactive" && !sshKey.is_active);

      const matchesType =
        sshKeyType === "all" || sshKey.key_type === sshKeyType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sshKeys, searchTerm, status, sshKeyType]);

  const handleAdd = useCallback(() => {
    setEditingSshKey(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((sshKey: SshKey) => {
    setEditingSshKey(sshKey);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((sshKey: SshKey) => {
    setDeletingSshKey(sshKey);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormDialogClose = useCallback(() => {
    setFormDialogOpen(false);
    setEditingSshKey(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingSshKey(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log("Manual refresh triggered");
    try {
      await fetchSshKeys();
    } catch (error) {
      console.error(" Error during manual refresh:", error);
    }
  }, [fetchSshKeys]);

  //  FIX: Improved success handler
  const handleOperationSuccess = useCallback(async () => {
    console.log("Operation successful, refreshing data...");

    try {
      // Reset dialog states TRƯỚC khi refresh
      setFormDialogOpen(false);
      setDeleteDialogOpen(false);
      setEditingSshKey(null);
      setDeletingSshKey(null);

      // Refresh data
      await fetchSshKeys();
    } catch (error) {
      console.error(" Error during success refresh:", error);
    }
  }, [fetchSshKeys]);

  return (
    <div className="min-h-screen w-full px-4 lg:px-6 py-6 space-y-6">
      <HeaderSshKeyManagement
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
              { value: "status", label: t("sshKeys.status") },
              { value: "active", label: t("sshKeys.active") },
              { value: "inactive", label: t("sshKeys.inactive") },
            ],
            placeholder: t("sshKeys.status"),
            widthClass: "w-32",
          },
          {
            value: sshKeyType,
            onChange: (value) => setSshKeyType(value as SshKeyType),
            options: [
              { value: "all", label: t("sshKeys.all") },
              { value: SshKeyType.RSA, label: "RSA" },
              { value: SshKeyType.ED25519, label: "Ed25519" },
              { value: SshKeyType.ECDSA, label: "ECDSA" },
              { value: SshKeyType.DSA, label: "DSA" },
            ],
            placeholder: "SSH Key Type",
            widthClass: "w-32",
          },
        ]}
      />

      <SshKeyList
        key={`ssh-list-${sshKeys.length}-${Date.now()}`}
        sshKeys={filteredSshKeys}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SshKeyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onClose={handleFormDialogClose}
        editingSshKey={editingSshKey}
        createSshKey={createSshKey}
        updateSshKey={updateSshKey}
        getSshKeyById={getSshKeyById}
        onSuccess={handleOperationSuccess}
      />

      <SshKeyDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        sshKey={deletingSshKey}
        onConfirm={deleteSshKey}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}

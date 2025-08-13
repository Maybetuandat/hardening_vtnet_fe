import { useState } from "react";
import HeaderSshKeyManagement from "@/components/ssh-keys/ssh-key-header";

import { SshKeyDeleteDialog } from "@/components/ssh-keys/ssh-key-delete-dialog";
import FilterBar from "@/components/ui/filter-bar";

import { useSshKeys } from "@/hooks/use-ssh-keys";
import { SshKeyFormDialog } from "@/components/ssh-keys/ssh-key-form-dialog";
import { SshKeyList } from "@/components/ssh-keys/ssh-key-list";
import { SshKey, SshKeyType } from "@/types/ssh-key";
import React from "react";

export default function SshKeyPage() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter logic - Add safety check for sshKeys
  const filteredSshKeys = React.useMemo(() => {
    if (!sshKeys || !Array.isArray(sshKeys)) {
      return [];
    }

    return sshKeys.filter((sshKey) => {
      // Search filter - nếu searchTerm rỗng thì bỏ qua filter này
      const matchesSearch =
        searchTerm.trim() === "" ||
        sshKey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sshKey.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter - nếu status là "all" thì bỏ qua filter này
      const matchesStatus =
        status === "status" ||
        (status === "active" && sshKey.is_active) ||
        (status === "inactive" && !sshKey.is_active);

      // Type filter - nếu sshKeyType là "all" thì bỏ qua filter này
      const matchesType =
        sshKeyType === "all" || sshKey.key_type === sshKeyType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sshKeys, searchTerm, status, sshKeyType]);

  // Handlers
  const handleAdd = () => {
    setEditingSshKey(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (sshKey: SshKey) => {
    setEditingSshKey(sshKey);
    setFormDialogOpen(true);
  };

  const handleDelete = (sshKey: SshKey) => {
    setDeletingSshKey(sshKey);
    setDeleteDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
    setEditingSshKey(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingSshKey(null);
  };

  const handleRefresh = () => {
    fetchSshKeys();
  };

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
              { value: "status", label: "Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            placeholder: "Status",
            widthClass: "w-32",
          },
          {
            value: sshKeyType,
            onChange: (value) => setSshKeyType(value as SshKeyType),
            options: [
              { value: "all", label: "All" },
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
        onSuccess={handleRefresh}
      />

      <SshKeyDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        sshKey={deletingSshKey}
        onConfirm={deleteSshKey}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

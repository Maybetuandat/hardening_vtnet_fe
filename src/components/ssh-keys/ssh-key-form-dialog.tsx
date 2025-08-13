import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";
import { useSshKeyForm } from "@/hooks/use-ssh-key-form";
import { toast } from "sonner";

interface SshKeyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingSshKey: SshKey | null;
  createSshKey: (data: SshKeyCreate) => Promise<void>;
  updateSshKey: (id: number, data: SshKeyUpdate) => Promise<void>;
  getSshKeyById: (id: number) => Promise<SshKey>;
  onSuccess: () => void;
}

export function SshKeyFormDialog({
  open,
  onOpenChange,
  onClose,
  editingSshKey,
  createSshKey,
  updateSshKey,
  getSshKeyById,
  onSuccess,
}: SshKeyFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    updateField,
  } = useSshKeyForm();

  // Load SSH key data when editing
  useEffect(() => {
    if (open && editingSshKey) {
      const loadSshKey = async () => {
        setInitialLoading(true);
        try {
          const sshKey = await getSshKeyById(editingSshKey.id);
          setFormData({
            name: sshKey.name,
            description: sshKey.description || "",
            key_type: sshKey.key_type,
            public_key: sshKey.public_key,
            private_key: "", // Don't populate private key for security
            is_active: sshKey.is_active,
          });
        } catch (err) {
          toast.error("Failed to load SSH key");
          onClose();
        } finally {
          setInitialLoading(false);
        }
      };
      loadSshKey();
    } else if (open && !editingSshKey) {
      resetForm();
    }
  }, [open, editingSshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      if (editingSshKey) {
        const updateData: SshKeyUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        };

        // Only include keys if they're provided
        if (formData.public_key) {
          updateData.public_key = formData.public_key;
        }
        if (formData.private_key) {
          updateData.private_key = formData.private_key;
        }
        if (formData.key_type) {
          updateData.key_type = formData.key_type;
        }

        await updateSshKey(editingSshKey.id, updateData);
        toast.success("SSH key updated successfully");
      } else {
        const createData: SshKeyCreate = {
          name: formData.name,
          description: formData.description || undefined,
          key_type: formData.key_type,
          public_key: formData.public_key,
          private_key: formData.private_key,
        };

        await createSshKey(createData);
        toast.success("SSH key created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        editingSshKey ? "Failed to update SSH key" : "Failed to create SSH key"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSshKey ? "Edit SSH Key" : "Create SSH Key"}
          </DialogTitle>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <SshKeyForm
            formData={formData}
            errors={errors}
            loading={loading}
            onSubmit={handleSubmit}
            onFieldChange={updateField}
            onCancel={handleCancel}
            isEdit={!!editingSshKey}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

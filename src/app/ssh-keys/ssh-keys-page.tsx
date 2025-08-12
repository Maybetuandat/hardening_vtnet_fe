// src/app/ssh-keys/ssh-keys-page.tsx  
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useSshKeys } from '@/hooks/use-ssh-keys';
import { useSshKeyForm } from '@/hooks/use-ssh-key-form';
import { SshKey, SshKeyCreate, SshKeyUpdate } from '@/types/ssh-key';
import { SshKeyDeleteDialog } from '@/components/ssh-keys/ssh-key-delete-dialog';
import { SshKeyForm } from '@/components/ssh-keys/ssh-key-form';
import { SshKeyList } from '@/components/ssh-keys/ssh-key-list';

type ViewMode = 'list' | 'create' | 'edit';

export default function SshKeysPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get view mode from URL params
  const viewMode = (searchParams.get('mode') as ViewMode) || 'list';
  const editId = searchParams.get('edit');

  // SSH Keys API hook
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

  // Form hook
  const {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    updateField,
  } = useSshKeyForm();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sshKeyToDelete, setSshKeyToDelete] = React.useState<SshKey | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Simple dialog close handler (chỉ fix vấn đề delete dialog)
  const handleDialogClose = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      // Cleanup khi đóng
      setSshKeyToDelete(null);
      setDeleteLoading(false);
      
      // Chỉ cleanup overlay của dialog nếu cần
      setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-focus-scope]');
        overlays.forEach(overlay => {
          const openDialog = overlay.querySelector('[data-state="open"]');
          if (!openDialog) {
            overlay.remove();
          }
        });
        
        // Reset pointer events nếu bị block
        document.body.style.pointerEvents = 'auto';
      }, 150);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sshKeyToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteSshKey(sshKeyToDelete.id);
      toast.success('SSH key deleted successfully');
      setDeleteDialogOpen(false);
      setSshKeyToDelete(null);
      // Refresh danh sách
      fetchSshKeys();
    } catch (err) {
      toast.error('Failed to delete SSH key');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Load SSH key data when editing - FIX INFINITE LOOP
  React.useEffect(() => {
    if (viewMode === 'edit' && editId) {
      const loadSshKey = async () => {
        try {
          const sshKey = await getSshKeyById(parseInt(editId));
          setFormData({
            name: sshKey.name,
            description: sshKey.description || '',
            key_type: sshKey.key_type,
            public_key: sshKey.public_key,
            private_key: '', // Don't populate private key for security
            is_active: sshKey.is_active,
          });
        } catch (err) {
          toast.error('Failed to load SSH key');
          setViewMode('list');
        }
      };
      loadSshKey();
    }
  }, [viewMode, editId]); // ✅ Chỉ depend vào viewMode và editId

  // Simple cleanup on unmount (không ảnh hưởng đến form)
  React.useEffect(() => {
    return () => {
      setDeleteDialogOpen(false);
      setSshKeyToDelete(null);
      setDeleteLoading(false);
    };
  }, []);

  // Navigation helpers
  const setViewMode = (mode: ViewMode, id?: number) => {
    const params = new URLSearchParams();
    if (mode !== 'list') {
      params.set('mode', mode);
      if (id && mode === 'edit') {
        params.set('edit', id.toString());
      }
    }
    setSearchParams(params);
  };

  const handleAdd = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (sshKey: SshKey) => {
    setViewMode('edit', sshKey.id);
  };

  const handleCancel = () => {
    resetForm();
    setViewMode('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      if (viewMode === 'create') {
        const createData: SshKeyCreate = {
          name: formData.name,
          description: formData.description || undefined,
          key_type: formData.key_type,
          public_key: formData.public_key,
          private_key: formData.private_key,
        };
        
        await createSshKey(createData);
        toast.success('SSH key created successfully');
      } else if (viewMode === 'edit' && editId) {
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

        await updateSshKey(parseInt(editId), updateData);
        toast.success('SSH key updated successfully');
      }

      resetForm();
      setViewMode('list');
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDeleteClick = (sshKey: SshKey) => {
    setSshKeyToDelete(sshKey);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchSshKeys();
  };

  return (
    <div className="min-h-screen w-full px-4 lg:px-6 py-6 space-y-6">
      {viewMode === 'list' ? (
        <SshKeyList
          sshKeys={sshKeys}
          loading={loading}
          error={error}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh}
        />
      ) : (
        <SshKeyForm
          key={`${viewMode}-${editId}`}
          formData={formData}
          errors={errors}
          loading={loading}
          onSubmit={handleSubmit}
          onFieldChange={updateField}
          onCancel={handleCancel}
          isEdit={viewMode === 'edit'}
        />
      )}

      <SshKeyDeleteDialog
        sshKey={sshKeyToDelete}
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
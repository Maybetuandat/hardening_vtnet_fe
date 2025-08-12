import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Key } from 'lucide-react';
import { SshKey, SshKeyType } from '@/types/ssh-key';

interface SshKeyDeleteDialogProps {
  sshKey: SshKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export const SshKeyDeleteDialog: React.FC<SshKeyDeleteDialogProps> = ({
  sshKey,
  open,
  onOpenChange,
  onConfirm,
  loading,
}) => {
  const getKeyTypeColor = (type: SshKeyType) => {
    switch (type) {
      case SshKeyType.ED25519:
        return 'bg-green-500';
      case SshKeyType.RSA:
        return 'bg-blue-500';
      case SshKeyType.ECDSA:
        return 'bg-purple-500';
      case SshKeyType.DSA:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!sshKey) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete SSH Key
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this SSH key? This action cannot be undone.
              </p>
              
              {/* SSH Key Info */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sshKey.name}</span>
                  <Badge className={`${getKeyTypeColor(sshKey.key_type)} text-white text-xs`}>
                    {sshKey.key_type.toUpperCase()}
                  </Badge>
                </div>
                
                {sshKey.description && (
                  <p className="text-sm text-muted-foreground pl-6">
                    {sshKey.description}
                  </p>
                )}
                
                <div className="pl-6">
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                    {sshKey.fingerprint}
                  </code>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Any systems or deployments using this SSH key 
                  will lose access. Make sure to update them with a different key before deletion.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Delete SSH Key'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
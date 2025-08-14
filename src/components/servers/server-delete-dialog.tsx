// src/components/servers/server-delete-dialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  Trash2,
  Server as ServerIcon,
  Monitor,
  Network,
  Shield,
} from "lucide-react";
import {
  Server,
  ServerStatus,
  ServerEnvironment,
  ServerOSType,
} from "@/types/server";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ServerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  server: Server | null;
  onConfirm: (id: number) => Promise<void>;
  onSuccess: () => void;
}

export function ServerDeleteDialog({
  open,
  onOpenChange,
  onClose,
  server,
  onConfirm,
  onSuccess,
}: ServerDeleteDialogProps) {
  const { t } = useTranslation("server");
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ONLINE:
        return "bg-green-500 text-white";
      case ServerStatus.OFFLINE:
        return "bg-gray-500 text-white";
      case ServerStatus.MAINTENANCE:
        return "bg-yellow-500 text-white";
      case ServerStatus.ERROR:
        return "bg-red-500 text-white";
      case ServerStatus.UNKNOWN:
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getEnvironmentColor = (environment: ServerEnvironment) => {
    switch (environment) {
      case ServerEnvironment.PRODUCTION:
        return "bg-red-100 text-red-800 border-red-200";
      case ServerEnvironment.STAGING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ServerEnvironment.DEVELOPMENT:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ServerEnvironment.TESTING:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOSIcon = (osType: ServerOSType) => {
    switch (osType) {
      case ServerOSType.LINUX:
        return "🐧";
      case ServerOSType.WINDOWS:
        return "🪟";
      case ServerOSType.UNIX:
        return "📟";
      case ServerOSType.MACOS:
        return "🍎";
      default:
        return "💻";
    }
  };

  const handleDelete = async () => {
    if (!server) return;

    setLoading(true);
    try {
      await onConfirm(server.id);
      toast.success("Server deleted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete server");
    } finally {
      setLoading(false);
    }
  };

  if (!server) return null;

  const isProductionServer =
    server.environment === ServerEnvironment.PRODUCTION;
  const isOnlineServer = server.status === ServerStatus.ONLINE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Server
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            server and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Server Information Card */}
          <div className="border rounded-lg bg-muted/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ServerIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{server.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {server.hostname}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    className={getStatusColor(server.status as ServerStatus)}
                  >
                    {server.status}
                  </Badge>
                  <Badge
                    className={getEnvironmentColor(
                      server.environment as ServerEnvironment
                    )}
                  >
                    {server.environment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Server Details */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Network Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Network className="h-4 w-4" />
                    Network
                  </div>
                  <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                    <div>
                      IP:{" "}
                      <code className="bg-background px-1 rounded">
                        {server.ip_address}
                      </code>
                    </div>
                    {server.ssh_port && (
                      <div>
                        SSH Port:{" "}
                        <code className="bg-background px-1 rounded">
                          {server.ssh_port}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                  <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{getOSIcon(server.os_type as ServerOSType)}</span>
                      <span>{server.os_type}</span>
                      {server.os_name && <span>({server.os_name})</span>}
                    </div>
                    {server.os_version && (
                      <div>Version: {server.os_version}</div>
                    )}
                    {server.cpu_cores && server.memory_gb && (
                      <div>
                        {server.cpu_cores} cores, {server.memory_gb}GB RAM
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Info */}
                {server.compliance_score !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      Security
                    </div>
                    <div className="pl-6 text-sm text-muted-foreground">
                      <div>Compliance: {server.compliance_score}%</div>
                    </div>
                  </div>
                )}

                {/* Role Info */}
                {server.server_role && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ServerIcon className="h-4 w-4" />
                      Role
                    </div>
                    <div className="pl-6 text-sm text-muted-foreground">
                      {server.server_role}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-3">
            {/* Production Warning */}
            {isProductionServer && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  ⚠️ <strong>Production Environment:</strong> This server is in
                  production environment. Deleting it may cause service
                  disruption.
                </AlertDescription>
              </Alert>
            )}

            {/* Online Warning */}
            {isOnlineServer && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  🔴 <strong>Server is Online:</strong> This server is currently
                  online. Consider shutting it down before deletion.
                </AlertDescription>
              </Alert>
            )}

            {/* General Warning */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>This action is irreversible.</strong> All server
                configurations, monitoring data, and hardening history will be
                permanently deleted.
              </AlertDescription>
            </Alert>
          </div>

          {/* Impact Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Server configuration and metadata</li>
              <li>• Security compliance history</li>
              <li>• Hardening audit logs</li>
              <li>• Associated monitoring data</li>
              <li>• SSH key associations (keys themselves will remain)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete Server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

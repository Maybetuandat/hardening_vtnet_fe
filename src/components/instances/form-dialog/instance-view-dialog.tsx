import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Server as ServerIcon,
  Globe,
  Monitor,
  User,
  Key,
  Calendar,
  Copy,
  Check,
  Circle,
  Boxes,
  Shield,
  UserCog,
} from "lucide-react";
import { Instance } from "@/types/instance";
import toastHelper from "@/utils/toast-helper";

interface InstanceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: Instance | null;
  getInstanceById: (id: number) => Promise<Instance>;
}

export const InstanceViewDialog: React.FC<InstanceViewDialogProps> = ({
  open,
  onOpenChange,
  instance,
  getInstanceById,
}) => {
  const { t, i18n } = useTranslation("instance");
  const [serverData, setServerData] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIP, setCopiedIP] = useState(false);

  useEffect(() => {
    if (instance && open) {
      loadInstanceData();
    }
  }, [instance, open]);

  const loadInstanceData = async () => {
    if (!instance) return;

    setLoading(true);
    try {
      const data = await getInstanceById(instance.id);
      setServerData(data);
    } catch (error) {
      console.error("Failed to load server data:", error);
      toastHelper.error(t("instanceViewDialog.toastHelper.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIP = async () => {
    if (!serverData?.name) return;

    try {
      await navigator.clipboard.writeText(serverData.name);
      setCopiedIP(true);
      toastHelper.success(t("instanceViewDialog.toastHelper.copySuccess"));
      setTimeout(() => setCopiedIP(false), 2000);
    } catch (error) {
      toastHelper.error(t("instanceViewDialog.toastHelper.copyError"));
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: boolean) => {
    if (status === true) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-100 text-green-800"
        >
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          {t("instanceList.status.online")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          {t("instanceList.status.offline")}
        </Badge>
      );
    }
  };

  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            {t("instanceViewDialog.title")}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t("instanceViewDialog.loading")}</span>
          </div>
        ) : serverData ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("instanceViewDialog.basicInfo.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.hostname")}
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.ipAddress")}
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-mono">{serverData.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCopyIP}
                      >
                        {copiedIP ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.osVersion")}
                    </label>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-600" />
                      <p className="text-base">
                        {serverData.os_version ||
                          t("instanceViewDialog.basicInfo.unknown")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.status")}
                    </label>
                    <div className="flex items-center">
                      {getStatusBadge(serverData.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.workload")}
                    </label>
                    <div className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-purple-600" />
                      <p className="text-base">
                        {serverData.workload_name ||
                          t("instanceViewDialog.basicInfo.noWorkload")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.basicInfo.manager")}
                    </label>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-orange-600" />
                      <p className="text-base">
                        {serverData.nameofmanager ||
                          t("instanceViewDialog.basicInfo.noManager")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SSH Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("instanceViewDialog.sshConfig.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.sshConfig.port")}
                    </label>
                    <p className="text-base font-mono">
                      {serverData.ssh_port || "22"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.sshConfig.user")}
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <p className="text-base">
                        {serverData.ssh_user ||
                          t("instanceViewDialog.sshConfig.notConfigured")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("instanceViewDialog.sshConfig.password")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-amber-600" />
                    <p className="text-base text-gray-500">
                      {serverData.ssh_password
                        ? "••••••••"
                        : t("instanceViewDialog.sshConfig.notConfigured")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t("instanceViewDialog.metadata.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.metadata.createdDate")}
                    </label>
                    <p className="text-base">
                      {formatDate(serverData.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("instanceViewDialog.metadata.lastUpdated")}
                    </label>
                    <p className="text-base">
                      {formatDate(serverData.updated_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("instanceViewDialog.metadata.serverId")}
                  </label>
                  <p className="text-base font-mono text-gray-500">
                    #{serverData.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {t("instanceViewDialog.errorMessage")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

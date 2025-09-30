import React from "react";
import { Instance } from "@/types/instance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  History,
  Copy,
  Check,
  Eye,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { AdminOnly, UserOnly } from "@/components/auth/role-guard";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import toastHelper from "@/utils/toast-helper";

interface InstanceListProps {
  instances: Instance[];
  loading: boolean;
  error: string | null;
  onEdit?: (instance: Instance) => void;
  onDelete?: (instance: Instance) => void;
  onViewHardeningHistory?: (instance: Instance) => void;
  onView?: (instance: Instance) => void;
}

export const InstanceList: React.FC<InstanceListProps> = ({
  instances,
  loading,
  error,
  onEdit,
  onDelete,
  onViewHardeningHistory,
  onView,
}) => {
  const { t } = useTranslation("instance");
  const { isAdmin } = usePermissions();
  const [copiedIP, setCopiedIP] = React.useState<string | null>(null);

  console.log("Rendering InstanceList with instances:", instances);
  const getStatusBadge = (status?: boolean) => {
    if (status === true) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t("locale"), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyIP = async (ipAddress: string) => {
    try {
      await navigator.clipboard.writeText(ipAddress);
      setCopiedIP(ipAddress);
      toastHelper.success(t("InstanceList.toastHelper.copySuccess"));
      setTimeout(() => {
        setCopiedIP(null);
      }, 2000);
    } catch (error) {
      toastHelper.error(t("InstanceList.toastHelper.copyFail"));
    }
  };

  const handleEdit = (Instance: Instance) => {
    if (onEdit) {
      onEdit(Instance);
    } else {
      toastHelper.info(t("InstanceList.toastHelper.editNotImplemented"));
    }
  };

  const handleDelete = (Instance: Instance) => {
    if (onDelete) {
      onDelete(Instance);
    } else {
      toastHelper.info(t("InstanceList.toastHelper.deleteNotImplemented"));
    }
  };

  const handleView = (Instance: Instance) => {
    if (onView) {
      onView(Instance);
    } else {
      toastHelper.info(t("InstanceList.toastHelper.viewNotImplemented"));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("instanceList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {t("instanceList.loading")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("instanceList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">
                {t("instanceList.errorOccurred")}
              </p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("instanceList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">
                {t("instanceList.noInstancesFound")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("instanceList.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("instanceList.tableHeader.name")}</TableHead>

                <TableHead>{t("instanceList.tableHeader.osVersion")}</TableHead>
                <TableHead>{t("instanceList.tableHeader.workload")}</TableHead>
                <TableHead>{t("instanceList.tableHeader.status")}</TableHead>
                <TableHead>{t("instanceList.tableHeader.createdAt")}</TableHead>
                <TableHead>{t("instanceList.tableHeader.manager")}</TableHead>
                <TableHead className="text-center">
                  {t("instanceList.tableHeader.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{instance.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => handleCopyIP(instance.name)}
                        title={t("instanceList.copyIpTooltip")}
                      >
                        {copiedIP === instance.name ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {instance.os_version || t("instanceList.unknown")}
                  </TableCell>
                  <TableCell>
                    {instance.workload_name || t("instanceList.unknown")}
                  </TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell>{formatDate(instance.created_at)}</TableCell>
                  <TableCell>{instance.nameofmanager}</TableCell>
                  {/* Cột Actions với phân quyền */}
                  <UserOnly>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title={t("instanceList.actionsMenuTooltip")}
                          >
                            <span className="sr-only">
                              {t("instanceList.openActionsMenu")}
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* View - Tất cả user có thể xem */}
                          <DropdownMenuItem
                            onClick={() => handleView(instance)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t("instanceList.action.viewInstance")}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </UserOnly>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

import React from "react";
import { Server } from "@/types/server";
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
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AdminOnly, UserOnly } from "@/components/auth/role-guard";
import { usePermissions } from "@/hooks/authentication/use-permissions";

interface ServerListProps {
  servers: Server[];
  loading: boolean;
  error: string | null;
  onEdit?: (server: Server) => void;
  onDelete?: (server: Server) => void;
  onViewHardeningHistory?: (server: Server) => void;
  onView?: (server: Server) => void;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  loading,
  error,
  onEdit,
  onDelete,
  onViewHardeningHistory,
  onView,
}) => {
  const { t } = useTranslation("server");
  const { isAdmin } = usePermissions();
  const [copiedIP, setCopiedIP] = React.useState<string | null>(null);

  const getStatusBadge = (status?: boolean) => {
    if (status === true) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
        >
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          {t("serverList.status.online")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          {t("serverList.status.offline")}
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
      toast.success(t("serverList.toast.copySuccess"));
      setTimeout(() => {
        setCopiedIP(null);
      }, 2000);
    } catch (error) {
      toast.error(t("serverList.toast.copyFail"));
    }
  };

  const handleEdit = (server: Server) => {
    if (onEdit) {
      onEdit(server);
    } else {
      toast.info(t("serverList.toast.editNotImplemented"));
    }
  };

  const handleDelete = (server: Server) => {
    if (onDelete) {
      onDelete(server);
    } else {
      toast.info(t("serverList.toast.deleteNotImplemented"));
    }
  };

  const handleView = (server: Server) => {
    if (onView) {
      onView(server);
    } else {
      toast.info(t("serverList.toast.viewNotImplemented"));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("serverList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t("serverList.loading")}</p>
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
          <CardTitle>{t("serverList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">
                {t("serverList.errorOccurred")}
              </p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!servers || servers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("serverList.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">
                {t("serverList.noServersFound")}
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
        <CardTitle>{t("serverList.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("serverList.tableHeader.hostname")}</TableHead>
                <TableHead>{t("serverList.tableHeader.ipAddress")}</TableHead>
                <TableHead>{t("serverList.tableHeader.osVersion")}</TableHead>
                <TableHead>{t("serverList.tableHeader.workload")}</TableHead>
                <TableHead>{t("serverList.tableHeader.status")}</TableHead>
                <TableHead>{t("serverList.tableHeader.createdAt")}</TableHead>
                {/* Chỉ hiển thị cột Actions cho user có quyền */}
                <UserOnly>
                  <TableHead className="text-center">
                    {t("serverList.tableHeader.actions")}
                  </TableHead>
                </UserOnly>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    {server.hostname}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {server.ip_address}
                      </span>
                      {/* User có thể copy IP */}
                      <UserOnly>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => handleCopyIP(server.ip_address)}
                          title={t("serverList.copyIpTooltip")}
                        >
                          {copiedIP === server.ip_address ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </UserOnly>
                    </div>
                  </TableCell>
                  <TableCell>
                    {server.os_version || t("serverList.unknown")}
                  </TableCell>
                  <TableCell>
                    {server.workload_name || t("serverList.unknown")}
                  </TableCell>
                  <TableCell>{getStatusBadge(server.status)}</TableCell>
                  <TableCell>{formatDate(server.created_at)}</TableCell>

                  {/* Cột Actions với phân quyền */}
                  <UserOnly>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title={t("serverList.actionsMenuTooltip")}
                          >
                            <span className="sr-only">
                              {t("serverList.openActionsMenu")}
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* View - Tất cả user có thể xem */}
                          <DropdownMenuItem
                            onClick={() => handleView(server)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t("serverList.action.viewServer")}
                          </DropdownMenuItem>

                          {/* Edit - Chỉ admin */}
                          <AdminOnly>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(server)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("serverList.action.editServer")}
                            </DropdownMenuItem>
                          </AdminOnly>

                          {/* Delete - Chỉ admin */}
                          <AdminOnly>
                            <DropdownMenuItem
                              onClick={() => handleDelete(server)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("serverList.action.deleteServer")}
                            </DropdownMenuItem>
                          </AdminOnly>
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

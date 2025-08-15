import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { vi, enUS } from "date-fns/locale";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Server,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  History,
  Monitor,
  HardDrive,
} from "lucide-react";
import {
  Server as ServerType,
  ServerStatus,
  ServerEnvironment,
} from "@/types/server";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface ServerListProps {
  servers: ServerType[];
  loading: boolean;
  error: string | null;
  onEdit: (server: ServerType) => void;
  onDelete: (server: ServerType) => void;
  onViewHardeningHistory: (server: ServerType) => void;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  loading,
  error,
  onEdit,
  onDelete,
  onViewHardeningHistory,
}) => {
  const [copiedIP, setCopiedIP] = React.useState<string | null>(null);
  const { t, i18n } = useTranslation("server");

  const handleCopyIP = async (ipAddress: string) => {
    try {
      await navigator.clipboard.writeText(ipAddress);
      setCopiedIP(ipAddress);
      setTimeout(() => setCopiedIP(null), 2000);
    } catch (err) {
      console.error("Failed to copy IP address:", err);
    }
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ONLINE:
        return "bg-green-500";
      case ServerStatus.OFFLINE:
        return "bg-red-500";
      case ServerStatus.MAINTENANCE:
        return "bg-yellow-500";
      case ServerStatus.ERROR:
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getEnvironmentColor = (environment: ServerEnvironment) => {
    switch (environment) {
      case ServerEnvironment.PRODUCTION:
        return "bg-red-500";
      case ServerEnvironment.STAGING:
        return "bg-yellow-500";
      case ServerEnvironment.DEVELOPMENT:
        return "bg-blue-500";
      case ServerEnvironment.TESTING:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const currentLocale = i18n.language === "vi" ? vi : enUS;
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: currentLocale,
      });
    } catch {
      return i18n.language === "vi" ? "Không xác định" : "Unknown";
    }
  };

  const formatResources = (cpuCores?: number, memoryGb?: number) => {
    const cpu = cpuCores ? `${cpuCores} cores` : "N/A";
    const memory = memoryGb ? `${memoryGb}GB` : "N/A";
    return `${cpu} / ${memory}`;
  };

  if (error) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Lỗi khi tải danh sách server: {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Đang tải server...</p>
              </div>
            </div>
          ) : servers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Server className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  Không tìm thấy server nào
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Server</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Tài nguyên</TableHead>
                    <TableHead>Môi trường</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Workload</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            {server.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {server.hostname}
                          </p>
                          {server.server_role && (
                            <p className="text-xs text-blue-600">
                              {server.server_role}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {server.ip_address}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyIP(server.ip_address)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedIP === server.ip_address ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {server.ssh_port !== 22 && (
                          <p className="text-xs text-muted-foreground">
                            SSH: {server.ssh_port}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium capitalize">
                              {server.os_type}
                            </p>
                            {server.os_name && (
                              <p className="text-xs text-muted-foreground">
                                {server.os_name} {server.os_version}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatResources(
                              server.cpu_cores,
                              server.memory_gb
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getEnvironmentColor(
                            server.environment as ServerEnvironment
                          )} text-white`}
                        >
                          {server.environment.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            server.status as ServerStatus
                          )} text-white`}
                        >
                          {server.status.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {"Workload " + server.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(server.updated_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(server)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyIP(server.ip_address)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy IP
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(server)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

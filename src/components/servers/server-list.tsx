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
} from "lucide-react";
import { toast } from "sonner";

interface ServerListProps {
  servers: Server[];
  loading: boolean;
  error: string | null;
  onEdit?: (server: Server) => void;
  onDelete?: (server: Server) => void;
  onViewHardeningHistory?: (server: Server) => void;
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

  const getStatusBadge = (status?: boolean) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
          Không xác định
        </Badge>
      );
    }

    if (status === true) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
        >
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          Online
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-red-500 text-red-500" />
          Offline
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
      toast.success("Đã copy địa chỉ IP!");
      setTimeout(() => {
        setCopiedIP(null);
      }, 2000);
    } catch (error) {
      toast.error("Không thể copy địa chỉ IP");
    }
  };

  const handleEdit = (server: Server) => {
    if (onEdit) {
      onEdit(server);
    } else {
      toast.info("Chức năng sửa server sẽ được triển khai sau");
    }
  };

  const handleDelete = (server: Server) => {
    if (onDelete) {
      onDelete(server);
    } else {
      toast.info("Chức năng xóa server sẽ được triển khai sau");
    }
  };

  const handleViewHardeningHistory = (server: Server) => {
    if (onViewHardeningHistory) {
      onViewHardeningHistory(server);
    } else {
      toast.info("Chức năng xem lịch sử hardening sẽ được triển khai sau");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
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
          <CardTitle>Danh sách Server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Có lỗi xảy ra:</p>
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
          <CardTitle>Danh sách Server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">
                Không có server nào được tìm thấy.
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
        <CardTitle>Danh sách Server</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>OS Version</TableHead>
                <TableHead>WorkLoad</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => handleCopyIP(server.ip_address)}
                        title="Copy IP address"
                      >
                        {copiedIP === server.ip_address ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{server.os_version || "Không xác định"}</TableCell>
                  <TableCell>
                    {server.workload_name || "Không xác định"}
                  </TableCell>
                  <TableCell>{getStatusBadge(server.status)}</TableCell>
                  <TableCell>{formatDate(server.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Xem thêm hành động"
                        >
                          <span className="sr-only">Mở menu hành động</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleEdit(server)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa server
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewHardeningHistory(server)}
                          className="cursor-pointer"
                        >
                          <History className="mr-2 h-4 w-4" />
                          Lịch sử hardening
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(server)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa server
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

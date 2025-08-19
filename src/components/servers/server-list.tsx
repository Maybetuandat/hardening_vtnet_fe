// src/components/server/server-list.tsx - Simplified version without actions

import React from "react";
import { Server, ServerStatus } from "@/types/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Circle } from "lucide-react";

interface ServerListProps {
  servers: Server[];
  loading: boolean;
  error: string | null;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  loading,
  error,
}) => {
  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
          Không xác định
        </Badge>
      );
    }

    switch (status.toLowerCase()) {
      case ServerStatus.ONLINE:
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            Online
          </Badge>
        );
      case ServerStatus.OFFLINE:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-red-500 text-red-500" />
            Offline
          </Badge>
        );
      case ServerStatus.MAINTENANCE:
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
            Bảo trì
          </Badge>
        );
      case ServerStatus.ERROR:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-red-500 text-red-500" />
            Lỗi
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
            {status}
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
                <TableHead>SSH Port</TableHead>
                <TableHead>SSH User</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    {server.hostname}
                  </TableCell>
                  <TableCell>{server.ip_address}</TableCell>
                  <TableCell>{server.os_version || "Không xác định"}</TableCell>
                  <TableCell>{server.ssh_port}</TableCell>
                  <TableCell>{server.ssh_user || "Không xác định"}</TableCell>
                  <TableCell>{getStatusBadge(server.status)}</TableCell>
                  <TableCell>{formatDate(server.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

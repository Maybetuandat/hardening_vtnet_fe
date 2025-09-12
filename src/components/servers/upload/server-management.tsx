import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";
import { ServerUploadData } from "@/types/server";

interface ServerManagementProps {
  servers: ServerUploadData[];
  uploadedFileName: string | null;
  testing: boolean;
  adding: boolean;
  allServersConnected: boolean;
  anyServerTesting: boolean;
  hasFailedConnections: boolean;
  canAddServers: boolean;
  onTestConnection: () => void;
  onAddServers: () => void;
  onDiscard: () => void;
  onRemoveServer: (serverId: string) => void;
}

export const ServerManagement: React.FC<ServerManagementProps> = ({
  servers,
  uploadedFileName,
  testing,
  adding,
  allServersConnected,
  anyServerTesting,
  hasFailedConnections,
  canAddServers,
  onTestConnection,
  onAddServers,
  onDiscard,
  onRemoveServer,
}) => {
  const { t } = useTranslation("server");

  const getConnectionStatusBadge = useCallback(
    (server: ServerUploadData) => {
      switch (server.connection_status) {
        case "testing":
          return (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t("serverManagement.status.testing")}
            </Badge>
          );
        case "success":
          return (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("serverManagement.status.connected")}
            </Badge>
          );
        case "failed":
          return (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t("serverManagement.status.failed")}
            </Badge>
          );
        default:
          return (
            <Badge variant="outline">
              {t("serverManagement.status.untested")}
            </Badge>
          );
      }
    },
    [t]
  );

  if (servers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {t("serverManagement.title", { count: servers.length })}
          </CardTitle>
          <div className="flex items-center gap-2">
            {uploadedFileName && (
              <Badge variant="outline" className="text-xs">
                {uploadedFileName}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={adding}
            >
              <X className="h-4 w-4 mr-1" />
              {t("serverManagement.buttons.cancel")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onTestConnection}
                disabled={testing || anyServerTesting}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t("serverManagement.buttons.testConnection")}
              </Button>
            </div>
            <Button
              onClick={onAddServers}
              disabled={!canAddServers}
              className="flex items-center gap-2"
              title={
                !canAddServers
                  ? t("serverManagement.tooltips.testConnectionRequired")
                  : ""
              }
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("serverManagement.buttons.addServers", {
                count: servers.length,
              })}
            </Button>
          </div>

          {/* Connection Status Summary */}
          {allServersConnected && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t("serverManagement.alerts.allConnected")}
              </AlertDescription>
            </Alert>
          )}

          {hasFailedConnections && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("serverManagement.alerts.failedConnections")}
              </AlertDescription>
            </Alert>
          )}

          {servers.length > 0 && !allServersConnected && !anyServerTesting && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("serverManagement.alerts.testRequired")}
              </AlertDescription>
            </Alert>
          )}

          {/* Server Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("serverManagement.tableHeaders.ipAddress")}
                  </TableHead>
                  <TableHead>
                    {t("serverManagement.tableHeaders.sshUser")}
                  </TableHead>
                  <TableHead>
                    {t("serverManagement.tableHeaders.sshPort")}
                  </TableHead>
                  <TableHead>
                    {t("serverManagement.tableHeaders.hostname")}
                  </TableHead>
                  <TableHead>
                    {t("serverManagement.tableHeaders.osVersion")}
                  </TableHead>
                  <TableHead>
                    {t("serverManagement.tableHeaders.status")}
                  </TableHead>
                  <TableHead className="w-[100px]">
                    {t("serverManagement.tableHeaders.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">
                      {server.ip_address}
                    </TableCell>
                    <TableCell>{server.ssh_user}</TableCell>
                    <TableCell>{server.ssh_port}</TableCell>
                    <TableCell>
                      {server.hostname || (
                        <span className="text-muted-foreground italic">
                          {t("serverManagement.notDetermined")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {server.os_version || (
                        <span className="text-muted-foreground italic">
                          {t("serverManagement.notDetermined")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getConnectionStatusBadge(server)}
                      {server.connection_message && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {server.connection_message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveServer(server.id)}
                        disabled={adding || testing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

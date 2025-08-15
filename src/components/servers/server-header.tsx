import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Server, RefreshCw, Upload, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ServerHeaderProps {
  onAddServer: () => void;
  onRefresh: () => void;
  loading?: boolean;
  totalServers: number;
  activeServers: number;
}

const ServerHeader: React.FC<ServerHeaderProps> = ({
  onAddServer,
  onRefresh,
  loading = false,
  totalServers,
  activeServers,
}) => {
  const { t } = useTranslation("server");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl font-semibold">
            Quản lý Server
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
          <Button onClick={onAddServer} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm Server</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {/* Upload Excel Button */}
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Tải nhiều server</span>
          </Button>

          {/* Download Template Button */}
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Tải Template mẫu</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerHeader;

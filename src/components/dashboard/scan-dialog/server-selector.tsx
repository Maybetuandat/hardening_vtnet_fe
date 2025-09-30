import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CheckCheck, X } from "lucide-react";
import { ServerList } from "./server-list";
import { Server } from "@/types/instance";

interface ServerSelectorProps {
  servers: Server[];
  selectedServers: Set<number>;
  searchTerm: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalServers: number;
  totalSelected: number;
  onSearchChange: (value: string) => void;
  onServerToggle: (serverId: number) => void;
  onSelectAllServers: () => void;
  onSelectNone: () => void;
  onLoadMore: () => void;
  t: (key: string, options?: any) => string;
}

export const ServerSelector = ({
  servers,
  selectedServers,
  searchTerm,
  loading,
  loadingMore,
  hasMore,
  totalServers,
  totalSelected,
  onSearchChange,
  onServerToggle,
  onSelectAllServers,
  onSelectNone,
  onLoadMore,
  t,
}: ServerSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Header with server info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Label className="text-sm font-medium">
            {t("scanDialog.selectServers")}
          </Label>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              {totalServers.toLocaleString()} {t("scanDialog.totalServers")}
              {searchTerm && ` (${t("scanDialog.filtered")})`}
            </span>
          </div>
        </div>

        {/* Selection actions */}
        <div className="flex space-x-1">
          {!searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAllServers}
              disabled={loading || totalServers === 0}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t("scanDialog.selectAllServers")} (
              {totalServers.toLocaleString()})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onSelectNone}
            disabled={selectedServers.size === 0}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t("scanDialog.deselectAll")}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("scanDialog.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between">
        {totalSelected > 0 ? (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {totalSelected.toLocaleString()}{" "}
              {totalSelected === 1 ? "server selected" : "servers selected"}
            </Badge>
            {totalSelected !== selectedServers.size && (
              <Badge variant="outline" className="text-xs">
                {t("scanDialog.inCurrentView", { count: selectedServers.size })}
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {t("scanDialog.noServersSelected")}
          </div>
        )}

        {/* Performance info */}
        <div className="text-xs text-muted-foreground">
          {t("scanDialog.showing")} {servers.length.toLocaleString()} /{" "}
          {totalServers.toLocaleString()}
        </div>
      </div>

      {/* Server List */}
      <ServerList
        servers={servers}
        selectedServers={selectedServers}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        searchTerm={searchTerm}
        onServerToggle={onServerToggle}
        onLoadMore={onLoadMore}
        t={t}
      />
    </div>
  );
};

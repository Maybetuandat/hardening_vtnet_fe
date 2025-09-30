import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CheckCheck, X } from "lucide-react";
import { InstanceList } from "./server-list";
import { Instance } from "@/types/instance";

interface InstanceSelectorProps {
  instances: Instance[];
  selectedInstances: Set<number>;
  searchTerm: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalInstances: number;
  totalSelected: number;
  onSearchChange: (value: string) => void;
  onInstanceToggle: (instanceId: number) => void;
  onSelectAllInstances: () => void;
  onSelectNone: () => void;
  onLoadMore: () => void;
  t: (key: string, options?: any) => string;
}

export const InstanceSelector = ({
  instances,
  selectedInstances,
  searchTerm,
  loading,
  loadingMore,
  hasMore,
  totalInstances,
  totalSelected,
  onSearchChange,
  onInstanceToggle,
  onSelectAllInstances,
  onSelectNone,
  onLoadMore,
  t,
}: InstanceSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Header with server info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Label className="text-sm font-medium">
            {t("scanDialog.selectinstances")}
          </Label>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              {totalInstances.toLocaleString()} {t("scanDialog.totalinstances")}
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
              onClick={onSelectAllInstances}
              disabled={loading || totalInstances === 0}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t("scanDialog.selectAllinstances")} (
              {totalInstances.toLocaleString()})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onSelectNone}
            disabled={selectedInstances.size === 0}
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
              {totalSelected === 1 ? "server selected" : "instances selected"}
            </Badge>
            {totalSelected !== selectedInstances.size && (
              <Badge variant="outline" className="text-xs">
                {t("scanDialog.inCurrentView", {
                  count: selectedInstances.size,
                })}
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {t("scanDialog.noinstancesSelected")}
          </div>
        )}

        {/* Performance info */}
        <div className="text-xs text-muted-foreground">
          {t("scanDialog.showing")} {instances.length.toLocaleString()} /{" "}
          {totalInstances.toLocaleString()}
        </div>
      </div>

      {/* Instance List */}
      <InstanceList
        Instances={instances}
        selectedInstances={selectedInstances}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        searchTerm={searchTerm}
        onInstanceToggle={onInstanceToggle}
        onLoadMore={onLoadMore}
        t={t}
      />
    </div>
  );
};

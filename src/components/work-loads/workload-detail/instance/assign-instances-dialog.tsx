import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Loader2,
  Server,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Instance } from "@/types/instance";
import toastHelper from "@/utils/toast-helper";
import { Badge } from "@/components/ui/badge";
import { useWorkloadInstances } from "@/hooks/workload/use-workload-instances";

interface AssignInstancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workloadId: number;
  onSuccess: () => void;
}

export const AssignInstancesDialog: React.FC<AssignInstancesDialogProps> = ({
  open,
  onOpenChange,
  workloadId,
  onSuccess,
}) => {
  const { t } = useTranslation("workload");

  // Sử dụng useWorkloadInstances - hook duy nhất cho tất cả operations
  const {
    instances,
    loading,
    fetchInstanceNotInWorkLoad,
    assignInstancesToWorkload,
  } = useWorkloadInstances();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<Set<number>>(
    new Set()
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>([]);

  // Fetch instances not in workload when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedInstanceIds(new Set());
      fetchInstanceNotInWorkLoad();
    }
  }, [open, fetchInstanceNotInWorkLoad]);

  // Filter instances based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInstances(instances);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = instances.filter(
        (instance) =>
          instance.name.toLowerCase().includes(term) ||
          instance.name.toLowerCase().includes(term)
      );
      setFilteredInstances(filtered);
    }
  }, [searchTerm, instances]);

  const handleToggleInstance = (instanceId: number) => {
    setSelectedInstanceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId);
      } else {
        newSet.add(instanceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedInstanceIds.size === filteredInstances.length) {
      setSelectedInstanceIds(new Set());
    } else {
      setSelectedInstanceIds(new Set(filteredInstances.map((i) => i.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedInstanceIds.size === 0) {
      toastHelper.warning(t("workloadDetail.instances.assign.noSelection"));
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignInstancesToWorkload(
        workloadId,
        Array.from(selectedInstanceIds)
      );

      if (result.success) {
        toastHelper.success(
          t("workloadDetail.instances.assign.success", {
            count: result.data.assigned_count,
          })
        );
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toastHelper.error(
        error.message || t("workloadDetail.instances.assign.error")
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      error: { label: "Error", className: "bg-red-100 text-red-800" },
    };
    const statusConfig =
      config[status as keyof typeof config] || config.inactive;

    return (
      <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t("workloadDetail.instances.assign.title")}
          </DialogTitle>
          <DialogDescription>
            {t("workloadDetail.instances.assign.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "workloadDetail.instances.assign.searchPlaceholder"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  filteredInstances.length > 0 &&
                  selectedInstanceIds.size === filteredInstances.length
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {t("workloadDetail.instances.assign.selectAll")}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedInstanceIds.size} / {filteredInstances.length}{" "}
              {t("workloadDetail.instances.assign.selected")}
            </span>
          </div>

          {/* Instance List */}
          <ScrollArea className="h-[400px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t("workloadDetail.instances.assign.noInstances")}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredInstances.map((instance) => (
                  <div
                    key={instance.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${
                      selectedInstanceIds.has(instance.id)
                        ? "bg-accent border-primary"
                        : ""
                    }`}
                    onClick={() => handleToggleInstance(instance.id)}
                  >
                    <Checkbox
                      checked={selectedInstanceIds.has(instance.id)}
                      onCheckedChange={() => handleToggleInstance(instance.id)}
                    />
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{instance.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {instance.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedInstanceIds.size === 0 || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("workloadDetail.instances.assign.assigning")}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("workloadDetail.instances.assign.confirm")} (
                {selectedInstanceIds.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

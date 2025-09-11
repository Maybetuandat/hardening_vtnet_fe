import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X, Plus } from "lucide-react";
import { useWorkloads } from "@/hooks/workload/use-workloads";

interface WorkloadSelectionProps {
  selectedWorkloads: number[];
  onSelectionChange: (workloads: number[]) => void;
}

export const WorkloadSelection: React.FC<WorkloadSelectionProps> = ({
  selectedWorkloads,
  onSelectionChange,
}) => {
  const { t } = useTranslation("dashboard");
  const [workloadSearchTerm, setWorkloadSearchTerm] = useState("");
  const [showWorkloadsList, setShowWorkloadsList] = useState(false);

  const {
    workloads,
    loading: loadingWorkloads,
    fetchWorkloads,
  } = useWorkloads();

  // Load workloads when component mounts
  useEffect(() => {
    if (!loadingWorkloads && (!workloads || workloads.length === 0)) {
      fetchWorkloads("", 1, 100);
    }
  }, [loadingWorkloads, workloads, fetchWorkloads]);

  // Filter workloads theo search term
  const filteredWorkloads = React.useMemo(() => {
    if (!workloads) return [];
    if (!workloadSearchTerm.trim()) return workloads;

    return workloads.filter(
      (workload) =>
        workload.name
          .toLowerCase()
          .includes(workloadSearchTerm.toLowerCase()) ||
        workload.description
          ?.toLowerCase()
          .includes(workloadSearchTerm.toLowerCase())
    );
  }, [workloads, workloadSearchTerm]);

  // Get selected workload objects
  const selectedWorkloadObjects = React.useMemo(() => {
    if (!workloads) return [];
    return workloads.filter((w) => selectedWorkloads.includes(w.id));
  }, [workloads, selectedWorkloads]);

  const handleWorkloadToggle = (workloadId: number, checked: boolean) => {
    const newSelection = checked
      ? [...selectedWorkloads, workloadId]
      : selectedWorkloads.filter((id) => id !== workloadId);
    onSelectionChange(newSelection);
  };

  const handleRemoveWorkload = (workloadId: number) => {
    const newSelection = selectedWorkloads.filter((id) => id !== workloadId);
    onSelectionChange(newSelection);
  };

  const handleSelectAllWorkloads = () => {
    const allIds = filteredWorkloads.map((w) => w.id);
    onSelectionChange(allIds);
  };

  const handleDeselectAllWorkloads = () => {
    onSelectionChange([]);
  };

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right font-medium pt-2">
        {t("workloadSelection.label")}
      </Label>
      <div className="col-span-3 space-y-3">
        {/* Selected workloads as tags */}
        <div className="min-h-[40px] p-2 border rounded-md bg-gray-50">
          {selectedWorkloadObjects.length === 0 ? (
            <span className="text-muted-foreground text-sm">
              {t("workloadSelection.noSelection")}
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedWorkloadObjects.map((workload, index) => (
                <div
                  key={workload.id}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium `}
                >
                  <span>{workload.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkload(workload.id)}
                    className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add workload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowWorkloadsList(!showWorkloadsList)}
          className="w-full justify-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("workloadSelection.addWorkload")}
        </Button>

        {/* Workload selection panel */}
        {showWorkloadsList && (
          <div className="border rounded-md bg-white shadow-sm">
            {/* Search input */}
            <div className="p-3 border-b">
              <Input
                placeholder={t("workloadSelection.searchPlaceholder")}
                value={workloadSearchTerm}
                onChange={(e) => setWorkloadSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>

            {/* Action buttons */}
            <div className="p-2 border-b flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllWorkloads}
                disabled={filteredWorkloads.length === 0}
              >
                {t("workloadSelection.selectAll")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAllWorkloads}
                disabled={selectedWorkloads.length === 0}
              >
                {t("workloadSelection.deselectAll")}
              </Button>
            </div>

            {/* Workload list */}
            <ScrollArea className="max-h-[200px]">
              <div className="p-2">
                {loadingWorkloads ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">
                      {t("workloadSelection.loading")}
                    </span>
                  </div>
                ) : filteredWorkloads.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {workloadSearchTerm
                      ? t("workloadSelection.noResults")
                      : t("workloadSelection.noWorkloads")}
                  </div>
                ) : (
                  filteredWorkloads.map((workload) => (
                    <div
                      key={workload.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`workload-${workload.id}`}
                        checked={selectedWorkloads.includes(workload.id)}
                        onCheckedChange={(checked) =>
                          handleWorkloadToggle(workload.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`workload-${workload.id}`}
                        className="text-sm cursor-pointer flex-1 hover:text-primary"
                      >
                        <div className="font-medium">{workload.name}</div>
                        {workload.description && (
                          <div className="text-xs text-gray-500">
                            {workload.description}
                          </div>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

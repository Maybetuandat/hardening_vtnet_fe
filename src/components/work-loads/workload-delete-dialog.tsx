import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Workload } from "@/types/workload";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface WorkloadDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  workload: Workload | null;
  onConfirm: (id: number) => Promise<void>;
  onSuccess: () => void;
}

export function WorkloadDeleteDialog({
  open,
  onOpenChange,
  onClose,
  workload,
  onConfirm,
  onSuccess,
}: WorkloadDeleteDialogProps) {
  const { t } = useTranslation("workload");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!workload) return;

    setLoading(true);
    try {
      await onConfirm(workload.id);
      toast.success(t("workloads.workloadDeleted"));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || t("common.actionFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!workload) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            {t("workloads.deleteWorkload")}
          </DialogTitle>
          <DialogDescription>{t("workloads.confirmDelete")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workload info */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">
                {workload.display_name || workload.name}
              </h4>
              <Badge variant="secondary">
                {workload.workload_type.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {workload.description || "No description"}
            </p>
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t("workloads.deleteWarning")}</AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

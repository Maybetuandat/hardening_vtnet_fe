// src/components/work-loads/workload-delete-dialog.tsx
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
    if (!workload?.id) return;

    setLoading(true);
    try {
      await onConfirm(workload.id);
      toast.success("Workload đã được xóa thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa workload");
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
            Xóa Workload
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa workload này không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workload info */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{workload.name}</h4>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300"
              >
                Hoạt động
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {workload.description || "Không có mô tả"}
            </p>
            {workload.created_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Ngày tạo:{" "}
                {new Date(workload.created_at).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến
              workload này sẽ bị xóa vĩnh viễn.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa workload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { ComplianceResult } from "@/types/compliance";
import { toast } from "sonner";

interface DeleteComplianceDialogProps {
  compliance: ComplianceResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (complianceId: number) => Promise<void>;
}

export function DeleteComplianceDialog({
  compliance,
  open,
  onOpenChange,
  onDelete,
}: DeleteComplianceDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!compliance) return;

    setLoading(true);
    try {
      await onDelete(compliance.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting compliance:", error);
      // Error handling is now done in the parent component
    } finally {
      setLoading(false);
    }
  };

  if (!compliance) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Xóa kết quả compliance
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa kết quả compliance cho server{" "}
            <span className="font-semibold">{compliance.server_ip}</span> được
            scan vào{" "}
            <span className="font-semibold">
              {compliance.scan_date
                ? new Date(compliance.scan_date).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
            ?
            <br />
            <br />
            Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan
            bao gồm các rule results.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

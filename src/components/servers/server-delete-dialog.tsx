import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Server } from "@/types/server";

interface ServerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  server: Server | null;
  onConfirm: (id: number) => Promise<void>;
  onSuccess: (message: string) => void;
}

export const ServerDeleteDialog: React.FC<ServerDeleteDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  server,
  onConfirm,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!server) return;

    setLoading(true);
    try {
      await onConfirm(server.id);
      onSuccess(`Đã xóa server "${server.hostname}" thành công!`);
      onClose();
    } catch (error: any) {
      console.error("Error deleting server:", error);
      onSuccess(
        `Lỗi khi xóa server: ${error.message || "Không thể xóa server"}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!server) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa Server
          </DialogTitle>
          <DialogDescription className="text-left">
            Bạn có chắc chắn muốn xóa server này không? Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Hostname:</span>
            <span>{server.hostname}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">IP Address:</span>
            <span>{server.ip_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">OS Version:</span>
            <span>{server.os_version || "Không xác định"}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

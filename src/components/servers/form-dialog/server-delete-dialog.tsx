import React, { useState } from "react";
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
  const { t } = useTranslation("server");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!server) return;

    setLoading(true);
    try {
      await onConfirm(server.id);
      onSuccess(
        t("serverDeleteDialog.messages.deleteSuccess", {
          hostname: server.hostname,
        })
      );
      onClose();
    } catch (error: any) {
      console.error("Error deleting server:", error);
      onSuccess(
        t("serverDeleteDialog.messages.deleteError", {
          error:
            error.message ||
            t("serverDeleteDialog.messages.deleteErrorDefault"),
        })
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
            {t("serverDeleteDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-left">
            {t("serverDeleteDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">
              {t("serverDeleteDialog.fields.hostname")}:
            </span>
            <span>{server.hostname}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">
              {t("serverDeleteDialog.fields.ipAddress")}:
            </span>
            <span>{server.ip_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">
              {t("serverDeleteDialog.fields.osVersion")}:
            </span>
            <span>{server.os_version || t("serverDeleteDialog.unknown")}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("serverDeleteDialog.buttons.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("serverDeleteDialog.buttons.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

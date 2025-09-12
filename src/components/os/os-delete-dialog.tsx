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
import { Trash2, Loader2 } from "lucide-react";
import { OSVersion } from "@/types/os";

interface OSDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  osVersion: OSVersion | null;
  onConfirm: (osId: number) => Promise<void>;
}

export const OSDeleteDialog: React.FC<OSDeleteDialogProps> = ({
  open,
  onOpenChange,
  osVersion,
  onConfirm,
}) => {
  const { t } = useTranslation("os");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!osVersion) return;

    setLoading(true);
    try {
      await onConfirm(osVersion.id);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            {t("osDeleteDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("osDeleteDialog.description", { version: osVersion?.version })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {t("osDeleteDialog.buttons.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("osDeleteDialog.buttons.deleting")}
              </>
            ) : (
              t("osDeleteDialog.buttons.delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

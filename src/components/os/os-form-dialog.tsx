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
import { Label } from "@/components/ui/label";
import { Plus, Edit, Loader2 } from "lucide-react";
import { OSVersion, OSCreate, OSUpdate } from "@/types/os";

interface OSFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOS: OSVersion | null;
  onSubmit: (data: OSCreate | OSUpdate) => Promise<void>;
  loading: boolean;
}

export const OSFormDialog: React.FC<OSFormDialogProps> = ({
  open,
  onOpenChange,
  editingOS,
  onSubmit,
  loading,
}) => {
  const { t } = useTranslation("os");
  const [version, setVersion] = useState("");

  const isEditing = Boolean(editingOS);

  // Reset form when dialog opens/closes or editing state changes
  useEffect(() => {
    if (open) {
      setVersion(editingOS?.version || "");
    } else {
      setVersion("");
    }
  }, [open, editingOS]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!version.trim()) {
      return;
    }

    try {
      await onSubmit({ version: version.trim() });
      // Dialog sẽ được đóng trong parent component nếu thành công
    } catch (error) {
      // Error được handle trong parent component và hiển thị toast
      // Không đóng dialog để user có thể thử lại
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5 text-primary" />
                {t("osFormDialog.titles.edit")}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                {t("osFormDialog.titles.add")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("osFormDialog.descriptions.edit")
              : t("osFormDialog.descriptions.add")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version">
                {t("osFormDialog.fields.version")}
              </Label>
              <Input
                id="version"
                placeholder={t("osFormDialog.placeholders.version")}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t("osFormDialog.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !version.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing
                    ? t("osFormDialog.buttons.updating")
                    : t("osFormDialog.buttons.creating")}
                </>
              ) : isEditing ? (
                t("osFormDialog.buttons.update")
              ) : (
                t("osFormDialog.buttons.create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

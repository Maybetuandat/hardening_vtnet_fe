// src/components/os/os-form-dialog.tsx
import React, { useState, useEffect } from "react";
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
                Chỉnh sửa hệ điều hành
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                Thêm hệ điều hành mới
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin phiên bản hệ điều hành"
              : "Nhập thông tin phiên bản hệ điều hành mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version">Phiên bản *</Label>
              <Input
                id="version"
                placeholder="VD: Ubuntu 22.04, CentOS 7, Windows Server 2019"
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
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !version.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : isEditing ? (
                "Cập nhật"
              ) : (
                "Tạo mới"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

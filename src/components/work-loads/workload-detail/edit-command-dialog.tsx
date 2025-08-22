// src/components/workload-detail/EditCommandDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";
import {
  useCommands,
  CommandResponse,
  CommandUpdate,
} from "@/hooks/command/use-commands";

interface EditCommandDialogProps {
  command: CommandResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const osVersionOptions = [
  { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS" },
  { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS" },
  { value: "ubuntu-24.04", label: "Ubuntu 24.04 LTS" },
  { value: "centos-7", label: "CentOS 7" },
  { value: "centos-8", label: "CentOS 8" },
  { value: "rhel-8", label: "RHEL 8" },
  { value: "rhel-9", label: "RHEL 9" },
  { value: "debian-10", label: "Debian 10" },
  { value: "debian-11", label: "Debian 11" },
  { value: "debian-12", label: "Debian 12" },
  { value: "windows-server-2019", label: "Windows Server 2019" },
  { value: "windows-server-2022", label: "Windows Server 2022" },
];

export const EditCommandDialog: React.FC<EditCommandDialogProps> = ({
  command,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommandUpdate>({
    os_version: command.os_version,
    command_text: command.command_text,
    is_active: command.is_active,
  });

  const { updateCommand } = useCommands();

  // Reset form when dialog opens or command changes
  useEffect(() => {
    if (open) {
      setFormData({
        os_version: command.os_version,
        command_text: command.command_text,
        is_active: command.is_active,
      });
    }
  }, [open, command]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.os_version || !formData.command_text?.trim()) {
      return;
    }

    try {
      setLoading(true);
      await updateCommand(command.id, formData);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      os_version: command.os_version,
      command_text: command.command_text,
      is_active: command.is_active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Command</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin command. Nhấn lưu để áp dụng thay đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OS Version Field */}
          <div className="space-y-2">
            <Label htmlFor="os_version">
              Hệ điều hành <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.os_version}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, os_version: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hệ điều hành" />
              </SelectTrigger>
              <SelectContent>
                {osVersionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Command Text Field */}
          <div className="space-y-2">
            <Label htmlFor="command_text">
              Command <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="command_text"
              value={formData.command_text || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  command_text: e.target.value,
                }))
              }
              placeholder="Nhập command hoặc Ansible command..."
              rows={6}
              disabled={loading}
              className="font-mono text-sm"
              required
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Ví dụ shell command:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                echo "net.ipv4.ip_forward = 1" {">>"} /etc/sysctl.conf && sysctl
                -p
              </code>
              <p>Ví dụ Ansible task:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                {`- name: Set kernel parameter
  sysctl:
    name: net.ipv4.ip_forward
    value: '1'
    state: present`}
              </code>
            </div>
          </div>

          {/* Is Active Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Trạng thái hoạt động</Label>
              <p className="text-sm text-muted-foreground">
                Bật/tắt trạng thái hoạt động của command
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.os_version ||
                !formData.command_text?.trim()
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

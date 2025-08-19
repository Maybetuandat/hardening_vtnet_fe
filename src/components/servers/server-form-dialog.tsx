// src/components/server/server-form-dialog.tsx

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Server, ServerCreate, ServerUpdate } from "@/types/server";

const serverFormSchema = z.object({
  hostname: z
    .string()
    .min(1, "Hostname là bắt buộc")
    .max(255, "Hostname quá dài"),
  ip_address: z
    .string()
    .min(1, "IP Address là bắt buộc")
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "IP Address không hợp lệ"
    ),
  os_version: z
    .string()
    .min(1, "OS Version là bắt buộc")
    .max(50, "OS Version quá dài"),
  ssh_port: z.coerce
    .number()
    .min(1, "SSH Port phải lớn hơn 0")
    .max(65535, "SSH Port không hợp lệ"),
  ssh_user: z
    .string()
    .min(1, "SSH User là bắt buộc")
    .max(100, "SSH User quá dài"),
  ssh_password: z.string().min(1, "SSH Password là bắt buộc"),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

interface ServerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingServer: Server | null;
  createServer: (data: ServerCreate) => Promise<Server>;
  updateServer: (id: number, data: ServerUpdate) => Promise<Server>;
  getServerById: (id: number) => Promise<Server>;
  onSuccess: (message: string) => void;
}

export const ServerFormDialog: React.FC<ServerFormDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  editingServer,
  createServer,
  updateServer,
  getServerById,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingServerData, setLoadingServerData] = useState(false);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      hostname: "",
      ip_address: "",
      os_version: "",
      ssh_port: 22,
      ssh_user: "",
      ssh_password: "",
    },
  });

  const isEditing = !!editingServer;

  // Load server data when editing
  useEffect(() => {
    if (isEditing && editingServer && open) {
      setLoadingServerData(true);
      getServerById(editingServer.id)
        .then((server) => {
          form.reset({
            hostname: server.hostname,
            ip_address: server.ip_address,
            os_version: server.os_version || "",
            ssh_port: server.ssh_port,
            ssh_user: server.ssh_user || "",
            ssh_password: "", // Don't load password for security
          });
        })
        .catch((error) => {
          console.error("Error loading server data:", error);
          onSuccess("Lỗi khi tải dữ liệu server");
        })
        .finally(() => {
          setLoadingServerData(false);
        });
    } else if (!isEditing && open) {
      // Reset form for new server
      form.reset({
        hostname: "",
        ip_address: "",
        os_version: "",
        ssh_port: 22,
        ssh_user: "",
        ssh_password: "",
      });
    }
  }, [isEditing, editingServer, open, form, getServerById, onSuccess]);

  const onSubmit = async (values: ServerFormValues) => {
    setLoading(true);
    try {
      if (isEditing && editingServer) {
        const updateData: ServerUpdate = {
          hostname: values.hostname,
          ip_address: values.ip_address,
          os_version: values.os_version,
          ssh_port: values.ssh_port,
          ssh_user: values.ssh_user,
        };

        // Only include password if provided
        if (values.ssh_password.trim()) {
          updateData.ssh_password = values.ssh_password;
        }

        await updateServer(editingServer.id, updateData);
        onSuccess("Cập nhật server thành công!");
      } else {
        const createData: ServerCreate = {
          hostname: values.hostname,
          ip_address: values.ip_address,
          os_version: values.os_version,
          ssh_port: values.ssh_port,
          ssh_user: values.ssh_user,
          ssh_password: values.ssh_password,
        };

        await createServer(createData);
        onSuccess("Tạo server thành công!");
      }

      handleClose();
    } catch (error: any) {
      console.error("Error saving server:", error);
      onSuccess(`Lỗi: ${error.message || "Không thể lưu server"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Server" : "Thêm Server mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin server. Để trống mật khẩu nếu không muốn thay đổi."
              : "Nhập thông tin server mới. Tất cả các trường là bắt buộc."}
          </DialogDescription>
        </DialogHeader>

        {loadingServerData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="web-server-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ip_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="os_version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OS Version</FormLabel>
                    <FormControl>
                      <Input placeholder="Ubuntu 24.04 LTS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssh_port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSH Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="22" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssh_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSH User</FormLabel>
                    <FormControl>
                      <Input placeholder="root" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssh_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      SSH Password{" "}
                      {isEditing && "(Để trống nếu không thay đổi)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          isEditing ? "••••••••" : "Nhập mật khẩu SSH"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Cập nhật" : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

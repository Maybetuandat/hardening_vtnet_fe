// src/components/servers/server-form-dialog.tsx - Edit Only Version

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react";
import { Server, ServerUpdate } from "@/types/server";
import { api } from "@/lib/api";

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
  ssh_password: z.string().optional(),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

interface TestConnectionResult {
  ip: string;
  ssh_user: string;
  ssh_port: number;
  status: string;
  message: string;
  hostname?: string;
  os_version?: string;
  response_time?: number;
  error_details?: string;
}

interface ServerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingServer: Server | null;
  updateServer: (id: number, data: ServerUpdate) => Promise<Server>;
  getServerById: (id: number) => Promise<Server>;
  onSuccess: (message: string) => void;
}

export const ServerFormDialog: React.FC<ServerFormDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  editingServer,
  updateServer,
  getServerById,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingServerData, setLoadingServerData] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [connectionResult, setConnectionResult] =
    useState<TestConnectionResult | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [initialFormValues, setInitialFormValues] =
    useState<ServerFormValues | null>(null);

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

  // Watch form changes - only detect real changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (initialFormValues) {
        // Compare current values with initial values
        const hasChanges =
          values.hostname !== initialFormValues.hostname ||
          values.ip_address !== initialFormValues.ip_address ||
          values.os_version !== initialFormValues.os_version ||
          values.ssh_port !== initialFormValues.ssh_port ||
          values.ssh_user !== initialFormValues.ssh_user ||
          (values.ssh_password !== "" &&
            values.ssh_password !== initialFormValues.ssh_password);

        if (hasChanges !== formChanged) {
          setFormChanged(hasChanges);
          if (hasChanges) {
            setConnectionTested(false);
            setConnectionResult(null);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, initialFormValues, formChanged]);

  // Load server data when dialog opens
  useEffect(() => {
    if (editingServer && open) {
      setLoadingServerData(true);
      setConnectionTested(false);
      setConnectionResult(null);
      setFormChanged(false);

      getServerById(editingServer.id)
        .then((server) => {
          const serverValues = {
            hostname: server.hostname,
            ip_address: server.ip_address,
            os_version: server.os_version || "",
            ssh_port: server.ssh_port,
            ssh_user: server.ssh_user || "",
            ssh_password: "", // Don't load password for security
          };

          form.reset(serverValues);
          setInitialFormValues(serverValues); // Store initial values for comparison
        })
        .catch((error) => {
          console.error("Error loading server data:", error);
          onSuccess("Lỗi khi tải dữ liệu server");
        })
        .finally(() => {
          setLoadingServerData(false);
        });
    }
  }, [editingServer, open, form, getServerById, onSuccess]);

  const testConnection = async () => {
    const values = form.getValues();

    // Validate required fields for connection test
    if (!values.ip_address || !values.ssh_user || !values.ssh_password) {
      onSuccess(
        "Vui lòng nhập đầy đủ IP Address, SSH User và SSH Password để test connection"
      );
      return;
    }

    setTestingConnection(true);
    try {
      const testData = {
        servers: [
          {
            ip: values.ip_address,
            ssh_user: values.ssh_user,
            ssh_password: values.ssh_password,
            ssh_port: values.ssh_port,
          },
        ],
      };

      const response = await api.post("/servers/test-connection", testData);

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        setConnectionResult(result);
        setConnectionTested(true);

        if (result.status === "success") {
          onSuccess("Test connection thành công!");
          // Auto-fill hostname and OS if detected and current values are empty or different
          if (result.hostname && result.hostname !== values.hostname) {
            form.setValue("hostname", result.hostname);
          }
          if (result.os_version && result.os_version !== values.os_version) {
            form.setValue("os_version", result.os_version);
          }
        } else {
          onSuccess(`Test connection thất bại: ${result.message}`);
        }
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setConnectionResult({
        ip: values.ip_address,
        ssh_user: values.ssh_user,
        ssh_port: values.ssh_port,
        status: "failed",
        message: error.message || "Connection test failed",
        error_details: error.response?.data?.detail || "Unknown error",
      });
      setConnectionTested(true);
      onSuccess(`Lỗi test connection: ${error.message || "Không thể kết nối"}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const onSubmit = async (values: ServerFormValues) => {
    if (!editingServer) return;

    // Check if connection test is required when form changed
    if (formChanged && !connectionTested) {
      onSuccess("Vui lòng test connection trước khi cập nhật server");
      return;
    }

    // Check if connection test passed when form changed
    if (
      formChanged &&
      connectionTested &&
      connectionResult?.status !== "success"
    ) {
      onSuccess("Connection test phải thành công trước khi cập nhật server");
      return;
    }

    setLoading(true);
    try {
      const updateData: ServerUpdate = {
        hostname: values.hostname,
        ip_address: values.ip_address,
        os_version: values.os_version,
        ssh_port: values.ssh_port,
        ssh_user: values.ssh_user,
      };

      // Only include password if provided
      if (values.ssh_password && values.ssh_password.trim()) {
        updateData.ssh_password = values.ssh_password;
      }

      await updateServer(editingServer.id, updateData);
      onSuccess("Cập nhật server thành công!");
      handleClose();
    } catch (error: any) {
      console.error("Error updating server:", error);
      onSuccess(`Lỗi: ${error.message || "Không thể cập nhật server"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setConnectionTested(false);
    setConnectionResult(null);
    setFormChanged(false);
    setInitialFormValues(null);
    onClose();
  };

  // Disable update button if form changed but connection test not successful
  const canUpdate =
    !formChanged ||
    (connectionTested && connectionResult?.status === "success");

  if (!editingServer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Server</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin server. Test connection sau khi thay đổi thông
            tin để có thể cập nhật.
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        SSH Password (Để trống nếu không thay đổi)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Connection Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Test Connection</h4>
                    <p className="text-xs text-muted-foreground">
                      Test kết nối sau khi thay đổi thông tin
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {/* Connection Result */}
                {connectionResult && (
                  <Alert
                    variant={
                      connectionResult.status === "success"
                        ? "default"
                        : "destructive"
                    }
                  >
                    <div className="flex items-center">
                      {connectionResult.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription className="ml-2">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {connectionResult.message}
                          </p>
                          {connectionResult.hostname && (
                            <p className="text-xs">
                              Hostname: {connectionResult.hostname}
                            </p>
                          )}
                          {connectionResult.os_version && (
                            <p className="text-xs">
                              OS: {connectionResult.os_version}
                            </p>
                          )}
                          {connectionResult.response_time && (
                            <p className="text-xs">
                              Response time: {connectionResult.response_time}ms
                            </p>
                          )}
                          {connectionResult.error_details && (
                            <p className="text-xs text-destructive">
                              {connectionResult.error_details}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Form change warning */}
                {formChanged && !connectionTested && (
                  <Alert>
                    <WifiOff className="h-4 w-4" />
                    <AlertDescription>
                      Bạn đã thay đổi thông tin server. Vui lòng test connection
                      trước khi cập nhật.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Connection test required warning */}
                {formChanged &&
                  connectionTested &&
                  connectionResult?.status !== "success" && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Connection test phải thành công trước khi có thể cập
                        nhật server.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading || !canUpdate}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

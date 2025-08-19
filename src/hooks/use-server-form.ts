// src/hooks/use-server-form.ts
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

export type ServerFormValues = z.infer<typeof serverFormSchema>;

export interface TestConnectionResult {
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

interface UseServerFormProps {
  editingServer: Server | null;
  updateServer: (id: number, data: ServerUpdate) => Promise<Server>;
  getServerById: (id: number) => Promise<Server>;
  onSuccess: (message: string) => void;
  onClose: () => void;
}

export function useServerForm({
  editingServer,
  updateServer,
  getServerById,
  onSuccess,
  onClose,
}: UseServerFormProps) {
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
          // Reset connection test when form changes
          if (hasChanges) {
            setConnectionTested(false);
            setConnectionResult(null);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, initialFormValues, formChanged]);

  // Load server data when editing
  const loadServerData = useCallback(async () => {
    if (!editingServer) return;

    setLoadingServerData(true);
    setConnectionTested(false);
    setConnectionResult(null);
    setFormChanged(false);

    try {
      const server = await getServerById(editingServer.id);
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
    } catch (error) {
      console.error("Error loading server data:", error);
      onSuccess("Lỗi khi tải dữ liệu server");
    } finally {
      setLoadingServerData(false);
    }
  }, [editingServer, getServerById, form, onSuccess]);

  // Test connection function
  const testConnection = useCallback(async () => {
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

      // Assert the response type
      const typedResponse = response as { results: TestConnectionResult[] };

      if (typedResponse.results && typedResponse.results.length > 0) {
        const result = typedResponse.results[0];
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
  }, [form, onSuccess]);

  // Submit form function
  const onSubmit = useCallback(
    async (values: ServerFormValues) => {
      if (!editingServer) return;

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
    },
    [editingServer, updateServer, onSuccess, onClose]
  );

  // Close dialog function
  const handleClose = useCallback(() => {
    form.reset();
    setConnectionTested(false);
    setConnectionResult(null);
    setFormChanged(false);
    setInitialFormValues(null);
    onClose();
  }, [form, onClose]);

  // Computed values - Updated logic:
  // - canTestConnection: enable only when form has changes
  // - canUpdate: enable only when form changed AND connection test successful
  const canTestConnection = formChanged;
  const canUpdate =
    formChanged && connectionTested && connectionResult?.status === "success";

  return {
    // Form
    form,
    serverFormSchema,

    // States
    loading,
    loadingServerData,
    testingConnection,
    connectionTested,
    connectionResult,
    formChanged,
    canTestConnection,
    canUpdate,

    // Functions
    loadServerData,
    testConnection,
    onSubmit,
    handleClose,
  };
}

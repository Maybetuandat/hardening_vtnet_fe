import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  IpValidationResult,
  Server,
  ServerConnectionResult,
  ServerUpdate,
} from "@/types/server";
import { api } from "@/lib/api";
import { useWorkloads } from "@/hooks/workload/use-workloads";

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
  workload_id: z.coerce.number().min(1, "Vui lòng chọn workload"),
});

export type ServerFormValues = z.infer<typeof serverFormSchema>;

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
    useState<ServerConnectionResult | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [initialFormValues, setInitialFormValues] =
    useState<ServerFormValues | null>(null);

  const [validatingIpAddress, setValidatingIpAddress] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldValidation, setFieldValidation] = useState<{
    hostname: boolean;
    ip_address: boolean;
  }>({
    hostname: true,
    ip_address: true,
  });

  // Workload states - sử dụng hook có sẵn
  const {
    workloads,
    loading: loadingWorkloads,
    fetchWorkloads,
  } = useWorkloads();

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      hostname: "",
      ip_address: "",
      os_version: "",
      ssh_port: 22,
      ssh_user: "",
      ssh_password: "",
      workload_id: 0,
    },
  });

  // Load workloads when component mounts
  useEffect(() => {
    fetchWorkloads("", 1, 100); // Lấy tất cả workloads
  }, [fetchWorkloads]);

  const validateIpAddress = useCallback(
    async (ipAddress: string) => {
      if (!ipAddress.trim() || !editingServer) return;

      setValidatingIpAddress(true);
      try {
        const response = await api.get<IpValidationResult>(
          `/servers/validate/ip/${encodeURIComponent(
            ipAddress.trim()
          )}?server_id=${editingServer.id}`
        );

        const result = response;

        setFieldValidation((prev) => ({
          ...prev,
          ip_address: result.valid,
        }));

        setValidationErrors((prev) => {
          const filtered = prev.filter(
            (error) => !error.includes("IP address")
          );
          if (!result.valid) {
            return [...filtered, result.message];
          }
          return filtered;
        });

        if (!result.valid) {
          setConnectionTested(false);
          setConnectionResult(null);
          console.log(" IP validation failed, resetting connection test");
        } else {
          console.log(" IP validation passed");
        }
      } catch (error) {
        console.error(" Error validating IP address:", error);
        setFieldValidation((prev) => ({
          ...prev,
          ip_address: false,
        }));
        setValidationErrors((prev) => {
          const filtered = prev.filter(
            (error) => !error.includes("IP address")
          );
          return [...filtered, "Lỗi khi kiểm tra IP address"];
        });
      } finally {
        setValidatingIpAddress(false);
      }
    },
    [editingServer]
  );

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "ip_address" && initialFormValues && editingServer) {
        const ipAddress = values.ip_address;
        const ipChanged = ipAddress !== initialFormValues.ip_address;

        if (ipChanged && ipAddress && ipAddress.trim()) {
          console.log(
            " IP address changed, setting up validation timeout:",
            ipAddress
          );

          const timeoutId = setTimeout(() => {
            validateIpAddress(ipAddress);
          }, 500);

          return () => {
            console.log(" Clearing IP validation timeout");
            clearTimeout(timeoutId);
          };
        } else if (!ipChanged) {
          setFieldValidation((prev) => ({ ...prev, ip_address: true }));
          setValidationErrors((prev) =>
            prev.filter((error) => !error.includes("IP address"))
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, initialFormValues, editingServer, validateIpAddress]);

  // Watch form changes for general form state
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (initialFormValues && editingServer) {
        // Kiểm tra có thay đổi
        const hasChanges =
          values.hostname !== initialFormValues.hostname ||
          values.ip_address !== initialFormValues.ip_address ||
          values.os_version !== initialFormValues.os_version ||
          values.ssh_port !== initialFormValues.ssh_port ||
          values.ssh_user !== initialFormValues.ssh_user ||
          values.workload_id !== initialFormValues.workload_id ||
          (values.ssh_password !== "" &&
            values.ssh_password !== initialFormValues.ssh_password);

        console.log(" Form values changed:", {
          hasChanges,
          workload_id: values.workload_id,
          initial_workload_id: initialFormValues.workload_id,
        });

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
  }, [form, initialFormValues, formChanged, editingServer]);

  // Load server data when editing
  const loadServerData = useCallback(async () => {
    if (!editingServer) return;

    setLoadingServerData(true);
    setConnectionTested(false);
    setConnectionResult(null);
    setFormChanged(false);
    setValidationErrors([]);
    setFieldValidation({ hostname: true, ip_address: true });

    try {
      const server = await getServerById(editingServer.id);
      const serverValues = {
        hostname: server.hostname,
        ip_address: server.ip_address,
        os_version: server.os_version || "",
        ssh_port: server.ssh_port,
        ssh_user: server.ssh_user || "",
        ssh_password: server.ssh_password,
        workload_id: server.workload_id ?? 0,
      };

      form.reset(serverValues);
      setInitialFormValues(serverValues);
    } catch (error) {
      console.error(" Error loading server data:", error);
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

    // Kiểm tra validation errors trước khi test
    if (validationErrors.length > 0) {
      console.log(
        " Cannot test connection due to validation errors:",
        validationErrors
      );
      onSuccess("Vui lòng sửa các lỗi validation trước khi test connection");
      return;
    }

    setTestingConnection(true);
    try {
      const testData = {
        ip: values.ip_address,
        ssh_user: values.ssh_user,
        ssh_password: values.ssh_password,
        ssh_port: values.ssh_port,
      };

      const response = await api.post<ServerConnectionResult>(
        "/servers/test-single-connection",
        testData
      );

      if (response.status === "success") {
        setConnectionTested(true);
        setConnectionResult(response);
        onSuccess("Test connection thành công!");
        if (response.hostname && response.hostname !== values.hostname) {
          form.setValue("hostname", response.hostname);
        }
        if (response.os_version && response.os_version !== values.os_version) {
          form.setValue("os_version", response.os_version);
        }
      } else {
        setConnectionTested(true);
        setConnectionResult({
          ip: values.ip_address,
          ssh_user: values.ssh_user,
          ssh_port: values.ssh_port,
          status: "failed",
          message: response.message || "Connection test failed",
          error_details: response.error_details || "Unknown error",
        });
        onSuccess(
          `Lỗi test connection: ${response.message || "Không thể kết nối"}`
        );
      }
    } catch (error: any) {
      console.error(" Error testing connection:", error);
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
  }, [form, onSuccess, validationErrors]);

  // Close dialog function
  const handleClose = useCallback(() => {
    form.reset();
    setConnectionTested(false);
    setConnectionResult(null);
    setFormChanged(false);
    setInitialFormValues(null);
    setValidationErrors([]);
    setFieldValidation({ hostname: true, ip_address: true });
    onClose();
  }, [form, onClose]);

  // Submit form function
  const onSubmit = useCallback(
    async (values: ServerFormValues) => {
      if (!editingServer) return;

      // Kiểm tra validation errors
      if (validationErrors.length > 0) {
        console.log(
          " Cannot submit due to validation errors:",
          validationErrors
        );
        onSuccess("Vui lòng sửa các lỗi validation trước khi cập nhật");
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
          workload_id: values.workload_id,
        };

        // Only include password if provided
        if (values.ssh_password && values.ssh_password.trim()) {
          updateData.ssh_password = values.ssh_password;
        }

        await updateServer(editingServer.id, updateData);

        onSuccess("Cập nhật server thành công!");
        handleClose();
      } catch (error: any) {
        console.error(" Error updating server:", error);
        if (error.response?.status === 400) {
          onSuccess(`Lỗi validation: ${error.response.data.detail}`);
        } else {
          onSuccess(`Lỗi: ${error.message || "Không thể cập nhật server"}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [editingServer, updateServer, onSuccess, handleClose, validationErrors]
  );

  // Computed values
  const hasValidationErrors = validationErrors.length > 0;
  const validatingFields = validatingIpAddress;
  // co the test connection khi form thay doi va validate toan bo cac thuoc tinh
  const canTestConnection =
    formChanged && !hasValidationErrors && !validatingFields;

  // chi co the update sau khi test connection thanh conng
  const canUpdate =
    formChanged &&
    connectionTested &&
    connectionResult?.status === "success" &&
    !hasValidationErrors &&
    !validatingFields;

  return {
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

    // Validation states
    validatingFields,
    validationErrors,
    fieldValidation,
    hasValidationErrors,

    // Workload states
    workloads,
    loadingWorkloads,

    // Functions
    loadServerData,
    testConnection,
    onSubmit,
    handleClose,
  };
}

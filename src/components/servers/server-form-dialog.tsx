import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Server as ServerIcon,
  HelpCircle,
  Loader2,
  Monitor,
  Database,
  Shield,
  Network,
  Info,
} from "lucide-react";

import {
  Server,
  ServerCreate,
  ServerUpdate,
  ServerEnvironment,
  ServerStatus,
  ServerOSType,
} from "@/types/server";
import { useTranslation } from "react-i18next";

interface ServerFormData {
  name: string;
  hostname: string;
  ip_address: string;
  workload_id: number | "";
  server_role: string;
  os_type: ServerOSType | "";
  os_name: string;
  os_version: string;
  cpu_cores: number | "";
  memory_gb: number | "";
  environment: ServerEnvironment | "";
  status: ServerStatus;
  compliance_score: number | "";
  ssh_port: number | "";
  ssh_key_id: number | "";
  is_active: boolean;
}

interface ServerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingServer: Server | null;
  createServer: (data: ServerCreate) => Promise<Server>;
  updateServer: (id: number, data: ServerUpdate) => Promise<Server>;
  getServerById: (id: number) => Promise<Server>;
  onSuccess: () => void;
}

export function ServerFormDialog({
  open,
  onOpenChange,
  onClose,
  editingServer,
  createServer,
  updateServer,
  getServerById,
  onSuccess,
}: ServerFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation("server");

  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    hostname: "",
    ip_address: "",
    workload_id: "",
    server_role: "",
    os_type: "",
    os_name: "",
    os_version: "",
    cpu_cores: "",
    memory_gb: "",
    environment: "",
    status: ServerStatus.OFFLINE,
    compliance_score: "",
    ssh_port: 22,
    ssh_key_id: "",
    is_active: true,
  });

  // Reset form when dialog opens/closes or editing server changes
  useEffect(() => {
    if (open) {
      if (editingServer) {
        setInitialLoading(true);
        // Load server details
        const loadServerData = async () => {
          try {
            const serverData = await getServerById(editingServer.id);
            setFormData({
              name: serverData.name || "",
              hostname: serverData.hostname || "",
              ip_address: serverData.ip_address || "",
              workload_id: serverData.workload_id || "",
              server_role: serverData.server_role || "",
              os_type: (serverData.os_type as ServerOSType) || "",
              os_name: serverData.os_name || "",
              os_version: serverData.os_version || "",
              cpu_cores: serverData.cpu_cores || "",
              memory_gb: serverData.memory_gb || "",
              environment: (serverData.environment as ServerEnvironment) || "",
              status:
                (serverData.status as ServerStatus) || ServerStatus.OFFLINE,
              compliance_score: serverData.compliance_score || "",
              ssh_port: serverData.ssh_port || 22,
              ssh_key_id: serverData.ssh_key_id || "",
              is_active: serverData.is_active,
            });
          } catch (error) {
            console.error("Error loading server data:", error);
            toast.error("Failed to load server data");
          } finally {
            setInitialLoading(false);
          }
        };
        loadServerData();
      } else {
        setFormData({
          name: "",
          hostname: "",
          ip_address: "",
          workload_id: "",
          server_role: "",
          os_type: "",
          os_name: "",
          os_version: "",
          cpu_cores: "",
          memory_gb: "",
          environment: "",
          status: ServerStatus.OFFLINE,
          compliance_score: "",
          ssh_port: 22,
          ssh_key_id: "",
          is_active: true,
        });
        setInitialLoading(false);
      }
      setErrors({});
    }
  }, [open, editingServer, getServerById]);

  const updateField = (field: keyof ServerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Server name is required";
    }
    if (!formData.hostname.trim()) {
      newErrors.hostname = "Hostname is required";
    }
    if (!formData.ip_address.trim()) {
      newErrors.ip_address = "IP address is required";
    } else {
      // Basic IP validation
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip_address)) {
        newErrors.ip_address = "Invalid IP address format";
      }
    }
    if (!formData.workload_id) {
      newErrors.workload_id = "Workload is required";
    }
    if (!formData.environment) {
      newErrors.environment = "Environment is required";
    }
    if (!formData.os_type) {
      newErrors.os_type = "OS Type is required";
    }

    // Numeric validations
    if (
      formData.ssh_port &&
      (formData.ssh_port < 1 || formData.ssh_port > 65535)
    ) {
      newErrors.ssh_port = "SSH port must be between 1 and 65535";
    }
    if (
      formData.compliance_score &&
      (formData.compliance_score < 0 || formData.compliance_score > 100)
    ) {
      newErrors.compliance_score = "Compliance score must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        hostname: formData.hostname.trim(),
        ip_address: formData.ip_address.trim(),
        workload_id: Number(formData.workload_id),
        server_role: formData.server_role.trim() || undefined,
        os_type: formData.os_type as ServerOSType,
        os_name: formData.os_name.trim() || undefined,
        os_version: formData.os_version.trim() || undefined,
        cpu_cores: formData.cpu_cores ? Number(formData.cpu_cores) : undefined,
        memory_gb: formData.memory_gb ? Number(formData.memory_gb) : undefined,
        environment: formData.environment as ServerEnvironment,
        status: formData.status,
        compliance_score: formData.compliance_score
          ? Number(formData.compliance_score)
          : undefined,
        ssh_port: formData.ssh_port ? Number(formData.ssh_port) : undefined,
        ssh_key_id: formData.ssh_key_id
          ? Number(formData.ssh_key_id)
          : undefined,
        is_active: formData.is_active,
      };

      if (editingServer) {
        await updateServer(editingServer.id, submitData);
        toast.success("Server updated successfully");
      } else {
        await createServer(submitData as ServerCreate);
        toast.success("Server created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!editingServer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            {isEdit ? "Edit Server" : "Create New Server"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update server information and configuration"
              : "Add a new server to your infrastructure"}
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading server data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Server Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter server name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Hostname */}
                  <div className="space-y-2">
                    <Label htmlFor="hostname">
                      Hostname <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hostname"
                      value={formData.hostname}
                      onChange={(e) => updateField("hostname", e.target.value)}
                      placeholder="server.example.com"
                      className={errors.hostname ? "border-red-500" : ""}
                    />
                    {errors.hostname && (
                      <p className="text-sm text-red-600">{errors.hostname}</p>
                    )}
                  </div>

                  {/* IP Address */}
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">
                      IP Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) =>
                        updateField("ip_address", e.target.value)
                      }
                      placeholder="192.168.1.100"
                      className={errors.ip_address ? "border-red-500" : ""}
                    />
                    {errors.ip_address && (
                      <p className="text-sm text-red-600">
                        {errors.ip_address}
                      </p>
                    )}
                  </div>

                  {/* Workload */}
                  <div className="space-y-2">
                    <Label htmlFor="workload_id">
                      Workload <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.workload_id.toString()}
                      onValueChange={(value) =>
                        updateField("workload_id", Number(value))
                      }
                    >
                      <SelectTrigger
                        className={errors.workload_id ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select workload" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Web Servers</SelectItem>
                        <SelectItem value="2">Database Servers</SelectItem>
                        <SelectItem value="3">Application Servers</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.workload_id && (
                      <p className="text-sm text-red-600">
                        {errors.workload_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Server Role */}
                <div className="space-y-2">
                  <Label htmlFor="server_role">Server Role</Label>
                  <Input
                    id="server_role"
                    value={formData.server_role}
                    onChange={(e) => updateField("server_role", e.target.value)}
                    placeholder="Web Server, Database, Load Balancer, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Configuration */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-4 w-4" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Environment */}
                  <div className="space-y-2">
                    <Label htmlFor="environment">
                      Environment <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(value) =>
                        updateField("environment", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.environment ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServerEnvironment.PRODUCTION}>
                          Production
                        </SelectItem>
                        <SelectItem value={ServerEnvironment.STAGING}>
                          Staging
                        </SelectItem>
                        <SelectItem value={ServerEnvironment.DEVELOPMENT}>
                          Development
                        </SelectItem>
                        <SelectItem value={ServerEnvironment.TESTING}>
                          Testing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.environment && (
                      <p className="text-sm text-red-600">
                        {errors.environment}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServerStatus.ONLINE}>
                          Online
                        </SelectItem>
                        <SelectItem value={ServerStatus.OFFLINE}>
                          Offline
                        </SelectItem>
                        <SelectItem value={ServerStatus.MAINTENANCE}>
                          Maintenance
                        </SelectItem>
                        <SelectItem value={ServerStatus.ERROR}>
                          Error
                        </SelectItem>
                        <SelectItem value={ServerStatus.UNKNOWN}>
                          Unknown
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* OS Type */}
                  <div className="space-y-2">
                    <Label htmlFor="os_type">
                      OS Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.os_type}
                      onValueChange={(value) => updateField("os_type", value)}
                    >
                      <SelectTrigger
                        className={errors.os_type ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select OS type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServerOSType.LINUX}>
                          Linux
                        </SelectItem>
                        <SelectItem value={ServerOSType.WINDOWS}>
                          Windows
                        </SelectItem>
                        <SelectItem value={ServerOSType.UNIX}>Unix</SelectItem>
                        <SelectItem value={ServerOSType.MACOS}>
                          MacOS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.os_type && (
                      <p className="text-sm text-red-600">{errors.os_type}</p>
                    )}
                  </div>

                  {/* OS Name */}
                  <div className="space-y-2">
                    <Label htmlFor="os_name">OS Name</Label>
                    <Input
                      id="os_name"
                      value={formData.os_name}
                      onChange={(e) => updateField("os_name", e.target.value)}
                      placeholder="Ubuntu, CentOS, Windows Server, etc."
                    />
                  </div>

                  {/* OS Version */}
                  <div className="space-y-2">
                    <Label htmlFor="os_version">OS Version</Label>
                    <Input
                      id="os_version"
                      value={formData.os_version}
                      onChange={(e) =>
                        updateField("os_version", e.target.value)
                      }
                      placeholder="20.04, 8, 2019, etc."
                    />
                  </div>

                  {/* CPU Cores */}
                  <div className="space-y-2">
                    <Label htmlFor="cpu_cores">CPU Cores</Label>
                    <Input
                      id="cpu_cores"
                      type="number"
                      value={formData.cpu_cores}
                      onChange={(e) =>
                        updateField("cpu_cores", Number(e.target.value))
                      }
                      placeholder="4"
                      min="1"
                    />
                  </div>

                  {/* Memory */}
                  <div className="space-y-2">
                    <Label htmlFor="memory_gb">Memory (GB)</Label>
                    <Input
                      id="memory_gb"
                      type="number"
                      value={formData.memory_gb}
                      onChange={(e) =>
                        updateField("memory_gb", Number(e.target.value))
                      }
                      placeholder="8"
                      min="1"
                    />
                  </div>

                  {/* Compliance Score */}
                  <div className="space-y-2">
                    <Label htmlFor="compliance_score">
                      Compliance Score (%)
                    </Label>
                    <Input
                      id="compliance_score"
                      type="number"
                      value={formData.compliance_score}
                      onChange={(e) =>
                        updateField("compliance_score", Number(e.target.value))
                      }
                      placeholder="85"
                      min="0"
                      max="100"
                      className={
                        errors.compliance_score ? "border-red-500" : ""
                      }
                    />
                    {errors.compliance_score && (
                      <p className="text-sm text-red-600">
                        {errors.compliance_score}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SSH Configuration */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Network className="h-4 w-4" />
                  SSH Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SSH Port */}
                  <div className="space-y-2">
                    <Label htmlFor="ssh_port">SSH Port</Label>
                    <Input
                      id="ssh_port"
                      type="number"
                      value={formData.ssh_port}
                      onChange={(e) =>
                        updateField("ssh_port", Number(e.target.value))
                      }
                      placeholder="22"
                      min="1"
                      max="65535"
                      className={errors.ssh_port ? "border-red-500" : ""}
                    />
                    {errors.ssh_port && (
                      <p className="text-sm text-red-600">{errors.ssh_port}</p>
                    )}
                  </div>

                  {/* SSH Key */}
                  <div className="space-y-2">
                    <Label htmlFor="ssh_key_id">SSH Key</Label>
                    <Select
                      value={formData.ssh_key_id.toString()}
                      onValueChange={(value) =>
                        updateField("ssh_key_id", Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select SSH key" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="1">Production Key</SelectItem>
                        <SelectItem value="2">Development Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this server for operations
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      updateField("is_active", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || initialLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || initialLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Server" : "Create Server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

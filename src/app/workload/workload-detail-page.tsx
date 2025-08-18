// File: src/app/workload/workload-detail-page.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Server,
  Database,
  Globe,
  BarChart3,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Play,
  Pause,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { WorkloadType } from "@/types/workload";

// Mock data interfaces
interface WorkloadDetail {
  id: number;
  name: string;
  display_name: string;
  description: string;
  workload_type: WorkloadType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  compliance_standard: string;
  server_count: number;
  rule_count: number;
  last_scan: string;
  scan_status: "success" | "warning" | "error";
}

interface Rule {
  id: number;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  condition: string;
  action: string;
  is_enabled: boolean;
  last_execution: string;
  execution_status: "success" | "failed" | "pending";
}

interface Server {
  id: number;
  name: string;
  ip_address: string;
  os: string;
  status: "online" | "offline" | "maintenance";
  compliance_score: number;
  last_check: string;
}

// Mock data
const getMockWorkloadDetail = (id: string): WorkloadDetail => ({
  id: parseInt(id),
  name: `workload_${id}`,
  display_name: `Production Workload ${id}`,
  description:
    "Critical production workload handling customer data and business operations. Requires high security compliance and monitoring.",
  workload_type: WorkloadType.APP,
  is_active: true,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-08-15T14:20:00Z",
  created_by: "admin@company.com",
  compliance_standard: "ISO 27001",
  server_count: 12,
  rule_count: 45,
  last_scan: "2024-08-18T08:00:00Z",
  scan_status: "success",
});

const getMockRules = (): Rule[] => [
  {
    id: 1,
    name: "Password Policy Enforcement",
    description: "Ensure strong password policies are implemented",
    severity: "high",
    category: "Authentication",
    condition: "password_length >= 12 AND password_complexity == true",
    action: "Block access if password policy not met",
    is_enabled: true,
    last_execution: "2024-08-18T08:00:00Z",
    execution_status: "success",
  },
  {
    id: 2,
    name: "SSL/TLS Configuration",
    description: "Verify secure SSL/TLS configuration",
    severity: "critical",
    category: "Network Security",
    condition: "ssl_version >= 'TLSv1.2' AND weak_ciphers == false",
    action: "Disable weak SSL/TLS configurations",
    is_enabled: true,
    last_execution: "2024-08-18T08:05:00Z",
    execution_status: "success",
  },
  {
    id: 3,
    name: "File Permission Check",
    description: "Monitor sensitive file permissions",
    severity: "medium",
    category: "File System",
    condition: "file_permissions NOT LIKE '%777%'",
    action: "Alert and log permission violations",
    is_enabled: false,
    last_execution: "2024-08-17T22:00:00Z",
    execution_status: "failed",
  },
  {
    id: 4,
    name: "Service Account Monitoring",
    description: "Track service account activities",
    severity: "medium",
    category: "Access Control",
    condition: "service_account_activity == 'abnormal'",
    action: "Generate security alert",
    is_enabled: true,
    last_execution: "2024-08-18T07:45:00Z",
    execution_status: "pending",
  },
  {
    id: 5,
    name: "Database Encryption",
    description: "Ensure database encryption at rest",
    severity: "high",
    category: "Data Protection",
    condition: "database_encryption == true AND key_rotation <= 90_days",
    action: "Force encryption if not enabled",
    is_enabled: true,
    last_execution: "2024-08-18T06:30:00Z",
    execution_status: "success",
  },
];

const getMockServers = (): Server[] => [
  {
    id: 1,
    name: "prod-web-01",
    ip_address: "10.0.1.10",
    os: "Ubuntu 22.04 LTS",
    status: "online",
    compliance_score: 95,
    last_check: "2024-08-18T08:00:00Z",
  },
  {
    id: 2,
    name: "prod-web-02",
    ip_address: "10.0.1.11",
    os: "Ubuntu 22.04 LTS",
    status: "online",
    compliance_score: 92,
    last_check: "2024-08-18T08:02:00Z",
  },
  {
    id: 3,
    name: "prod-db-01",
    ip_address: "10.0.2.10",
    os: "CentOS 8",
    status: "maintenance",
    compliance_score: 88,
    last_check: "2024-08-17T23:45:00Z",
  },
  {
    id: 4,
    name: "prod-cache-01",
    ip_address: "10.0.3.10",
    os: "Redis Enterprise",
    status: "online",
    compliance_score: 98,
    last_check: "2024-08-18T08:01:00Z",
  },
];

// Helper functions
const getWorkloadIcon = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return <Server className="h-5 w-5" />;
    case WorkloadType.DATABASE:
      return <Database className="h-5 w-5" />;
    case WorkloadType.APP:
      return <Globe className="h-5 w-5" />;
    case WorkloadType.BIG_DATA:
      return <BarChart3 className="h-5 w-5" />;
    default:
      return <Server className="h-5 w-5" />;
  }
};

const getWorkloadTypeLabel = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "Operating System";
    case WorkloadType.DATABASE:
      return "Database";
    case WorkloadType.APP:
      return "Application";
    case WorkloadType.BIG_DATA:
      return "Big Data";
    default:
      return type;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "failed":
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "pending":
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
  }
};

const getServerStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "offline":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function WorkloadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("workload");

  const [workload, setWorkload] = useState<WorkloadDetail | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchWorkloadDetail = async () => {
      setLoading(true);
      try {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (id) {
          setWorkload(getMockWorkloadDetail(id));
          setRules(getMockRules());
          setServers(getMockServers());
        }
      } catch (error) {
        console.error("Error fetching workload detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkloadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-60 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!workload) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Workload Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The workload you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/workloads")} className="mt-4">
              Back to Workloads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/workloads")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                {getWorkloadIcon(workload.workload_type)}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl font-bold">
                    {workload.display_name}
                  </CardTitle>
                  <Badge
                    variant={workload.is_active ? "default" : "secondary"}
                    className="flex items-center space-x-1"
                  >
                    {workload.is_active ? (
                      <Play className="h-3 w-3" />
                    ) : (
                      <Pause className="h-3 w-3" />
                    )}
                    <span>{workload.is_active ? "Active" : "Inactive"}</span>
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {workload.description}
                </p>
              </div>
            </div>
            <Button className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Workload</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Servers
                </p>
                <p className="text-2xl font-bold">{workload.server_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rules
                </p>
                <p className="text-2xl font-bold">{workload.rule_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                {getWorkloadIcon(workload.workload_type)}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className="text-lg font-semibold">
                  {getWorkloadTypeLabel(workload.workload_type)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                {getStatusIcon(workload.scan_status)}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Scan
                </p>
                <p className="text-sm font-medium">
                  {formatDate(workload.last_scan)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="servers">Servers ({servers.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {workload.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </p>
                    <p className="text-sm">{workload.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type
                    </p>
                    <Badge variant="outline">
                      {getWorkloadTypeLabel(workload.workload_type)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant={workload.is_active ? "default" : "secondary"}
                    >
                      {workload.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm mt-1">{workload.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created by</p>
                      <p className="text-sm text-muted-foreground">
                        {workload.created_by}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created at</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workload.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workload.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Compliance Standard</p>
                      <Badge variant="outline">
                        {workload.compliance_standard}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage security rules and policies for this workload
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{rule.category}</Badge>
                          {getStatusIcon(rule.execution_status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rule.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Condition:
                            </p>
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {rule.condition}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Action:
                            </p>
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {rule.action}
                            </code>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                          <span>
                            Last execution: {formatDate(rule.last_execution)}
                          </span>
                          <span>Status: {rule.execution_status}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge
                          variant={rule.is_enabled ? "default" : "secondary"}
                        >
                          {rule.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Servers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Servers that are part of this workload
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servers.map((server) => (
                  <Card key={server.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{server.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {server.ip_address} • {server.os}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last check: {formatDate(server.last_check)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Compliance: {server.compliance_score}%
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${server.compliance_score}%` }}
                            ></div>
                          </div>
                        </div>
                        <Badge className={getServerStatusColor(server.status)}>
                          {server.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workload Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure workload settings and preferences
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">General Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Scan Frequency
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alert Level</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Critical Only</option>
                        <option>High and Critical</option>
                        <option>All Levels</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email alerts for rule violations
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Slack Integration</p>
                        <p className="text-sm text-muted-foreground">
                          Send alerts to Slack channels
                        </p>
                      </div>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

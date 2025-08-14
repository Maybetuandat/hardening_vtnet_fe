// src/app/infrastructure/servers/servers-page.tsx
import React from "react";
import {
  Server,
  Plus,
  RefreshCw,
  Monitor,
  Activity,
  Terminal,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Demo data
const servers = [
  {
    id: 1,
    name: "web-prod-01",
    hostname: "web-prod-01.company.com",
    ip: "192.168.1.10",
    os: "Ubuntu 24.04",
    workload: "Web Application",
    status: "online",
    lastSeen: "2 mins ago",
    sshKey: "prod-key-01",
  },
  {
    id: 2,
    name: "db-master",
    hostname: "db-master.company.com",
    ip: "192.168.1.20",
    os: "CentOS 8",
    workload: "Oracle Database",
    status: "online",
    lastSeen: "5 mins ago",
    sshKey: "db-key-01",
  },
  {
    id: 3,
    name: "elastic-node-01",
    hostname: "elastic-01.company.com",
    ip: "192.168.1.30",
    os: "Ubuntu 24.04",
    workload: "Elasticsearch Cluster",
    status: "offline",
    lastSeen: "2 hours ago",
    sshKey: "elastic-key",
  },
  {
    id: 4,
    name: "web-staging-01",
    hostname: "staging-01.company.com",
    ip: "192.168.1.40",
    os: "Ubuntu 24.04",
    workload: "Web Application",
    status: "unknown",
    lastSeen: "1 day ago",
    sshKey: "staging-key",
  },
  {
    id: 5,
    name: "centos-base-01",
    hostname: "centos-01.company.com",
    ip: "192.168.1.50",
    os: "CentOS 8",
    workload: "CentOS Base",
    status: "online",
    lastSeen: "1 min ago",
    sshKey: "centos-key",
  },
];

const ServersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [workloadFilter, setWorkloadFilter] = React.useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "offline":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case "unknown":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "offline":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "unknown":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ip.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || server.status === statusFilter;
    const matchesWorkload =
      workloadFilter === "all" || server.workload === workloadFilter;

    return matchesSearch && matchesStatus && matchesWorkload;
  });

  return (
    <div className="min-h-screen w-full px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Servers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your infrastructure servers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {servers.filter((s) => s.status === "online").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Monitor className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {servers.filter((s) => s.status === "offline").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unknown</CardTitle>
            <Monitor className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {servers.filter((s) => s.status === "unknown").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search servers by name, hostname, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          <Select value={workloadFilter} onValueChange={setWorkloadFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Workload" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workloads</SelectItem>
              <SelectItem value="Web Application">Web Application</SelectItem>
              <SelectItem value="Oracle Database">Oracle Database</SelectItem>
              <SelectItem value="Elasticsearch Cluster">
                Elasticsearch Cluster
              </SelectItem>
              <SelectItem value="CentOS Base">CentOS Base</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Servers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Server List</CardTitle>
          <CardDescription>
            Monitor and manage your infrastructure servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {server.hostname}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{server.ip}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{server.os}</Badge>
                  </TableCell>
                  <TableCell>{server.workload}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(server.status)}
                      <Badge
                        variant="secondary"
                        className={getStatusColor(server.status)}
                      >
                        {server.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {server.lastSeen}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No servers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" || workloadFilter !== "all"
              ? "No servers match your current filters"
              : "Add your first server to get started"}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServersPage;

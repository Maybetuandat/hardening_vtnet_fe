import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Globe,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Play,
} from "lucide-react";
import { Workload, WorkloadType } from "@/types/workload";
import { useTranslation } from "react-i18next";

interface WorkloadCardProps {
  workload: Workload;
  onEdit: (workload: Workload) => void;
  onDelete: (workload: Workload) => void;
  onView: (workload: Workload) => void;
  onDeploy: (workload: Workload) => void;
}

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
      return "OS";
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

const getWorkloadTypeColor = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case WorkloadType.DATABASE:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case WorkloadType.APP:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case WorkloadType.BIG_DATA:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getComplianceStandard = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "CIS Benchmarks";
    case WorkloadType.DATABASE:
      return "PCI DSS";
    case WorkloadType.APP:
      return "ISO 27001";
    case WorkloadType.BIG_DATA:
      return "Custom";
    default:
      return "Standard";
  }
};

const getServerCount = (workload: Workload) => {
  // Mock data - trong thực tế sẽ lấy từ API
  const counts = {
    [WorkloadType.OS]: Math.floor(Math.random() * 5) + 1,
    [WorkloadType.DATABASE]: 1,
    [WorkloadType.APP]: Math.floor(Math.random() * 4) + 2,
    [WorkloadType.BIG_DATA]: Math.floor(Math.random() * 3) + 2,
  };
  return counts[workload.workload_type] || 1;
};

export default function WorkloadCard({
  workload,
  onEdit,
  onDelete,
  onView,
  onDeploy,
}: WorkloadCardProps) {
  const { t } = useTranslation("workload");
  const serverCount = getServerCount(workload);

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header with icon and type */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              {getWorkloadIcon(workload.workload_type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {workload.display_name || workload.name}
              </h3>
              <Badge
                variant="secondary"
                className={`mt-1 ${getWorkloadTypeColor(
                  workload.workload_type
                )}`}
              >
                {getWorkloadTypeLabel(workload.workload_type)}
              </Badge>
            </div>
          </div>

          <Badge
            variant={workload.is_active ? "default" : "secondary"}
            className={workload.is_active ? "bg-green-500" : "bg-gray-500"}
          >
            {workload.is_active ? "active" : "inactive"}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {workload.description || "No description provided"}
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Servers:</span>
            <span className="font-medium">{serverCount} servers</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Compliance:</span>
            <span className="font-medium">
              {getComplianceStandard(workload.workload_type)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(workload)}
            className="flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(workload)}
            className="flex items-center justify-center"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>

          <Button
            className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600"
            size="sm"
            onClick={() => onDeploy(workload)}
          >
            <Play className="h-4 w-4" />
            <span className="sr-only">Deploy</span>
          </Button>
        </div>

        {/* Delete button separately */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(workload)}
          className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

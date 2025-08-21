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
  Monitor,
  HardDrive,
  Cloud,
  Layers,
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Workload } from "@/types/workload";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

interface WorkloadCardProps {
  workload: Workload;
  onEdit: (workload: Workload) => void;
  onDelete: (workload: Workload) => void;
  getNumberOfServersByWorkload: (workloadId: number) => Promise<number>;
}

/**
 * Lấy icon phù hợp cho workload (mặc định là security-focused)
 */
const getWorkloadIcon = () => {
  return <Shield className="h-6 w-6 text-primary" />;
};

/**
 * Lấy màu badge cho status
 */
const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300"
    : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300";
};

/**
 * Format date cho hiển thị
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format time ago
 */
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
};

export default function WorkloadCard({
  workload,
  onEdit,
  onDelete,
  getNumberOfServersByWorkload,
}: WorkloadCardProps) {
  const { t } = useTranslation("workload");
  const navigate = useNavigate();
  const [serverCount, setServerCount] = useState<number | null>(null);
  const [ruleCount, setRuleCount] = useState<number>(0);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch server count
        const count = await getNumberOfServersByWorkload(workload.id || 0);
        setServerCount(count);

        // TODO: Fetch rule count from API when available
        // const rules = await getRulesByWorkload(workload.id);
        // setRuleCount(rules.length);
        setRuleCount(0); // Placeholder
      } catch (error) {
        console.error("Error fetching counts:", error);
        setServerCount(0);
        setRuleCount(0);
      }
    };

    fetchCounts();
  }, [workload.id, getNumberOfServersByWorkload]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on action buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/workload/${workload.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(workload);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(workload);
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50 border-l-4 border-l-primary/20"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Icon */}
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
              {getWorkloadIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors mb-1">
                    {workload.name}
                  </h3>

                  {/* Description */}
                  {workload.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {workload.description}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={`ml-3 flex-shrink-0 ${getStatusColor(true)}`} // Assuming workload is active, adjust based on your data structure
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {serverCount !== null ? serverCount : "..."}
                    </p>
                    <p className="text-xs text-muted-foreground">Servers</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ruleCount}</p>
                    <p className="text-xs text-muted-foreground">Rules</p>
                  </div>
                </div>
              </div>

              {/* Tags/Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  Security Compliance
                </Badge>
                <Badge variant="outline" className="text-xs">
                  CIS Benchmark
                </Badge>
              </div>

              {/* Timestamps */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {/* <span>Tạo: {formatDate(workload.created_at)}</span>
                    <span>Cập nhật: {getTimeAgo(workload.updated_at)}</span> */}
                  </div>

                  {/* Quick Status Indicator */}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center space-x-1 hover:bg-primary/10 hover:border-primary/50"
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Sửa</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        </div>

        {/* Click hint */}
        <div className="mt-3 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-center">
          Click để xem chi tiết workload
        </div>
      </CardContent>
    </Card>
  );
}

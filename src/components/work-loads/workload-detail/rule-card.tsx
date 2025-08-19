// File: src/components/work-loads/workload-detail/rule-card.tsx

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Rule } from "@/types/workload-detail";
import {
  formatDate,
  getExecutionStatusColor,
  getSeverityColor,
} from "@/utils/workload-utils";

interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onEdit }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        !rule.is_enabled ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(rule.severity)}
                  <h3 className="font-semibold text-lg">{rule.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={getSeverityColor(rule.severity)}
                  >
                    {rule.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{rule.category}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-muted-foreground">Enabled</span>
                  <Switch
                    checked={rule.is_enabled}
                    onCheckedChange={() => {
                      // Handle toggle enable/disable
                      console.log(`Toggle rule ${rule.id} enabled state`);
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(rule)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{rule.description}</p>

            {/* Condition and Action */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Condition:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {rule.condition}
                </code>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Action:</p>
                <p className="text-sm text-muted-foreground">{rule.action}</p>
              </div>
            </div>

            {/* Execution Status */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(rule.execution_status)}
                  <span className="text-sm">Last execution:</span>
                  <Badge
                    variant="outline"
                    className={getExecutionStatusColor(rule.execution_status)}
                  >
                    {rule.execution_status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(rule.last_execution)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

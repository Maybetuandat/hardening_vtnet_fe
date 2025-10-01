// src/components/notification/notification-card.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Trash2,
  Eye,
} from "lucide-react";
import { Notification } from "@/hooks/notifications/use-notifications";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case "compliance_completed":
      case "rule_change_approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "compliance_failed":
      case "rule_change_rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "rule_change_request":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case "compliance_completed":
        return "Scan Completed";
      case "compliance_failed":
        return "Scan Failed";
      case "rule_change_request":
        return "Rule Request";
      case "rule_change_approved":
        return "Request Approved";
      case "rule_change_rejected":
        return "Request Rejected";
      default:
        return "Notification";
    }
  };

  const getTypeBadgeVariant = () => {
    switch (notification.type) {
      case "compliance_completed":
      case "rule_change_approved":
        return "default";
      case "compliance_failed":
      case "rule_change_rejected":
        return "destructive";
      case "rule_change_request":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleNotificationClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    switch (notification.type) {
      case "rule_change_request":
      case "rule_change_approved":
      case "rule_change_rejected":
        const params = new URLSearchParams();

        if (notification.meta_data?.workload_id) {
          params.append(
            "workloadId",
            notification.meta_data.workload_id.toString()
          );
        }
        if (notification.meta_data?.rule_name) {
          params.append("ruleName", notification.meta_data.rule_name);
        }
        if (notification.meta_data?.request_id) {
          params.append(
            "requestId",
            notification.meta_data.request_id.toString()
          );
        }

        navigate(`/requests?${params.toString()}`);
        break;

      case "compliance_completed":
      case "compliance_failed":
        if (notification.meta_data?.compliance_id) {
          navigate(`/compliance/${notification.meta_data.compliance_id}`);
        }
        break;

      default:
        navigate("/notifications");
        break;
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        !notification.is_read && "border-l-4 border-l-primary bg-primary/5"
      )}
      onClick={handleNotificationClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={getTypeBadgeVariant() as any}
                    className="text-xs"
                  >
                    {getTypeLabel()}
                  </Badge>
                  {!notification.is_read && (
                    <Badge variant="default" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium mt-1 break-words">
                  {notification.title}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(notification.created_at), "MMM dd, HH:mm")}
              </span>
            </div>

            {notification.message && (
              <p className="text-sm text-muted-foreground break-words">
                {notification.message}
              </p>
            )}

            {notification.meta_data && (
              <div className="text-xs text-muted-foreground space-y-1">
                {notification.meta_data.workload_name && (
                  <div>
                    <span className="font-medium">Workload:</span>{" "}
                    {notification.meta_data.workload_name}
                  </div>
                )}
                {notification.meta_data.rule_name && (
                  <div>
                    <span className="font-medium">Rule:</span>{" "}
                    {notification.meta_data.rule_name}
                  </div>
                )}
                {notification.meta_data.requester_username && (
                  <div>
                    <span className="font-medium">Requester:</span>{" "}
                    {notification.meta_data.requester_username}
                  </div>
                )}
                {notification.meta_data.admin_username && (
                  <div>
                    <span className="font-medium">Admin:</span>{" "}
                    {notification.meta_data.admin_username}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Mark as Read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

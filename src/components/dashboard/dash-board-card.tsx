import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  isLoading = false,
}: DashboardCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconColor: "text-green-600",
          borderColor: "border-l-green-500",
          progressColor: "bg-green-500",
        };
      case "warning":
        return {
          iconColor: "text-red-600",
          borderColor: "border-l-red-500",
          progressColor: "bg-red-500",
        };
      case "info":
        return {
          iconColor: "text-blue-600",
          borderColor: "border-l-blue-500",
          progressColor: "bg-blue-500",
        };
      default:
        return {
          iconColor: "text-gray-600",
          borderColor: "border-l-gray-500",
          progressColor: "bg-gray-500",
        };
    }
  };

  const styles = getVariantStyles();
  const isComplianceRate =
    title === "Đánh giá chung" || title === "Overall assessment";

  if (isLoading) {
    return (
      <Card className={cn("border-l-4", styles.borderColor)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-md transition-shadow",
        styles.borderColor
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("p-1", styles.iconColor)}>{icon}</div>
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>

          {/* Hiển thị progress bar cho Compliance Rate */}
          {isComplianceRate && value !== "..." && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    styles.progressColor
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, parseFloat(value) || 0)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-muted-foreground leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

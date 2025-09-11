import React from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ParametersDisplayProps {
  parameters?: Record<string, any>;
}

// Component để hiển thị parameters đầy đủ
const ParametersDisplay: React.FC<ParametersDisplayProps> = ({
  parameters,
}) => {
  const { t } = useTranslation("workload");

  if (!parameters || Object.keys(parameters).length === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        {t("workloadDetail.rules.table.noParameters")}
      </span>
    );
  }

  // Hàm xác định type & màu sắc
  const getParameterType = (val: any) => {
    if (typeof val === "string")
      return { type: "string", color: "bg-blue-100 text-blue-800" };
    if (typeof val === "number")
      return { type: "number", color: "bg-purple-100 text-purple-800" };
    if (typeof val === "boolean")
      return { type: "boolean", color: "bg-orange-100 text-orange-800" };
    if (Array.isArray(val))
      return { type: "array", color: "bg-pink-100 text-pink-800" };
    if (typeof val === "object")
      return { type: "object", color: "bg-gray-100 text-gray-800" };
    return { type: "unknown", color: "bg-gray-100 text-gray-800" };
  };

  // Hàm format giá trị hiển thị
  const formatValue = (val: any) => {
    if (typeof val === "string") return val;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (Array.isArray(val)) return `[${val.join(", ")}]`;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="space-y-1">
      {Object.entries(parameters).map(([key, value]) => {
        const { color } = getParameterType(value);
        return (
          <div key={key} className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className={`text-xs ${color} border-0`}>
              {key}
            </Badge>
            <span className="text-xs text-muted-foreground">:</span>
            <span className="text-xs break-all">{formatValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ParametersDisplay;

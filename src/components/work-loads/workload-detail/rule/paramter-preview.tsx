import { Settings, FileText, Hash } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
export const ParametersPreview: React.FC<{ parameters: any }> = ({
  parameters,
}) => {
  if (!parameters) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Hash className="h-3.5 w-3.5" />
        <span className="text-sm">Không có tham số</span>
      </div>
    );
  }

  if (typeof parameters === "string") {
    const truncated =
      parameters.length > 30 ? `${parameters.substring(0, 30)}...` : parameters;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <code className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                {truncated}
              </code>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-md">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Parameters (String)</p>
              <div className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {parameters}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (typeof parameters === "object" && parameters !== null) {
    const entries = Object.entries(parameters);

    if (entries.length === 0) {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          <span className="text-sm">Trống</span>
        </div>
      );
    }

    const paramCount = entries.length;
    const firstKey = entries[0]?.[0];
    const displayText = paramCount === 1 ? firstKey : `${paramCount} tham số`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <Settings className="h-3.5 w-3.5 text-green-600" />
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-50 text-xs px-2 py-0.5"
                >
                  {displayText}
                </Badge>
                {paramCount > 1 && (
                  <span className="text-xs text-muted-foreground">
                    (+{paramCount - 1})
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-md">
            <div className="space-y-2">
              <p className="font-semibold text-sm">
                Parameters ({paramCount} items)
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {entries.map(([key, value], index) => (
                  <div key={key} className="bg-muted p-2 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600">
                        {key}:
                      </span>
                    </div>
                    <div className="text-xs font-mono bg-background p-1.5 rounded border">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fallback cho các type khác
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <FileText className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded">
              {String(parameters).substring(0, 20)}...
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Parameters</p>
            <div className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {String(parameters)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

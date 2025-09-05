import React from "react";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RuleResponse } from "@/types/rule";

interface RulesTableProps {
  rules: RuleResponse[];
  selectedRuleId: number | null;
  onRuleSelect: (ruleId: number) => void;
  onEditRule: (rule: RuleResponse) => void;
  onDeleteRule: (rule: RuleResponse) => void;
}

// Component để hiển thị parameters đầy đủ
const ParametersDisplay: React.FC<{ parameters?: Record<string, any> }> = ({
  parameters,
}) => {
  if (!parameters || Object.keys(parameters).length === 0) {
    return (
      <span className="text-muted-foreground text-sm">Không có tham số</span>
    );
  }

  return (
    <div className="space-y-1">
      {Object.entries(parameters).map(([key, value]) => {
        // Xác định loại parameter và màu sắc
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

        const { type, color } = getParameterType(value);

        // Format giá trị để hiển thị
        const formatValue = (val: any) => {
          if (typeof val === "string") return val;
          if (typeof val === "boolean") return val ? "true" : "false";
          if (Array.isArray(val)) return `[${val.join(", ")}]`;
          if (typeof val === "object") return JSON.stringify(val);
          return String(val);
        };

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

export const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  selectedRuleId,
  onRuleSelect,
  onEditRule,
  onDeleteRule,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Tên</TableHead>
            <TableHead className="w-[250px]">Command</TableHead>
            <TableHead className="w-[250px]">Parameters</TableHead>
            <TableHead className="w-[40px]">Trạng thái</TableHead>
            <TableHead className="w-[10px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow
              key={rule.id}
              className={`cursor-pointer ${
                selectedRuleId === rule.id ? "bg-muted" : ""
              }`}
              onClick={() => onRuleSelect(rule.id)}
            >
              <TableCell className="align-top">
                <div>
                  <p className="font-medium break-words">{rule.name}</p>
                </div>
              </TableCell>

              <TableCell className="align-top">
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-xs"
                >
                  {rule.command}
                </Badge>
              </TableCell>

              <TableCell className="align-top">
                <ParametersDisplay parameters={rule.parameters} />
              </TableCell>

              <TableCell className="align-top">
                <Badge
                  variant="secondary"
                  className={
                    rule.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {rule.is_active ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </TableCell>

              <TableCell className="align-top">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRule(rule);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRule(rule);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

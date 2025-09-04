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
import { ParametersPreview } from "./paramter-preview";

interface RulesTableProps {
  rules: RuleResponse[];
  selectedRuleId: number | null;
  onRuleSelect: (ruleId: number) => void;
  onEditRule: (rule: RuleResponse) => void;
  onDeleteRule: (rule: RuleResponse) => void;
}

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
            <TableHead>Tên</TableHead>
            <TableHead>Parameters</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
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
              <TableCell>
                <div>
                  <p className="font-medium">{rule.name}</p>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {rule.description}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <ParametersPreview parameters={rule.parameters} />
              </TableCell>

              <TableCell>
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

              <TableCell>
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
                        onRuleSelect(rule.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem Commands
                    </DropdownMenuItem>
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

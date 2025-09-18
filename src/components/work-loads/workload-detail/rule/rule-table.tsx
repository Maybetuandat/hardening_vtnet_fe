import React from "react";
import { Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useTranslation } from "react-i18next";
import { AdminOnly, UserOnly } from "@/components/auth/role-guard";
import { RuleResponse } from "@/types/rule";
import ParametersDisplay from "./parameter-display";

interface RulesTableProps {
  rules: RuleResponse[];
  selectedRuleId: number | null;
  onRuleSelect: (ruleId: number) => void;
  onEditRule: (rule: RuleResponse) => void;
  onDeleteRule: (rule: RuleResponse) => void;
  onViewRule: (rule: RuleResponse) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  selectedRuleId,
  onRuleSelect,
  onEditRule,
  onDeleteRule,
  onViewRule,
}) => {
  const { t } = useTranslation("workload");

  // Hàm để lấy style cho badge status dựa trên trạng thái
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
    }
  };

  // Hàm để lấy text hiển thị cho status
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("workloadDetail.rules.table.status.active");
      case "inactive":
        return t("workloadDetail.rules.table.status.inactive");
      case "pending":
        return t("workloadDetail.rules.table.status.pending");
      default:
        return status;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              {t("workloadDetail.rules.table.columns.name")}
            </TableHead>
            <TableHead className="w-[250px]">
              {t("workloadDetail.rules.table.columns.command")}
            </TableHead>
            <TableHead className="w-[250px]">
              {t("workloadDetail.rules.table.columns.parameters")}
            </TableHead>
            <TableHead className="w-[40px]">
              {t("workloadDetail.rules.table.columns.status")}
            </TableHead>
            <TableHead className="w-[10px]">
              {t("workloadDetail.rules.table.columns.actions")}
            </TableHead>
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
                <p className="font-medium break-words">{rule.name}</p>
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
                  variant="outline"
                  className={getStatusBadgeStyle(rule.is_active)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        rule.is_active === "active"
                          ? "bg-green-500"
                          : rule.is_active === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {getStatusText(rule.is_active)}
                  </div>
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
                        onViewRule(rule);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("workloadDetail.rules.table.actions.view")}
                    </DropdownMenuItem>

                    <UserOnly>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRule(rule);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("workloadDetail.rules.table.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRule(rule);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("workloadDetail.rules.table.actions.delete")}
                      </DropdownMenuItem>
                    </UserOnly>
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

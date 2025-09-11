import React from "react";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { RuleResponse } from "@/types/rule";
import ParametersDisplay from "./parameter-display";

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
  const { t } = useTranslation("workload");

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
                  variant="secondary"
                  className={
                    rule.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {rule.is_active
                    ? t("workloadDetail.rules.table.status.active")
                    : t("workloadDetail.rules.table.status.inactive")}
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

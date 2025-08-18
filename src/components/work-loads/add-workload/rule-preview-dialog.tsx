// src/components/add-workload/rule-preview-dialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Rule, RuleSeverity, RuleType } from "@/types/rule";

interface RulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: Rule[];
}

const getSeverityIcon = (severity: RuleSeverity) => {
  switch (severity) {
    case RuleSeverity.LOW:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case RuleSeverity.MEDIUM:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case RuleSeverity.HIGH:
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case RuleSeverity.CRITICAL:
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getSeverityColor = (severity: RuleSeverity) => {
  switch (severity) {
    case RuleSeverity.LOW:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case RuleSeverity.MEDIUM:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case RuleSeverity.HIGH:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case RuleSeverity.CRITICAL:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getRuleTypeIcon = (type: RuleType) => {
  switch (type) {
    case RuleType.SECURITY:
      return <Shield className="h-4 w-4" />;
    case RuleType.PERFORMANCE:
      return <Activity className="h-4 w-4" />;
    case RuleType.COMPLIANCE:
      return <CheckCircle className="h-4 w-4" />;
    case RuleType.MONITORING:
      return <Activity className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

export function RulePreviewDialog({
  open,
  onOpenChange,
  rules,
}: RulePreviewDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const categories = Array.from(new Set(rules.map((rule) => rule.category)));
  const severities = Object.values(RuleSeverity);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchTerm === "" ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === "all" || rule.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Rules Preview</DialogTitle>
          <DialogDescription>
            Review the {rules.length} rules that will be imported for this
            workload.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="all">All Severities</option>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rules List */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {filteredRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rules match your current filters.
              </div>
            ) : (
              filteredRules.map((rule, index) => (
                <Card
                  key={index}
                  className={cn(
                    "transition-shadow hover:shadow-md",
                    !rule.is_active && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getRuleTypeIcon(rule.rule_type)}
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        {!rule.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.category}
                        </Badge>
                        <Badge
                          className={`text-xs ${getSeverityColor(
                            rule.severity
                          )}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getSeverityIcon(rule.severity)}
                            <span>{rule.severity.toUpperCase()}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {rule.description && (
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">
                            Condition:
                          </p>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {rule.condition}
                          </code>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">
                            Action:
                          </p>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {rule.action}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRules.length} of {rules.length} rules
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

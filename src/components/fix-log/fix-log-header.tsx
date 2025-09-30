// src/components/fix-logs/fix-log-header.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FixLogHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function FixLogHeader({
  onBack,
  onRefresh,
  loading,
}: FixLogHeaderProps) {
  const { t } = useTranslation("fixLog");

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("header.back", { defaultValue: "Back" })}
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("header.title", { defaultValue: "Fix Action Logs" })}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("header.subtitle", {
              defaultValue: "View and track all fix action history and changes",
            })}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {t("header.refresh", { defaultValue: "Refresh" })}
      </Button>
    </div>
  );
}

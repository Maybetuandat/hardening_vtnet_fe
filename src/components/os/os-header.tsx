import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Monitor } from "lucide-react";
import { AdminOnly } from "@/components/auth/role-guard";

interface OSHeaderProps {
  onRefresh: () => void;
  onAddClick: () => void;
  loading?: boolean;
}

export const OSHeader: React.FC<OSHeaderProps> = ({
  onRefresh,
  onAddClick,
  loading = false,
}) => {
  const { t } = useTranslation("os");

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Monitor className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("osHeader.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("osHeader.description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("osHeader.refreshButton")}
          </Button>

          {/* Chỉ admin mới thấy nút Add */}
          {/* <AdminOnly>
            <Button onClick={onAddClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t("osHeader.addButton")}
            </Button>
          </AdminOnly> */}
        </div>
      </div>
    </div>
  );
};

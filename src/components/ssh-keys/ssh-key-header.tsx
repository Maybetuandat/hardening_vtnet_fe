import { Key, RefreshCw, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { CardHeader, CardTitle, CardDescription } from "../ui/card";
import { useTranslation } from "react-i18next";

interface HeaderSshKeyManagementProps {
  onAdd: () => void;
  onRefresh: () => void;
  loading: boolean;
}
export default function HeaderSshKeyManagement({
  onAdd,
  onRefresh,
  loading,
}: HeaderSshKeyManagementProps) {
  const { t } = useTranslation("sshkey");
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("sshKeys.title")}
          </CardTitle>
          <CardDescription className="mt-4">
            {t("sshKeys.subtitle")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("sshKeys.refresh")}
          </Button>
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("sshKeys.addSshKey")}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}

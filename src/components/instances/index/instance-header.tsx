import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Upload,
  Server as ServerIcon,
  Database,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ServerHeaderProps {
  onRefresh: () => void;
  onSyncDCIM?: () => void;
  loading: boolean;
  syncing?: boolean;
}

export const InstanceHeader: React.FC<ServerHeaderProps> = ({
  onRefresh,
  onSyncDCIM,
  loading,
  syncing = false,
}) => {
  const { t } = useTranslation("instance");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSyncClick = () => {
    if (onSyncDCIM) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSync = () => {
    setShowConfirmDialog(false);
    if (onSyncDCIM) {
      onSyncDCIM();
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ServerIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {t("instanceHeader.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("instanceHeader.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSyncClick}
              disabled={loading || syncing}
              className="flex items-center gap-2"
            >
              <Database
                className={`h-4 w-4 ${syncing ? "animate-pulse" : ""}`}
              />
              {syncing
                ? t("instanceHeader.syncing")
                : t("instanceHeader.syncDCIMButton")}
            </Button>

            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {t("instanceHeader.refreshButton")}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              {t("dcimSync.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t("dcimSync.confirmDescription")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dcimSync.confirmNote")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={syncing}>
              {t("dcimSync.cancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSync}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Database className="mr-2 h-4 w-4" />
              {t("dcimSync.confirmButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

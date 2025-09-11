import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Clock, Save, Pause, AlertCircle, CheckCircle } from "lucide-react";

import { useScheduler } from "../../hooks/scheduler/use-scheduler";
import { toast } from "sonner";
import { Button } from "../ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import TimePicker from "../ui/time-picker";

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("dashboard");
  const {
    loading,
    error,
    scheduleInfo,
    getScanSchedule,
    updateScanSchedule,
    disableScanSchedule,
    clearError,
  } = useScheduler();

  const [formData, setFormData] = useState({
    scan_time: "00:00",
    is_enabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      getScanSchedule();
    }
  }, [isOpen, getScanSchedule]);

  useEffect(() => {
    if (scheduleInfo) {
      setFormData({
        scan_time: scheduleInfo.scan_time,
        is_enabled: scheduleInfo.is_enabled,
      });
    }
  }, [scheduleInfo]);

  const handleSave = async () => {
    const success = await updateScanSchedule(formData);
    if (success) {
      toast.success(t("scheduleDialog.messages.updateSuccess"));
      onClose();
    } else {
      toast.error(t("scheduleDialog.messages.updateError"));
    }
  };

  const handleDisable = async () => {
    const success = await disableScanSchedule();
    if (success) {
      toast.success(t("scheduleDialog.messages.disableSuccess"));
      onClose();
    } else {
      toast.error(t("scheduleDialog.messages.disableError"));
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return t("scheduleDialog.noData");
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              {t("scheduleDialog.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Current Status */}
            {scheduleInfo && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("scheduleDialog.currentStatus")}
                  </span>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      scheduleInfo.is_enabled
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {scheduleInfo.is_enabled ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    {scheduleInfo.is_enabled
                      ? t("scheduleDialog.statusActive")
                      : t("scheduleDialog.statusInactive")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("scheduleDialog.nextRun")}
                    </span>
                    <p className="font-medium">
                      {formatDateTime(scheduleInfo.next_run)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("scheduleDialog.lastRun")}
                    </span>
                    <p className="font-medium">
                      {formatDateTime(scheduleInfo.last_run)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Time Picker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("scheduleDialog.selectTime")}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.is_enabled}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_enabled: e.target.checked,
                      }))
                    }
                    className="rounded border-input"
                  />
                  <label htmlFor="enabled" className="text-sm">
                    {t("scheduleDialog.enable")}
                  </label>
                </div>
              </div>

              <TimePicker
                value={formData.scan_time}
                onChange={(time) =>
                  setFormData((prev) => ({ ...prev, scan_time: time }))
                }
                disabled={!formData.is_enabled}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {scheduleInfo?.is_enabled && (
                <Button
                  variant="outline"
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {t("scheduleDialog.actions.disable")}
                </Button>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                {t("scheduleDialog.actions.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {t("scheduleDialog.actions.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleDialog;

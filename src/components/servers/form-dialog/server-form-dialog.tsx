import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Server, ServerUpdate } from "@/types/server";
import { useServerForm } from "@/hooks/server/use-server-form";

interface ServerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingServer: Server | null;
  updateServer: (id: number, data: ServerUpdate) => Promise<Server>;
  getServerById: (id: number) => Promise<Server>;
  onSuccess: (message: string) => void;
}

export const ServerFormDialog: React.FC<ServerFormDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  editingServer,
  updateServer,
  getServerById,
  onSuccess,
}) => {
  const { t } = useTranslation("server");

  const {
    form,
    loading,
    loadingServerData,
    testingConnection,
    connectionTested,
    connectionResult,
    formChanged,
    canTestConnection,
    canUpdate,
    validatingFields,
    validationErrors,
    fieldValidation,
    hasValidationErrors,
    workloads,
    loadingWorkloads,
    loadServerData,
    testConnection,
    onSubmit,
    handleClose,
  } = useServerForm({
    editingServer,
    updateServer,
    getServerById,
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (editingServer && open) {
      loadServerData();
    }
  }, [editingServer, open, loadServerData]);

  if (!editingServer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("serverFormDialog.title")}</DialogTitle>
        </DialogHeader>

        {loadingServerData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t("serverFormDialog.loadingData")}</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.hostname")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "serverFormDialog.placeholders.hostname"
                          )}
                          {...field}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.ipAddress")}
                        {validatingFields && (
                          <Clock className="inline h-3 w-3 ml-1 animate-spin" />
                        )}
                        {!fieldValidation.ip_address && (
                          <XCircle className="inline h-3 w-3 ml-1 text-red-500" />
                        )}
                        {fieldValidation.ip_address && formChanged && (
                          <CheckCircle className="inline h-3 w-3 ml-1 text-green-500" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "serverFormDialog.placeholders.ipAddress"
                          )}
                          {...field}
                          className={
                            !fieldValidation.ip_address ? "border-red-500" : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      {!fieldValidation.ip_address && (
                        <p className="text-xs text-red-500 mt-1">
                          {t("serverFormDialog.validation.ipAddressExists")}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="os_version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.osVersion")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "serverFormDialog.placeholders.osVersion"
                          )}
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workload_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.workload")}
                      </FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        disabled={loadingWorkloads}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {loadingWorkloads ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                  {t("serverFormDialog.loadingWorkloads")}
                                </span>
                              </div>
                            ) : (
                              <SelectValue
                                placeholder={t(
                                  "serverFormDialog.placeholders.workload"
                                )}
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workloads.map((workload) => (
                            <SelectItem
                              key={workload.id}
                              value={workload.id?.toString() || ""}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {workload.name}
                                </span>
                                {workload.description && (
                                  <span className="text-sm text-muted-foreground">
                                    {workload.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ssh_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.sshPort")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t(
                            "serverFormDialog.placeholders.sshPort"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ssh_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("serverFormDialog.fields.sshUser")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "serverFormDialog.placeholders.sshUser"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ssh_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("serverFormDialog.fields.sshPassword")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t(
                          "serverFormDialog.placeholders.sshPassword"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Validation Errors */}
              {hasValidationErrors && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {t("serverFormDialog.validation.errors")}:
                      </p>
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-xs">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Test Connection Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      {t("serverFormDialog.testConnection.title")}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t("serverFormDialog.testConnection.description")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    disabled={testingConnection || !canTestConnection}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("serverFormDialog.testConnection.testing")}
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        {t("serverFormDialog.testConnection.button")}
                      </>
                    )}
                  </Button>
                </div>

                {/* Connection Result */}
                {connectionResult && (
                  <Alert
                    variant={
                      connectionResult.status === "success"
                        ? "default"
                        : "destructive"
                    }
                  >
                    <div className="flex items-center">
                      {connectionResult.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription className="ml-2">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {connectionResult.message}
                          </p>
                          {connectionResult.hostname && (
                            <p className="text-xs">
                              {t("serverFormDialog.fields.hostname")}:{" "}
                              {connectionResult.hostname}
                            </p>
                          )}
                          {connectionResult.os_version && (
                            <p className="text-xs">
                              {t("serverFormDialog.fields.osVersion")}:{" "}
                              {connectionResult.os_version}
                            </p>
                          )}
                          {connectionResult.error_details && (
                            <p className="text-xs text-destructive">
                              {connectionResult.error_details}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Validation in progress */}
                {validatingFields && (
                  <Alert>
                    <Clock className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      {t("serverFormDialog.validation.inProgress")}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form change with validation errors */}
                {formChanged && hasValidationErrors && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t("serverFormDialog.alerts.fixValidationErrors")}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form change warning */}
                {formChanged &&
                  !connectionTested &&
                  !hasValidationErrors &&
                  !validatingFields && (
                    <Alert>
                      <WifiOff className="h-4 w-4" />
                      <AlertDescription>
                        {t("serverFormDialog.alerts.testConnectionRequired")}
                      </AlertDescription>
                    </Alert>
                  )}

                {/* Connection test required warning */}
                {formChanged &&
                  connectionTested &&
                  connectionResult?.status !== "success" && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("serverFormDialog.alerts.connectionTestMustSucceed")}
                      </AlertDescription>
                    </Alert>
                  )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("serverFormDialog.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !canUpdate || validatingFields}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("serverFormDialog.buttons.update")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// src/components/servers/server-form-dialog.tsx
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react";
import { Server, ServerUpdate } from "@/types/server";
import { useServerForm } from "@/hooks/use-server-form";

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

  // Load server data when dialog opens
  useEffect(() => {
    if (editingServer && open) {
      loadServerData();
    }
  }, [editingServer, open, loadServerData]);

  if (!editingServer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Server</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin server. Test connection sau khi thay đổi thông
            tin để có thể cập nhật.
          </DialogDescription>
        </DialogHeader>

        {loadingServerData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
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
                      <FormLabel>Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="web-server-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
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
                      <FormLabel>OS Version</FormLabel>
                      <FormControl>
                        <Input placeholder="Ubuntu 24.04 LTS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ssh_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSH Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="22" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ssh_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSH User</FormLabel>
                      <FormControl>
                        <Input placeholder="root" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ssh_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        SSH Password (Để trống nếu không thay đổi)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Connection Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Test Connection</h4>
                    <p className="text-xs text-muted-foreground">
                      Test kết nối sau khi thay đổi thông tin
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
                        Testing...
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        Test Connection
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
                              Hostname: {connectionResult.hostname}
                            </p>
                          )}
                          {connectionResult.os_version && (
                            <p className="text-xs">
                              OS: {connectionResult.os_version}
                            </p>
                          )}
                          {connectionResult.response_time && (
                            <p className="text-xs">
                              Response time: {connectionResult.response_time}ms
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

                {/* Form change warning */}
                {!formChanged && (
                  <Alert>
                    <WifiOff className="h-4 w-4" />
                    <AlertDescription>
                      Vui lòng thay đổi thông tin server để có thể test
                      connection.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form change warning */}
                {formChanged && !connectionTested && (
                  <Alert>
                    <WifiOff className="h-4 w-4" />
                    <AlertDescription>
                      Bạn đã thay đổi thông tin server. Vui lòng test connection
                      trước khi cập nhật.
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
                        Connection test phải thành công trước khi có thể cập
                        nhật server.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading || !canUpdate}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

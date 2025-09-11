import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Server, Play, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Server {
  id: number;
  hostname: string;
  ip_address: string;
  workload_name?: string;
  status: boolean;
}

interface ScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: () => void;
}

export default function ScanDialog({
  open,
  onOpenChange,
  onScanComplete,
}: ScanDialogProps) {
  const { t } = useTranslation("dashboard");
  const [scanType, setScanType] = useState<"all" | "selected">("all");
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServers, setSelectedServers] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Fetch servers for selection
  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        page_size: "100",
      });

      if (searchTerm.trim()) {
        params.append("keyword", searchTerm.trim());
      }

      const response = await api.get<{
        servers: Server[];
        total_servers: number;
      }>(`/servers?${params.toString()}`);

      setServers(response.servers || []);
    } catch (error) {
      console.error("Error fetching servers:", error);
      toast.error(t("scanDialog.messages.loadServersError"));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, t]);

  // Load servers when dialog opens or search changes
  useEffect(() => {
    if (open && scanType === "selected") {
      const timeoutId = setTimeout(() => {
        fetchServers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [open, scanType, fetchServers]);

  // Handle server selection
  const handleServerToggle = (serverId: number) => {
    setSelectedServers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(serverId)) {
        newSelected.delete(serverId);
      } else {
        newSelected.add(serverId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    setSelectedServers(new Set(servers.map((s) => s.id)));
  };

  const handleSelectNone = () => {
    setSelectedServers(new Set());
  };

  // Handle scan
  const handleStartScan = async () => {
    try {
      setScanning(true);

      const scanRequest = {
        server_ids: scanType === "all" ? null : Array.from(selectedServers),
        batch_size: 10,
      };

      toast.success(
        scanType === "all"
          ? t("scanDialog.messages.scanStartedAll")
          : t("scanDialog.messages.scanStartedSelected", {
              count: selectedServers.size,
            })
      );

      onOpenChange(false);
      onScanComplete();

      api
        .post("/compliance/scan", scanRequest)
        .then((response) => {
          console.log("Scan started:", response);
          toast.success(t("scanDialog.messages.scanRequestSent"));
        })
        .catch((error) => {
          console.error("Error starting scan:", error);
          const errorMessage =
            error.response?.data?.message || "Unable to start scan";
          toast.error(
            t("scanDialog.messages.scanError", { message: errorMessage })
          );
        });
    } catch (error: any) {
      console.error("Error starting scan:", error);
      const errorMessage = error.message || "Unable to start scan";
      toast.error(
        t("scanDialog.messages.scanError", { message: errorMessage })
      );
    } finally {
      setScanning(false);
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setScanType("all");
    setSelectedServers(new Set());
    setSearchTerm("");
    setServers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>{t("scanDialog.title")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t("scanDialog.scanMethod")}
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scan-all"
                  checked={scanType === "all"}
                  onCheckedChange={() => setScanType("all")}
                />
                <Label htmlFor="scan-all" className="cursor-pointer">
                  {t("scanDialog.scanAll")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scan-selected"
                  checked={scanType === "selected"}
                  onCheckedChange={() => setScanType("selected")}
                />
                <Label htmlFor="scan-selected" className="cursor-pointer">
                  {t("scanDialog.scanSelected")}
                </Label>
              </div>
            </div>
          </div>

          {/* Server Selection */}
          {scanType === "selected" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("scanDialog.selectServers")}
                </Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={servers.length === 0}
                  >
                    {t("scanDialog.selectAll")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                    disabled={selectedServers.size === 0}
                  >
                    {t("scanDialog.deselectAll")}
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("scanDialog.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected Count */}
              {selectedServers.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {t("scanDialog.selectedCount", {
                      count: selectedServers.size,
                    })}
                  </Badge>
                </div>
              )}

              {/* Server List */}
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-3 space-y-2">
                  {loading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {t("scanDialog.loading")}
                    </div>
                  ) : servers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchTerm.trim()
                        ? t("scanDialog.noResults")
                        : t("scanDialog.noServers")}
                    </div>
                  ) : (
                    servers.map((server) => (
                      <div
                        key={server.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedServers.has(server.id)
                            ? "bg-primary/10 border-primary"
                            : server.status
                            ? "hover:bg-muted"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          server.status && handleServerToggle(server.id)
                        }
                      >
                        <Checkbox
                          checked={selectedServers.has(server.id)}
                          disabled={!server.status}
                          onChange={() =>
                            server.status && handleServerToggle(server.id)
                          }
                        />
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {server.ip_address}
                            </span>
                            <Badge
                              variant={server.status ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {server.status
                                ? t("scanDialog.serverStatus.active")
                                : t("scanDialog.serverStatus.inactive")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {server.hostname}
                            {server.workload_name && (
                              <span className="ml-2">
                                • {server.workload_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={scanning}>
            {t("scanDialog.actions.cancel")}
          </Button>
          <Button
            onClick={handleStartScan}
            disabled={
              scanning ||
              (scanType === "selected" && selectedServers.size === 0) ||
              (scanType === "selected" && loading)
            }
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>
              {scanning
                ? t("scanDialog.actions.starting")
                : scanType === "all"
                ? t("scanDialog.actions.scanAll")
                : selectedServers.size > 0
                ? t("scanDialog.actions.scanSelected", {
                    count: selectedServers.size,
                  })
                : t("scanDialog.actions.selectToScan")}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

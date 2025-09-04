import { useState, useEffect, useCallback } from "react";
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
      toast.error("Không thể tải danh sách server");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

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
          ? "Đã khởi động scan cho toàn bộ server"
          : `Đã khởi động scan cho ${selectedServers.size} server được chọn`
      );

      onOpenChange(false);
      onScanComplete();

      api
        .post("/compliance/scan", scanRequest)
        .then((response) => {
          console.log("Scan started:", response);
          toast.success("Yêu cầu scan đã được gửi thành công.");
        })
        .catch((error) => {
          console.error("Error starting scan:", error);
          const errorMessage =
            error.response?.data?.message || "Không thể khởi động scan";
          toast.error(`Lỗi: ${errorMessage}`);
        });
    } catch (error: any) {
      console.error("Error starting scan:", error);
      const errorMessage = error.message || "Không thể khởi động scan";
      toast.error(`Lỗi: ${errorMessage}`);
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
            <span>Khởi động Compliance Scan</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Chọn phương thức scan:
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scan-all"
                  checked={scanType === "all"}
                  onCheckedChange={() => setScanType("all")}
                />
                <Label htmlFor="scan-all" className="cursor-pointer">
                  Scan toàn bộ server
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scan-selected"
                  checked={scanType === "selected"}
                  onCheckedChange={() => setScanType("selected")}
                />
                <Label htmlFor="scan-selected" className="cursor-pointer">
                  Scan server được chọn
                </Label>
              </div>
            </div>
          </div>

          {/* Server Selection */}
          {scanType === "selected" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Chọn server để scan:
                </Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={servers.length === 0}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                    disabled={selectedServers.size === 0}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm server theo IP hoặc hostname..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected Count */}
              {selectedServers.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedServers.size} server được chọn
                  </Badge>
                </div>
              )}

              {/* Server List */}
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-3 space-y-2">
                  {loading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Đang tải danh sách server...
                    </div>
                  ) : servers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchTerm.trim()
                        ? "Không tìm thấy server nào phù hợp"
                        : "Không có server nào hoạt động"}
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
                              {server.status ? "Active" : "Inactive"}
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
            Hủy
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
                ? "Đang khởi động..."
                : scanType === "all"
                ? "Scan Toàn Bộ"
                : selectedServers.size > 0
                ? `Scan ${selectedServers.size} Server`
                : "Chọn Server để Scan"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, Loader2, Calendar } from "lucide-react";
import { useExport, ExportParams } from "@/hooks/export/use-export";
import { WorkloadSelection } from "./workload-selection-export-dialog";


interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [params, setParams] = useState<ExportParams>({});
  const [selectedWorkloads, setSelectedWorkloads] = useState<number[]>([]);
  
  const { loading, exportComplianceToExcel } = useExport();

  const handleExport = async () => {
    try {
      const exportParams = {
        ...params,
        list_workload_id: selectedWorkloads.length > 0 ? selectedWorkloads : undefined
      };
      
      await exportComplianceToExcel(exportParams);
      onOpenChange(false);
      
      // Reset form
      setParams({});
      setSelectedWorkloads([]);
    } catch (error) {
      // Error đã được handle trong hook
    }
  };

  const handleInputChange = (
    key: keyof ExportParams,
    value: string | number | undefined
  ) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("vi-VN");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Xuất báo cáo
          </DialogTitle>
          <DialogDescription>
            Các trường thuộc tính để trống thì sẽ xuất ra toàn bộ dữ liệu
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="grid gap-6 py-4 pr-4">
            {/* Info box */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Báo cáo ngày {getCurrentDate()}
                </p>
                <p className="text-xs text-blue-600">
                  Chỉ xuất dữ liệu compliance được quét trong ngày hôm nay
                </p>
              </div>
            </div>

            {/* Filter inputs */}
            <div className="grid gap-4">
              {/* Keyword input */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keyword" className="text-right font-medium">
                  Từ khóa
                </Label>
                <Input
                  id="keyword"
                  placeholder="Tìm theo IP server (vd: 192.168.1)"
                  className="col-span-3"
                  value={params.keyword || ""}
                  onChange={(e) => handleInputChange("keyword", e.target.value)}
                />
              </div>

              {/* Workload selection */}
              <WorkloadSelection
                selectedWorkloads={selectedWorkloads}
                onSelectionChange={setSelectedWorkloads}
              />

              {/* Status selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right font-medium">
                  Trạng thái
                </Label>
                <Select
                  value={params.status || "all"}
                  onValueChange={(value) =>
                    handleInputChange(
                      "status",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="completed">
                      Completed - Hoàn thành
                    </SelectItem>
                    <SelectItem value="failed">Failed - Lỗi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview info */}
            <div className="p-3 bg-gray-50 border rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-1">
                File Excel sẽ chứa:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• ID, Server IP, Workload Name</li>
                <li>• Status, Total Rules, Passed/Failed Rules, Score</li>
                <li>• Scan Date, Created At, Updated At</li>
                <li>• Tự động format và có thể mở bằng Excel/LibreOffice</li>
                {selectedWorkloads.length > 0 && (
                  <li className="text-blue-600 font-medium">
                    • Chỉ xuất dữ liệu của {selectedWorkloads.length} workload được chọn
                  </li>
                )}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setParams({});
              setSelectedWorkloads([]);
            }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
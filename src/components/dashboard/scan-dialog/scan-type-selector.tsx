import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ScanTypeSelectorProps {
  scanType: "all" | "selected";
  setScanType: (type: "all" | "selected") => void;
  t: (key: string) => string;
}

export const ScanTypeSelector = ({
  scanType,
  setScanType,
  t,
}: ScanTypeSelectorProps) => {
  return (
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
  );
};

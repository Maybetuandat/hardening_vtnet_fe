import React, { useState } from "react";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { useRules, RuleResponse } from "@/hooks/rule/use-rules";

interface DeleteRuleDialogProps {
  rule: RuleResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteRuleDialog: React.FC<DeleteRuleDialogProps> = ({
  rule,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { deleteRule } = useRules();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRule(rule.id);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Xác nhận xóa Rule</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa rule <strong>"{rule.name}"</strong>{" "}
              không?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Cảnh báo:</strong> Hành động này sẽ:
              </p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• Xóa vĩnh viễn rule này</li>
                <li>• Xóa tất cả commands liên quan</li>
                <li>• Không thể hoàn tác</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {loading ? "Đang xóa..." : "Xóa Rule"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

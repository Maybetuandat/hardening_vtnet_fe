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
import { useCommands, CommandResponse } from "@/hooks/command/use-commands";

interface DeleteCommandDialogProps {
  command: CommandResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteCommandDialog: React.FC<DeleteCommandDialogProps> = ({
  command,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { deleteCommand } = useCommands();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCommand(command.id);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const truncateCommand = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Xác nhận xóa Command</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>Bạn có chắc chắn muốn xóa command này không?</p>

            <div className="bg-gray-50 border rounded-md p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">OS:</span>
                <span className="text-sm">{command.os_version}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600">
                  Command:
                </span>
                <code className="block text-xs bg-gray-100 p-2 rounded border max-w-full overflow-hidden">
                  {truncateCommand(command.command_text, 100)}
                </code>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Cảnh báo:</strong> Hành động này sẽ xóa vĩnh viễn
                command và không thể hoàn tác.
              </p>
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
            {loading ? "Đang xóa..." : "Xóa Command"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

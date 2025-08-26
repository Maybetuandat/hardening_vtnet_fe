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

interface ConfirmCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfirmCancelDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmCancelDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy bỏ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn hủy bỏ toàn bộ thay đổi? Tất cả thao tác đang thực
            hiện sẽ bị dừng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tiếp tục</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Hủy bỏ</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

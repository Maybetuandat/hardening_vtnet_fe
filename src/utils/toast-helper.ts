import { toast } from "sonner";
import { TOAST_DURATION } from "./toast.constants";

/**
 * Toast Helper Functions với duration được config từ constants
 * Chỉ cần gọi các function này thay vì gọi toast trực tiếp
 */

export const toastHelper = {
  success: (message: string, options?: any) => {
    // Force override duration nếu có trong options
    const { duration, ...restOptions } = options || {};
    return toast.success(message, {
      ...restOptions,
      duration: TOAST_DURATION.SUCCESS, // Luôn
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: TOAST_DURATION.ERROR,
      ...options,
    });
  },
  warning: (message: string, options?: any) => {
    return toast.warning(message, {
      duration: TOAST_DURATION.WARNING,
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    return toast.info(message, {
      duration: TOAST_DURATION.INFO,
      ...options,
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      duration: TOAST_DURATION.LOADING,
      ...options,
    });
  },

  // Default toast với duration mặc định
  default: (message: string, options?: any) => {
    return toast(message, {
      duration: TOAST_DURATION.DEFAULT,
      ...options,
    });
  },

  // Dismiss toast
  dismiss: (id?: string | number) => {
    return toast.dismiss(id);
  },
};

// Export để sử dụng
export default toastHelper;

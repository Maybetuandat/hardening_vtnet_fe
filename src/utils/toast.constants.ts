export const TOAST_DURATION = {
  DEFAULT: 300, // 3 giây - thời gian mặc định cho tất cả toast
  SUCCESS: 300, // Toast thành công
  ERROR: 5000, // Toast lỗi - hiển thị lâu hơn để user đọc
  WARNING: 300, // Toast cảnh báo
  INFO: 300, // Toast thông tin
  LOADING: 0,
} as const;

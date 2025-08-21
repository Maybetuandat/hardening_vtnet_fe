# shadcn-template-react

A react js project template with shadcn ui library installed.
task sáng ngày mai:

- sửa lại api backend server
- hoàn thành giao diện cho trang server
  | A: STT | B: Name | C: Description | D: Severity | E: Category | F: Parameters_JSON | G: Ubuntu_Command | H: CentOS7_Command | I: CentOS8_Command | J: Is_Active |
  |--------|---------|----------------|-------------|-------------|-------------------|-------------------|-------------------|-------------------|-------------|
  | 1 | file-max | Giới hạn tối đa số file mà toàn bộ hệ thống Linux có thể mở cùng lúc | medium | System | {"default_value": "9223372036854775807", "recommended_value": "5000000", "note": "Check lại con số này", "docs": "file-max-docs"} | cat /proc/sys/fs/file-max | cat /proc/sys/fs/file-max | cat /proc/sys/fs/file-max | TRUE |
  | 2 | net.ipv4.tcp_rmem | Tham số quy định ba giá trị ngưỡng cho bộ đệm nhận của TCP socket, tính theo byte | high | Network | {"min": 4096, "default": 87380, "max": 87380, "unit": "byte", "range": "4096-6291456", "recommended": "4096 87380 56623104"} | cat /proc/sys/net/ipv4/tcp_rmem | cat /proc/sys/net/ipv4/tcp_rmem | cat /proc/sys/net/ipv4/tcp_rmem | TRUE |
  | 3 | password_policy | Chính sách mật khẩu cho tài khoản | high | Security | {"rule_type": "password_policy", "condition": "ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1", "action": "enforce_password_policy", "note": "Mật khẩu phải có chữ hoa, chữ thường, kí tự đặc biệt, chữ số"} | grep -E 'ucredit\|lcredit\|dcredit\|ocredit' /etc/pam.d/common-password /etc/security/pwquality.conf 2>/dev/null | grep -E 'ucredit\|lcredit\|dcredit\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null | grep -E 'ucredit\|lcredit\|dcredit\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null | TRUE |
  | 4 | ssh_config | Cấu hình SSH bảo mật | high | Security | {"rule_type": "security", "condition": "PermitRootLogin=no", "action": "check_ssh_config", "config_file": "/etc/ssh/sshd_config"} | grep PermitRootLogin /etc/ssh/sshd_config | grep PermitRootLogin /etc/ssh/sshd_config | grep PermitRootLogin /etc/ssh/sshd_config | TRUE |

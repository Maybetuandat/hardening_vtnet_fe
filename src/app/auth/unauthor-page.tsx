// src/pages/auth/UnauthorizedPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/authentication/use-auth";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Truy cập bị từ chối
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Bạn không có quyền truy cập vào trang này.
            </p>

            {user && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đăng nhập với tư cách: <strong>{user.username}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vai trò: <strong className="capitalize">{user.role}</strong>
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>

              <Button onClick={handleGoHome} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                Đăng xuất
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>
                Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

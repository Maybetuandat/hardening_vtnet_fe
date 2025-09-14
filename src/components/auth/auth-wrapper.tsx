// src/components/auth/AuthWrapper.tsx
import React from "react";
import { useAuth } from "@/hooks/authentication/use-auth";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component wrapper để hiển thị loading state khi đang check authentication
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  fallback,
}) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

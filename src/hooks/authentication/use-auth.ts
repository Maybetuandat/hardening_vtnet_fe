// src/hooks/use-auth.ts
import { useContext } from "react";

import { AuthContextType } from "@/types/auth";
import { AuthContext } from "@/context/auth-context";

/**
 * Hook để sử dụng AuthContext
 * @returns AuthContextType với tất cả auth state và functions
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

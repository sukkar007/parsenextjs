import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

/* =======================
   Helpers
======================= */
function isAdminRole(role?: string): boolean {
  const normalizedRole = role?.toLowerCase()?.trim() || "";
  return (
    normalizedRole === "admin" ||
    normalizedRole === "administrator" ||
    normalizedRole === "مدير" ||
    normalizedRole === "مسؤول" ||
    normalizedRole === "إداري" ||
    normalizedRole.includes("admin")
  );
}

type UseAuthOptions = {
  requireAdmin?: boolean;
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
};

/* =======================
   Hook
======================= */
export function useAuth(options?: UseAuthOptions) {
  const {
    requireAdmin = false,
    redirectOnUnauthorized = false,
    redirectPath = getLoginUrl(),
  } = options ?? {};

  const utils = trpc.useUtils();

  /* ===== auth.me (اختياري) ===== */
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        console.error("[useAuth] auth.me failed:", error.message);
      }
    },
  });

  /* ===== Logout ===== */
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("parse-dashboard-user-info");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      localStorage.removeItem("parse-dashboard-user-info");
    }
  }, [logoutMutation, utils]);

  /* ===== Auth State ===== */
  const state = useMemo(() => {
    let user: any = meQuery.data ?? null;

    // fallback من localStorage
    if (!user && typeof window !== "undefined") {
      const stored = localStorage.getItem("parse-dashboard-user-info");
      if (stored) {
        try {
          user = JSON.parse(stored);
        } catch {
          user = null;
        }
      }
    }

    const userRole = user?.role;
    const isAuthenticated = Boolean(user);
    const isAdmin = Boolean(user?.isAdmin ?? isAdminRole(userRole));

    if (user && typeof window !== "undefined") {
      localStorage.setItem(
        "parse-dashboard-user-info",
        JSON.stringify({ ...user, isAdmin })
      );
    }

    return {
      user,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated,
      isAdmin,
      hasRequiredRole: requireAdmin ? isAdmin : true,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    requireAdmin,
  ]);

  /* ===== Redirect Guard ===== */
  useEffect(() => {
    if (!redirectOnUnauthorized) return;
    if (state.loading) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    if (!state.isAuthenticated) {
      window.location.href = redirectPath;
      return;
    }

    if (requireAdmin && !state.isAdmin) {
      alert("غير مصرح لك بالوصول. يجب أن تكون مسؤولاً.");
      window.location.href = redirectPath;
    }
  }, [
    redirectOnUnauthorized,
    redirectPath,
    state.loading,
    state.isAuthenticated,
    state.isAdmin,
    requireAdmin,
  ]);

  /* ===== API ===== */
  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

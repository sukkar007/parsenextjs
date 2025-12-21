import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

/* =======================
   Types
======================= */
export type UserRole = "admin" | "editor" | "viewer" | string;

export interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
  role?: UserRole;
  isAdmin?: boolean;
  allowedPages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

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

function isEditorRole(role?: string): boolean {
  const normalizedRole = role?.toLowerCase()?.trim() || "";
  return (
    normalizedRole === "editor" ||
    normalizedRole === "محرر" ||
    normalizedRole.includes("editor")
  );
}

function isViewerRole(role?: string): boolean {
  const normalizedRole = role?.toLowerCase()?.trim() || "";
  return (
    normalizedRole === "viewer" ||
    normalizedRole === "مشاهد" ||
    normalizedRole.includes("viewer")
  );
}

// التحقق من أن المستخدم لديه دور مسموح به للدخول
function hasValidRole(role?: string): boolean {
  return isAdminRole(role) || isEditorRole(role) || isViewerRole(role);
}

type UseAuthOptions = {
  requireAdmin?: boolean;
  requireEditor?: boolean;
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
};

/* =======================
   Hook
======================= */
export function useAuth(options?: UseAuthOptions) {
  const {
    requireAdmin = false,
    requireEditor = false,
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
    let user: AuthUser | null = meQuery.data ?? null;

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
    const isEditor = isEditorRole(userRole);
    const isViewer = isViewerRole(userRole);
    const allowedPages = user?.allowedPages || [];

    // تحديد إذا كان المستخدم لديه الصلاحية المطلوبة
    let hasRequiredRole = true;
    if (requireAdmin) {
      hasRequiredRole = isAdmin;
    } else if (requireEditor) {
      hasRequiredRole = isAdmin || isEditor;
    } else {
      // أي دور مسموح به (admin, editor, viewer)
      hasRequiredRole = hasValidRole(userRole);
    }

    if (user && typeof window !== "undefined") {
      localStorage.setItem(
        "parse-dashboard-user-info",
        JSON.stringify({ ...user, isAdmin, isEditor, isViewer })
      );
    }

    return {
      user,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated,
      isAdmin,
      isEditor,
      isViewer,
      allowedPages,
      hasRequiredRole,
      // دالة للتحقق من صلاحية الوصول لصفحة معينة
      canAccessPage: (pageId: string) => {
        // الأدمن يمكنه الوصول لكل الصفحات إذا لم يتم تحديد صفحات معينة
        if (isAdmin && allowedPages.length === 0) return true;
        // إذا تم تحديد صفحات معينة، تحقق منها
        if (allowedPages.length > 0) {
          return allowedPages.includes(pageId);
        }
        // المحرر والمشاهد يحتاجون صفحات محددة
        return false;
      },
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    requireAdmin,
    requireEditor,
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

    if (!state.hasRequiredRole) {
      alert("غير مصرح لك بالوصول. ليس لديك الصلاحيات المطلوبة.");
      window.location.href = redirectPath;
    }
  }, [
    redirectOnUnauthorized,
    redirectPath,
    state.loading,
    state.isAuthenticated,
    state.hasRequiredRole,
  ]);

  /* ===== API ===== */
  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

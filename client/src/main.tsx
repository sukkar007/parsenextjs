import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const handleApiError = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  
  console.error("[API Error Details]", {
    message: error.message,
    code: error.data?.code,
    path: error.data?.path,
    stack: error.stack
  });

  // ✅ التحقق من أخطاء role (ليست admin)
  const isNotAdminError = error.message.includes("مسؤول") || 
                          error.message.includes("Admin") || 
                          error.message.includes("صلاحية");
  
  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  
  // إذا لم يكن المستخدم admin أو غير مصرح له
  if (isNotAdminError || isUnauthorized) {
    // عرض رسالة للمستخدم
    alert(error.message || "غير مصرح لك بالوصول إلى هذه الصفحة.");
    
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = getLoginUrl();
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    handleApiError(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    handleApiError(error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.parse.login.useMutation();
  const registerMutation = trpc.parse.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username,
          password,
        });
      } else {
        await registerMutation.mutateAsync({
          username,
          password,
          email,
        });
      }
      setLocation("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء المحاولة"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h1>
            <p className="text-gray-600 mt-2">لوحة تحكم Parse</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLogin
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              إنشاء حساب
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <Input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            تم تطويره باستخدام{" "}
            <span className="font-semibold text-indigo-600">Parse</span> و{" "}
            <span className="font-semibold text-indigo-600">Next.js</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

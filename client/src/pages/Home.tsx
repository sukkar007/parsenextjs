import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            تسجيل الدخول
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              لوحة تحكم Parse المتقدمة
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              إدارة بيانات تطبيقك بسهولة وأمان. تسجيل دخول سريع وآمن مع واجهة سهلة الاستخدام.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/login")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ابدأ الآن
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                تعرف أكثر
              </Button>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-4">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                إدارة المستخدمين
              </h3>
              <p className="text-gray-600">
                عرض وحذف وإدارة جميع مستخدمي التطبيق بسهولة
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                إدارة البيانات
              </h3>
              <p className="text-gray-600">
                إنشاء وتحديث وحذف الكائنات من أي فئة في قاعدة البيانات
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                واجهة سهلة
              </h3>
              <p className="text-gray-600">
                تصميم حديث وسهل الاستخدام مع دعم اللغة العربية
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p>تم تطويره باستخدام Parse و Next.js</p>
        </div>
      </footer>
    </div>
  );
}

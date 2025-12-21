import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  
  const { data: currentUser, isLoading } = trpc.auth.me.useQuery();
  
  useEffect(() => {
    // جمع بيانات localStorage للتشخيص
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes("parse") || key.includes("user") || key.includes("login")) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '""');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(data);
  }, []);
  
  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };
  
  const handleTestAdmin = async () => {
    try {
      const response = await fetch("/api/trpc/auth.me");
      const data = await response.json();
      console.log("Auth test response:", data);
    } catch (error) {
      console.error("Auth test error:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">صفحة التشخيص</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">معلومات المستخدم الحالي</h2>
          {isLoading ? (
            <p>جاري التحميل...</p>
          ) : currentUser ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">لم يتم العثور على مستخدم</p>
          )}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">بيانات LocalStorage</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">أدوات التشخيص</h2>
          <div className="space-y-3">
            <Button onClick={handleTestAdmin} className="w-full">
              اختبار اتصال Auth API
            </Button>
            <Button onClick={handleClearStorage} variant="destructive" className="w-full">
              مسح جميع البيانات المحلية
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              إعادة تحميل الصفحة
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">تعليمات حل المشاكل</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>تأكد من وجود حقل <code>role</code> بقيمة <code>"admin"</code> في Parse Dashboard</li>
            <li>تحقق من اتصال Parse Server</li>
            <li>جرب مسح بيانات المتصفح</li>
            <li>تأكد من استخدام اسم المستخدم وكلمة المرور الصحيحة</li>
            <li>تحقق من وحدة تحكم المتصفح (F12) لرؤية الأخطاء</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
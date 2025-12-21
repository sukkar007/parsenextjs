import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  FileText,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

// ألوان الإجراءات
const ACTION_COLORS: Record<string, string> = {
  "تسجيل دخول": "bg-green-100 text-green-800",
  "تسجيل خروج": "bg-gray-100 text-gray-800",
  "إضافة": "bg-blue-100 text-blue-800",
  "تعديل": "bg-yellow-100 text-yellow-800",
  "حذف": "bg-red-100 text-red-800",
  "تحديث صلاحيات": "bg-purple-100 text-purple-800",
  default: "bg-gray-100 text-gray-800",
};

interface SystemLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  createdAt: string;
}

export default function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const utils = trpc.useContext();

  // جلب السجلات من Parse
  const { data: logs = [], isLoading, refetch } = trpc.parse.getSystemLogs.useQuery();

  // فلترة السجلات
  const filteredLogs = logs.filter((log: SystemLog) => {
    const matchesSearch =
      log.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = !filterAction || log.action?.includes(filterAction);

    return matchesSearch && matchesFilter;
  });

  // الحصول على لون الإجراء
  const getActionColor = (action: string) => {
    for (const [key, color] of Object.entries(ACTION_COLORS)) {
      if (action?.includes(key)) return color;
    }
    return ACTION_COLORS.default;
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // الإجراءات الفريدة للفلترة
  const uniqueActions = [...new Set(logs.map((log: SystemLog) => log.action))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل السجلات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل النظام</h1>
            <p className="text-gray-500">متابعة جميع العمليات التي يقوم بها المشرفون</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              <p className="text-sm text-gray-500">إجمالي العمليات</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(logs.map((l: SystemLog) => l.adminId)).size}
              </p>
              <p className="text-sm text-gray-500">مشرفون نشطون</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter((l: SystemLog) => {
                  const logDate = new Date(l.createdAt);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-sm text-gray-500">عمليات اليوم</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{uniqueActions.length}</p>
              <p className="text-sm text-gray-500">أنواع العمليات</p>
            </div>
          </div>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="البحث في السجلات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع العمليات</option>
            {uniqueActions.map((action: string) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* جدول السجلات */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المشرف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراء</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النوع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد سجلات متاحة</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: SystemLog) => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {log.adminName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-900">{log.adminName || "غير معروف"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{log.entityType || "-"}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(log.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          >
                            {expandedLog === log.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedLog === log.id && log.details && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-2">تفاصيل العملية:</p>
                            <pre className="bg-white p-4 rounded-lg border overflow-x-auto text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* عدد النتائج */}
      <div className="text-center text-sm text-gray-500">
        عرض {filteredLogs.length} من {logs.length} سجل
      </div>
    </div>
  );
}

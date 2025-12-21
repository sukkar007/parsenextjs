import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  UserCog,
  Shield,
  Save,
  X,
  Check,
  Search,
  Edit2,
  Eye,
  Trash2,
} from "lucide-react";

// قائمة الصفحات المتاحة في الداشبورد
const AVAILABLE_PAGES = [
  { id: "dashboard", label: "الرئيسية", icon: "🏠" },
  { id: "users", label: "المستخدمين", icon: "👥" },
  { id: "messages", label: "الرسائل", icon: "💬" },
  { id: "categories", label: "التصنيفات", icon: "📁" },
  { id: "announcements", label: "الإعلانات", icon: "📢" },
  { id: "ads", label: "الإعلانات التجارية", icon: "📺" },
  { id: "encounters", label: "اللقاءات", icon: "🤝" },
  { id: "challenges", label: "التحديات", icon: "🏆" },
  { id: "entrance-effects", label: "تأثيرات الدخول", icon: "✨" },
  { id: "party-themes", label: "ثيمات الحفلات", icon: "🎉" },
  { id: "comments", label: "التعليقات", icon: "💭" },
  { id: "calls", label: "المكالمات", icon: "📞" },
  { id: "clicks", label: "النقرات", icon: "👆" },
  { id: "posts", label: "المنشورات", icon: "📝" },
  { id: "streaming", label: "البث المباشر", icon: "📡" },
  { id: "videos", label: "الفيديوهات", icon: "🎬" },
  { id: "withdrawals", label: "السحوبات", icon: "💰" },
  { id: "frames", label: "الإطارات", icon: "🖼️" },
  { id: "gifts", label: "الهدايا", icon: "🎁" },
  { id: "data", label: "البيانات", icon: "📊" },
  { id: "settings", label: "الإعدادات", icon: "⚙️" },
  { id: "admin-management", label: "إدارة المشرفين", icon: "👑" },
  { id: "system-logs", label: "سجل النظام", icon: "📋" },
];

// أنواع الرتب المتاحة
const ROLE_TYPES = [
  { value: "admin", label: "مدير (صلاحيات كاملة)", color: "bg-red-100 text-red-800" },
  { value: "editor", label: "محرر (تعديل فقط)", color: "bg-blue-100 text-blue-800" },
  { value: "viewer", label: "مشاهد (قراءة فقط)", color: "bg-gray-100 text-gray-800" },
];

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  allowedPages?: string[];
  isAdmin?: boolean;
}

export default function AdminManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("viewer");

  const utils = trpc.useContext();

  // جلب جميع المستخدمين
  const { data: allUsers = [], isLoading: loadingUsers } = trpc.parse.getAllUsers.useQuery();

  // تحديث المستخدم
  const updateUserMutation = trpc.parse.updateUser.useMutation({
    onSuccess: () => {
      utils.parse.getAllUsers.invalidate();
      setEditingUser(null);
      alert("تم تحديث صلاحيات المستخدم بنجاح");
    },
    onError: (error) => {
      alert(`فشل التحديث: ${error.message}`);
    },
  });

  // فلترة المستخدمين بناءً على البحث
  const filteredUsers = allUsers.filter((user: AdminUser) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // بدء تعديل مستخدم
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setSelectedRole(user.role || "viewer");
    setSelectedPages(user.allowedPages || []);
  };

  // حفظ التعديلات
  const handleSavePermissions = async () => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data: {
          role: selectedRole,
          allowedPages: selectedPages,
        },
      });
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  // تبديل صفحة في القائمة المحددة
  const togglePage = (pageId: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((p) => p !== pageId)
        : [...prev, pageId]
    );
  };

  // تحديد/إلغاء تحديد الكل
  const toggleAllPages = () => {
    if (selectedPages.length === AVAILABLE_PAGES.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(AVAILABLE_PAGES.map((p) => p.id));
    }
  };

  // الحصول على لون الرتبة
  const getRoleColor = (role: string) => {
    const roleType = ROLE_TYPES.find((r) => r.value === role?.toLowerCase());
    return roleType?.color || "bg-gray-100 text-gray-800";
  };

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المشرفين</h1>
            <p className="text-gray-500">تعيين الصلاحيات وتحديد الصفحات المتاحة لكل مشرف</p>
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="البحث عن مستخدم بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      {/* جدول المستخدمين */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الرتبة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الصفحات المتاحة</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role || "غير محدد"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {user.allowedPages?.length || 0} صفحة
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل الصلاحيات
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* نافذة تعديل الصلاحيات */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* رأس النافذة */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">تعديل صلاحيات</h2>
                    <p className="text-gray-500">{editingUser.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* اختيار الرتبة */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع الرتبة</label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLE_TYPES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRole === role.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className={`px-2 py-1 rounded text-xs font-medium ${role.color}`}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيار الصفحات */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">الصفحات المتاحة</label>
                  <Button variant="outline" size="sm" onClick={toggleAllPages}>
                    {selectedPages.length === AVAILABLE_PAGES.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                  {AVAILABLE_PAGES.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => togglePage(page.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-right ${
                        selectedPages.includes(page.id)
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{page.icon}</span>
                      <span className="text-sm font-medium flex-1">{page.label}</span>
                      {selectedPages.includes(page.id) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  تم تحديد {selectedPages.length} من {AVAILABLE_PAGES.length} صفحة
                </p>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={updateUserMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ الصلاحيات
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

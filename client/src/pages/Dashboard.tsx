import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Users,
  Database,
  Settings,
  Menu,
  X,
  Eye,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import UserDetails from "./UserDetails";
import UsersManagement from "./UsersManagement";

type MenuOption = "users" | "data" | "settings";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeMenu, setActiveMenu] = useState<MenuOption>("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customClass, setCustomClass] = useState("");
  const [newObjectData, setNewObjectData] = useState("");


  // Queries
  const currentUserQuery = trpc.parse.getCurrentUser.useQuery();
  const allUsersQuery = trpc.parse.getAllUsers.useQuery();
  const queryClassQuery = trpc.parse.queryClass.useQuery({
    className: customClass || "User",
    limit: 100,
    skip: 0,
  });

  // Mutations
  const logoutMutation = trpc.parse.logout.useMutation();
  const deleteUserMutation = trpc.parse.deleteUser.useMutation();
  const createObjectMutation = trpc.parse.createObject.useMutation();
  const deleteObjectMutation = trpc.parse.deleteObject.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await deleteUserMutation.mutateAsync({ userId });
        allUsersQuery.refetch();
      } catch (err) {
        console.error("Delete user error:", err);
      }
    }
  };

  const handleCreateObject = async () => {
    if (!newObjectData.trim()) {
      alert("يرجى إدخال بيانات JSON صحيحة");
      return;
    }

    try {
      const data = JSON.parse(newObjectData);
      await createObjectMutation.mutateAsync({
        className: customClass || "User",
        data,
      });
      setNewObjectData("");
      queryClassQuery.refetch();
    } catch (err) {
      alert("خطأ في تحليل JSON أو إنشاء الكائن");
      console.error(err);
    }
  };

  const handleDeleteObject = async (objectId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الكائن؟")) {
      try {
        await deleteObjectMutation.mutateAsync({
          className: customClass || "User",
          objectId,
        });
        queryClassQuery.refetch();
      } catch (err) {
        console.error("Delete object error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUserQuery.data && (
              <span className="text-sm text-gray-600 hidden sm:inline">
                مرحباً، {currentUserQuery.data.username}
              </span>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto lg:w-64`}
        >
          <nav className="p-6 space-y-2">
            <button
              onClick={() => {
                setActiveMenu("users");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "users"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">إدارة المستخدمين</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu("data");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "data"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">إدارة البيانات</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu("settings");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "settings"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">الإعدادات</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">إجمالي المستخدمين</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {allUsersQuery.data?.length || 0}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">حالة الاتصال</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">متصل</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">آخر تحديث</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date().toLocaleDateString("ar-SA")}
                </p>
              </Card>
            </div>

            {/* Content Sections */}
            {activeMenu === "users" && (
              <UsersManagement />
            )}

            {activeMenu === "data" && (
              <div className="space-y-6">
                {/* Select Class */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">اختر فئة البيانات</h3>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="اسم الفئة (مثل: User, Product)"
                      value={customClass}
                      onChange={(e) => setCustomClass(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => queryClassQuery.refetch()}>
                      عرض
                    </Button>
                  </div>
                </Card>

                {/* Create New Object */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">إنشاء كائن جديد</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بيانات JSON
                      </label>
                      <textarea
                        value={newObjectData}
                        onChange={(e) => setNewObjectData(e.target.value)}
                        placeholder='{"name": "value", "age": 25}'
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleCreateObject}
                      disabled={createObjectMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء
                    </Button>
                  </div>
                </Card>

                {/* Objects List */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    الكائنات {customClass && `(${customClass})`}
                  </h3>
                  {queryClassQuery.isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : queryClassQuery.data && queryClassQuery.data.length > 0 ? (
                    <div className="space-y-4">
                      {queryClassQuery.data.map((obj) => (
                        <div
                          key={obj.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-mono text-sm text-gray-600 mb-2">
                                ID: {obj.id}
                              </p>
                              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-48">
                                {JSON.stringify(obj, null, 2)}
                              </pre>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteObject(obj.id)}
                                disabled={deleteObjectMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">لا توجد كائنات</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeMenu === "settings" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">معلومات الحساب</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">اسم المستخدم</p>
                        <p className="text-lg font-medium text-gray-900">
                          {currentUserQuery.data?.username || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                        <p className="text-lg font-medium text-gray-900">
                          {currentUserQuery.data?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

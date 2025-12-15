import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Settings,
  Trash2,
  Eye,
  Download,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import ColumnManager, { Column } from "@/components/ColumnManager";
import UserDetails from "./UserDetails";
import UserEditForm from "@/components/UserEditForm";

// Define all available columns from UserModel
const DEFAULT_COLUMNS: Column[] = [
  { id: "username", label: "اسم المستخدم", visible: true, order: 0 },
  { id: "email", label: "البريد الإلكتروني", visible: true, order: 1 },
  { id: "name", label: "الاسم الكامل", visible: true, order: 2 },
  { id: "age", label: "العمر", visible: true, order: 3 },
  { id: "gender", label: "الجنس", visible: true, order: 4 },
  { id: "phone_number", label: "رقم الهاتف", visible: true, order: 5 },
  { id: "city", label: "المدينة", visible: true, order: 6 },
  { id: "country", label: "الدولة", visible: true, order: 7 },
  { id: "company_name", label: "الشركة", visible: true, order: 8 },
  { id: "job_title", label: "المسمى الوظيفي", visible: true, order: 9 },
  { id: "school", label: "المدرسة/الجامعة", visible: true, order: 10 },
  { id: "bio", label: "السيرة الذاتية", visible: true, order: 11 },
  { id: "aboutMe", label: "عن نفسي", visible: true, order: 12 },
  { id: "birthday", label: "تاريخ الميلاد", visible: true, order: 13 },
  { id: "role", label: "الدور", visible: true, order: 14 },
  { id: "credit", label: "الرصيد", visible: true, order: 15 },
  { id: "diamonds", label: "الماسات", visible: true, order: 16 },
  { id: "premium_lifetime", label: "VIP مدى الحياة", visible: true, order: 17 },
  { id: "normal_vip", label: "VIP عادي", visible: true, order: 18 },
  { id: "mvp_member", label: "عضو MVP", visible: true, order: 19 },
  { id: "super_vip", label: "Super VIP", visible: true, order: 20 },
  { id: "diamond_vip", label: "Diamond VIP", visible: true, order: 21 },
  { id: "popularity", label: "الشهرة", visible: true, order: 22 },
  { id: "lastOnline", label: "آخر ظهور", visible: true, order: 23 },
  { id: "activationStatus", label: "حالة التفعيل", visible: true, order: 24 },
  { id: "profile_honestly_want", label: "ماذا تريد", visible: true, order: 25 },
  { id: "profile_relationship", label: "الحالة العاطفية", visible: true, order: 26 },
  { id: "profile_sexuality", label: "التوجه الجنسي", visible: true, order: 27 },
  { id: "profile_body_type", label: "نوع الجسم", visible: true, order: 28 },
  { id: "profile_living", label: "السكن", visible: true, order: 29 },
  { id: "profile_kids", label: "الأطفال", visible: true, order: 30 },
  { id: "profile_smoking", label: "التدخين", visible: true, order: 31 },
  { id: "profile_drinking", label: "الشرب", visible: true, order: 32 },
  { id: "createdAt", label: "تاريخ الإنشاء", visible: true, order: 33 },
];

export default function UsersManagement() {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const allUsersQuery = trpc.parse.getAllUsers.useQuery();
  const deleteUserMutation = trpc.parse.deleteUser.useMutation();

  // Get visible columns sorted by order
  const visibleColumns = useMemo(() => {
    return columns
      .filter((col) => col.visible)
      .sort((a, b) => a.order - b.order);
  }, [columns]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!allUsersQuery.data) return [];
    return allUsersQuery.data.filter((user: any) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.username?.toLowerCase().includes(searchLower) || false) ||
        (user.email?.toLowerCase().includes(searchLower) || false) ||
        (user.name?.toLowerCase().includes(searchLower) || false)
      );
    });
  }, [allUsersQuery.data, searchTerm]);

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

  const renderCellValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "نعم" : "لا";
    if (value instanceof Date) {
      return new Date(value).toLocaleDateString("ar-SA");
    }
    if (typeof value === "object") return JSON.stringify(value);
    const str = String(value);
    return str.length > 50 ? str.substring(0, 50) + "..." : str;
  };


  const exportToCSV = () => {
    if (!filteredUsers.length) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const headers = visibleColumns.map((col) => col.label);
    const rows = filteredUsers.map((user: any) =>
      visibleColumns.map((col) => {
        const value = user[col.id as keyof typeof user];
        return renderCellValue(value);
      })
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
          <p className="text-sm text-gray-600 mt-1">
            إجمالي: {allUsersQuery.data?.length || 0} | معروض: {filteredUsers.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={!filteredUsers.length}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowColumnManager(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            الأعمدة
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {allUsersQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.id}
                      className="text-right py-4 px-6 font-semibold text-gray-700 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={`${user.id}-${col.id}`}
                        className="py-4 px-6 text-gray-900 whitespace-nowrap"
                      >
                        <span className="inline-block max-w-xs truncate">
                          {renderCellValue((user as any)[col.id])}
                        </span>
                      </td>
                    ))}
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          title="تحرير البيانات"
                        >
                          <span className="text-green-600">✏️</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => user.id && handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد مستخدمون</p>
          </div>
        )}
      </Card>

      {/* Column Manager Modal */}
      {showColumnManager && (
        <ColumnManager
          columns={columns}
          onColumnsChange={setColumns}
          onClose={() => setShowColumnManager(false)}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <UserEditForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {
            allUsersQuery.refetch();
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

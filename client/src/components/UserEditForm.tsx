import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Save, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface UserEditFormProps {
  user: any;
  onClose: () => void;
  onSave: () => void;
}

export default function UserEditForm({
  user,
  onClose,
  onSave,
}: UserEditFormProps) {
  const [formData, setFormData] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const updateUserMutation = trpc.parse.updateUser.useMutation();

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: formData,
      });
      onSave();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label: string, field: string, type: string = "text") => {
    const value = formData[field];
    
    if (type === "boolean") {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <select
            value={value ? "true" : "false"}
            onChange={(e) => handleChange(field, e.target.value === "true")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">نعم</option>
            <option value="false">لا</option>
          </select>
        </div>
      );
    }

    if (type === "number") {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleChange(field, e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <textarea
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    return (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type={type}
          value={value || ""}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">تحرير بيانات المستخدم</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* المعلومات الأساسية */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("اسم المستخدم", "username")}
              {renderField("البريد الإلكتروني", "email", "email")}
              {renderField("الاسم الكامل", "name")}
              {renderField("الدور", "role")}
            </div>
          </div>

          {/* البيانات الشخصية */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              البيانات الشخصية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("الاسم", "name")}
              {renderField("العمر", "age", "number")}
              {renderField("الجنس", "gender")}
              {renderField("تاريخ الميلاد", "birthday", "date")}
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              معلومات الاتصال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("رقم الهاتف", "phone_number")}
              {renderField("الدولة", "country")}
              {renderField("المدينة", "city")}
            </div>
          </div>

          {/* معلومات العمل والتعليم */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              العمل والتعليم
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("الشركة", "company_name")}
              {renderField("المسمى الوظيفي", "job_title")}
              {renderField("المدرسة/الجامعة", "school")}
            </div>
          </div>

          {/* السيرة الذاتية */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              السيرة الذاتية
            </h3>
            <div className="space-y-4">
              {renderField("السيرة الذاتية", "bio", "textarea")}
              {renderField("عن نفسي", "aboutMe", "textarea")}
            </div>
          </div>

          {/* معلومات الملف الشخصي */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              الملف الشخصي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("ماذا تريد", "profile_honestly_want")}
              {renderField("الحالة العاطفية", "profile_relationship")}
              {renderField("التوجه الجنسي", "profile_sexuality")}
              {renderField("نوع الجسم", "profile_body_type")}
              {renderField("السكن", "profile_living")}
              {renderField("الأطفال", "profile_kids")}
              {renderField("التدخين", "profile_smoking", "boolean")}
              {renderField("الشرب", "profile_drinking", "boolean")}
            </div>
          </div>

          {/* الميزات المميزة */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              الميزات المميزة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("الرصيد", "credit", "number")}
              {renderField("الماسات", "diamonds", "number")}
              {renderField("VIP مدى الحياة", "premium_lifetime", "boolean")}
              {renderField("VIP عادي", "normal_vip", "boolean")}
              {renderField("عضو MVP", "mvp_member", "boolean")}
              {renderField("Super VIP", "super_vip", "boolean")}
              {renderField("Diamond VIP", "diamond_vip", "boolean")}
            </div>
          </div>

          {/* معلومات الحساب */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              معلومات الحساب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("الشهرة", "popularity", "number")}
              {renderField("آخر ظهور", "lastOnline", "date")}
              {renderField("حالة التفعيل", "activationStatus", "boolean")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

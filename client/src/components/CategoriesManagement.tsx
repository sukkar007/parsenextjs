// components/CategoriesManagement.tsx
import { Tag } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function CategoriesManagement() {
  return (
    <GenericDataManagement
      className="Category"
      title="Categories"
      description="Manage and organize content categories"
      icon={Tag}
      columns={[
        { key: "name", label: "Category Name", type: "text" },
        { key: "description", label: "Description", type: "text" },
        { key: "order", label: "Order", type: "number" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/categories/add"  // تغيير هنا
      editRoute="/admin/categories/edit"   // هذا صحيح
      viewRoute="/admin/categories/view"   // إضافة مسار العرض
    />
  );
}
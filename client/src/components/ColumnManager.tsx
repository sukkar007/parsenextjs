import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Settings, Eye, EyeOff, GripVertical, X } from "lucide-react";

export interface Column {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface ColumnManagerProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onClose: () => void;
}

export default function ColumnManager({
  columns,
  onColumnsChange,
  onClose,
}: ColumnManagerProps) {
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = localColumns.filter((col) =>
    col.label.includes(searchTerm)
  );

  const toggleColumnVisibility = (id: string) => {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const moveColumn = (id: string, direction: "up" | "down") => {
    const index = localColumns.findIndex((col) => col.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === localColumns.length - 1)
    ) {
      return;
    }

    const newColumns = [...localColumns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [
      newColumns[targetIndex],
      newColumns[index],
    ];

    // Update order values
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    setLocalColumns(newColumns);
  };

  const showAllColumns = () => {
    setLocalColumns((prev) =>
      prev.map((col) => ({ ...col, visible: true }))
    );
  };

  const hideAllColumns = () => {
    setLocalColumns((prev) =>
      prev.map((col) => ({ ...col, visible: false }))
    );
  };

  const saveChanges = () => {
    onColumnsChange(localColumns);
    onClose();
  };

  const visibleCount = localColumns.filter((col) => col.visible).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الأعمدة</h2>
            <p className="text-sm text-gray-600 mt-1">
              {visibleCount} من {localColumns.length} عمود مرئي
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="ابحث عن عمود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={showAllColumns}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              إظهار الكل
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={hideAllColumns}
              className="flex-1"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              إخفاء الكل
            </Button>
          </div>

          {/* Columns List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredColumns.map((column, index) => (
              <div
                key={column.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Drag Handle */}
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

                {/* Visibility Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumnVisibility(column.id)}
                  className="flex-shrink-0"
                >
                  {column.visible ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </Button>

                {/* Column Name */}
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {column.label}
                </span>

                {/* Order Buttons */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(column.id, "up")}
                    disabled={index === 0}
                    className="text-xs"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(column.id, "down")}
                    disabled={index === filteredColumns.length - 1}
                    className="text-xs"
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={saveChanges} className="bg-blue-600 hover:bg-blue-700">
            حفظ التغييرات
          </Button>
        </div>
      </Card>
    </div>
  );
}

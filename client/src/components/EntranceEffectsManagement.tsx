// components/EntranceEffectsManagement.tsx
import { Zap } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function EntranceEffectsManagement() {
  return (
    <GenericDataManagement
      className="EntranceEffect"
      title="Entrance Effects"
      description="Manage special entrance effects for users"
      icon={Zap}
      columns={[
        { key: "name", label: "Effect Name", type: "text" },
        { key: "type", label: "Effect Type", type: "text" },
        { key: "file", label: "Effect File", type: "image" },
        { key: "price", label: "Price", type: "number" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/entrance-effects/add"
      editRoute="/admin/entrance-effects/edit"
    />
  );
}
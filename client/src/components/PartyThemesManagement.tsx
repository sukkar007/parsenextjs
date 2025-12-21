// components/PartyThemesManagement.tsx
import { PartyPopper } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function PartyThemesManagement() {
  return (
    <GenericDataManagement
      className="PartyTheme"
      title="Party Themes"
      description="Manage party themes and decorations"
      icon={PartyPopper}
      columns={[
        { key: "name", label: "Theme Name", type: "text" },
        { key: "description", label: "Description", type: "text" },
        { key: "background", label: "Background", type: "image" },
        { key: "elements", label: "Elements", type: "text" },
        { key: "price", label: "Price", type: "number" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/party-themes/add"
      editRoute="/admin/party-themes/edit"
    />
  );
}
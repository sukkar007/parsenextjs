// components/AnnouncementsManagement.tsx
import { Megaphone } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function AnnouncementsManagement() {
  return (
    <GenericDataManagement
      className="Announcement"
      title="Announcements"
      description="Manage official announcements and notifications"
      icon={Megaphone}
      columns={[
        { key: "title", label: "Title", type: "text" },
        { key: "content", label: "Content", type: "text" },
        { key: "type", label: "Type", type: "text" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "priority", label: "Priority", type: "number" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/announcements/add"
      editRoute="/admin/announcements/edit"
    />
  );
}
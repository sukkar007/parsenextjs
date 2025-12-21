// components/VideosManagement.tsx
import { Film } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function VideosManagement() {
  return (
    <GenericDataManagement
      className="Video"
      title="Videos"
      description="Manage video content"
      icon={Film}
      columns={[
        { key: "title", label: "Video Title", type: "text" },
        { key: "description", label: "Description", type: "text" },
        { key: "thumbnail", label: "Thumbnail", type: "image" },
        { key: "views", label: "Views", type: "number" },
        { key: "likes", label: "Likes", type: "number" },
        { key: "isApproved", label: "Approved", type: "boolean" },
        { key: "createdAt", label: "Uploaded At", type: "date" },
      ]}
      editRoute="/admin/videos/edit"
    />
  );
}
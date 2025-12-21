// components/StreamingManagement.tsx
import { Video } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function StreamingManagement() {
  return (
    <GenericDataManagement
      className="Streaming"
      title="Streaming"
      description="Manage live streaming sessions"
      icon={Video}
      columns={[
        { key: "title", label: "Stream Title", type: "text" },
        { key: "host", label: "Host", type: "user" },
        { key: "viewers", label: "Viewers", type: "number" },
        { key: "status", label: "Status", type: "status" },
        { key: "duration", label: "Duration", type: "number" },
        { key: "createdAt", label: "Started At", type: "date" },
      ]}
      editRoute="/admin/streaming/edit"
    />
  );
}
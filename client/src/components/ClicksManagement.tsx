ClicksManagement.tsx
// components/ClicksManagement.tsx
import { MousePointerClick } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function ClicksManagement() {
  return (
    <GenericDataManagement
      className="Click"
      title="Clicks"
      description="Manage phone clicks and interactions"
      icon={MousePointerClick}
      columns={[
        { key: "user", label: "User", type: "user" },
        { key: "target", label: "Target", type: "text" },
        { key: "action", label: "Action", type: "text" },
        { key: "device", label: "Device", type: "text" },
        { key: "createdAt", label: "Clicked At", type: "date" },
      ]}
    />
  );
}
// components/CallsManagement.tsx
import { Phone } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function CallsManagement() {
  return (
    <GenericDataManagement
      className="Call"
      title="Calls"
      description="Manage voice and video calls"
      icon={Phone}
      columns={[
        { key: "caller", label: "Caller", type: "user" },
        { key: "receiver", label: "Receiver", type: "user" },
        { key: "type", label: "Call Type", type: "text" },
        { key: "duration", label: "Duration", type: "number" },
        { key: "status", label: "Status", type: "text" },
        { key: "createdAt", label: "Called At", type: "date" },
      ]}
    />
  );
}
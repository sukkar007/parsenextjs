// components/EncountersManagement.tsx
import { Users } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function EncountersManagement() {
  return (
    <GenericDataManagement
      className="Encounter"
      title="Encounters"
      description="Manage user encounters and matches"
      icon={Users}
      columns={[
        { key: "user1", label: "User 1", type: "user" },
        { key: "user2", label: "User 2", type: "user" },
        { key: "status", label: "Status", type: "text" },
        { key: "createdAt", label: "Matched At", type: "date" },
      ]}
    />
  );
}
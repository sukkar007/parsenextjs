// components/ChallengesManagement.tsx
import { Trophy } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function ChallengesManagement() {
  return (
    <GenericDataManagement
      className="Challenge"
      title="Challenges"
      description="Manage challenges and competitions"
      icon={Trophy}
      columns={[
        { key: "title", label: "Challenge Title", type: "text" },
        { key: "description", label: "Description", type: "text" },
        { key: "reward", label: "Reward", type: "text" },
        { key: "participants", label: "Participants", type: "number" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/challenges/add"
      editRoute="/admin/challenges/edit"
    />
  );
}
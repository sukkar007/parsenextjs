// components/CommentsManagement.tsx
import { MessageSquare } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function CommentsManagement() {
  return (
    <GenericDataManagement
      className="Comment"
      title="Comments"
      description="Manage user comments and feedback"
      icon={MessageSquare}
      columns={[
        { key: "content", label: "Comment", type: "text" },
        { key: "author", label: "Author", type: "user" },
        { key: "post", label: "Post", type: "text" },
        { key: "likes", label: "Likes", type: "number" },
        { key: "isApproved", label: "Approved", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
    />
  );
}
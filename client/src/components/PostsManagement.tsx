// components/PostsManagement.tsx
import { FileText } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function PostsManagement() {
  return (
    <GenericDataManagement
      className="Post"
      title="Posts"
      description="Manage user posts and content"
      icon={FileText}
      columns={[
        { key: "title", label: "Post Title", type: "text" },
        { key: "content", label: "Content", type: "text" },
        { key: "author", label: "Author", type: "user" },
        { key: "likes", label: "Likes", type: "number" },
        { key: "comments", label: "Comments", type: "number" },
        { key: "isPublished", label: "Published", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
    />
  );
}
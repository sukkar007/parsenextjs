// components/AdsManagement.tsx
import { Radio } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function AdsManagement() {
  return (
    <GenericDataManagement
      className="Ad"
      title="Ads"
      description="Manage advertisements and promotions"
      icon={Radio}
      columns={[
        { key: "title", label: "Ad Title", type: "text" },
        { key: "adType", label: "Type", type: "text" },
        { key: "image", label: "Image", type: "image" },
        { key: "url", label: "URL", type: "text" },
        { key: "clicks", label: "Clicks", type: "number" },
        { key: "isActive", label: "Active", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
      ]}
      createRoute="/admin/ads/add"
      editRoute="/admin/ads/edit"
    />
  );
}
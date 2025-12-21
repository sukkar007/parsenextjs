// client/src/components/UserDetails.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail, Phone, MapPin, Briefcase, Heart, Users } from "lucide-react";

interface UserData {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  birthday?: string;
  age?: number;
  gender?: string;
  avatar?: string;
  cover?: string;
  country?: string;
  city?: string;
  phone_number?: string;
  company_name?: string;
  job_title?: string;
  school?: string;
  aboutMe?: string;
  role?: string;
  popularity?: number;
  lastOnline?: string;
  activationStatus?: string;
  accountDeleted?: boolean;
  credit?: number;
  diamonds?: number;
  premium_lifetime?: boolean;
  normal_vip?: boolean;
  mvp_member?: boolean;
  super_vip?: boolean;
  diamond_vip?: boolean;
  profile_honestly_want?: string;
  profile_relationship?: string;
  profile_sexuality?: string;
  profile_body_height?: string;
  profile_body_type?: string;
  profile_living?: string;
  profile_kids?: string;
  profile_smoking?: string;
  profile_drinking?: string;
  profile_language?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface UserDetailsProps {
  user: UserData;
  onClose: () => void;
}

export default function UserDetails({ user, onClose }: UserDetailsProps) {
  const renderValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return new Date(value).toLocaleDateString();
    return String(value);
  };

  const sections = [
    {
      title: "Basic Information",
      icon: Users,
      fields: [
        { label: "User ID", key: "id" },
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Role", key: "role" },
      ],
    },
    {
      title: "Personal Information",
      icon: Users,
      fields: [
        { label: "Full Name", key: "name" },
        { label: "First Name", key: "first_name" },
        { label: "Last Name", key: "last_name" },
        { label: "Birthday", key: "birthday" },
        { label: "Age", key: "age" },
        { label: "Gender", key: "gender" },
        { label: "Bio", key: "bio" },
        { label: "About Me", key: "aboutMe" },
      ],
    },
    {
      title: "Contact Information",
      icon: Phone,
      fields: [
        { label: "Phone Number", key: "phone_number" },
        { label: "Country", key: "country" },
        { label: "City", key: "city" },
      ],
    },
    {
      title: "Work & Education",
      icon: Briefcase,
      fields: [
        { label: "Company", key: "company_name" },
        { label: "Job Title", key: "job_title" },
        { label: "School/University", key: "school" },
      ],
    },
    {
      title: "Profile Information",
      icon: Heart,
      fields: [
        { label: "Looking For", key: "profile_honestly_want" },
        { label: "Relationship Status", key: "profile_relationship" },
        { label: "Sexuality", key: "profile_sexuality" },
        { label: "Height", key: "profile_body_height" },
        { label: "Body Type", key: "profile_body_type" },
        { label: "Living Situation", key: "profile_living" },
        { label: "Children", key: "profile_kids" },
        { label: "Smoking", key: "profile_smoking" },
        { label: "Drinking", key: "profile_drinking" },
        { label: "Language", key: "profile_language" },
      ],
    },
    {
      title: "Premium Features",
      icon: Users,
      fields: [
        { label: "Credit", key: "credit" },
        { label: "Diamonds", key: "diamonds" },
        { label: "Lifetime Premium", key: "premium_lifetime" },
        { label: "Normal VIP", key: "normal_vip" },
        { label: "MVP Member", key: "mvp_member" },
        { label: "Super VIP", key: "super_vip" },
        { label: "Diamond VIP", key: "diamond_vip" },
      ],
    },
    {
      title: "Account Information",
      icon: Users,
      fields: [
        { label: "Popularity", key: "popularity" },
        { label: "Last Online", key: "lastOnline" },
        { label: "Activation Status", key: "activationStatus" },
        { label: "Account Deleted", key: "accountDeleted" },
        { label: "Created At", key: "createdAt" },
        { label: "Updated At", key: "updatedAt" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Avatar and Basic Info */}
          {user.avatar && (
            <div className="text-center">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => {
            const Icon = section.icon;
            const hasData = section.fields.some((field) => user[field.key]);

            if (!hasData) return null;

            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {section.fields.map((field) => {
                    const value = user[field.key];
                    if (value === null || value === undefined) return null;

                    return (
                      <div key={field.key} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <p className="text-sm text-gray-600 font-medium">
                          {field.label}
                        </p>
                        <p className="text-gray-900 mt-1">
                          {renderValue(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Additional Fields */}
          {Object.keys(user).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                {Object.entries(user).map(([key, value]) => {
                  // Skip already displayed fields
                  const displayedKeys = [
                    "id",
                    "username",
                    "email",
                    "name",
                    "first_name",
                    "last_name",
                    "bio",
                    "birthday",
                    "age",
                    "gender",
                    "avatar",
                    "cover",
                    "country",
                    "city",
                    "phone_number",
                    "company_name",
                    "job_title",
                    "school",
                    "aboutMe",
                    "role",
                    "popularity",
                    "lastOnline",
                    "activationStatus",
                    "accountDeleted",
                    "credit",
                    "diamonds",
                    "premium_lifetime",
                    "normal_vip",
                    "mvp_member",
                    "super_vip",
                    "diamond_vip",
                    "profile_honestly_want",
                    "profile_relationship",
                    "profile_sexuality",
                    "profile_body_height",
                    "profile_body_type",
                    "profile_living",
                    "profile_kids",
                    "profile_smoking",
                    "profile_drinking",
                    "profile_language",
                    "createdAt",
                    "updatedAt",
                  ];

                  if (displayedKeys.includes(key)) return null;

                  return (
                    <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <p className="text-sm text-gray-600 font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-gray-900 mt-1 break-words">
                        {renderValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
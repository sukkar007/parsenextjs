import { useState } from "react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "نعم" : "لا";
    if (value instanceof Date) return new Date(value).toLocaleDateString("ar-SA");
    return String(value);
  };

  const sections = [
    {
      title: "المعلومات الأساسية",
      icon: Users,
      fields: [
        { label: "معرّف المستخدم", key: "id" },
        { label: "اسم المستخدم", key: "username" },
        { label: "البريد الإلكتروني", key: "email" },
        { label: "الدور", key: "role" },
      ],
    },
    {
      title: "البيانات الشخصية",
      icon: Users,
      fields: [
        { label: "الاسم الكامل", key: "name" },
        { label: "الاسم الأول", key: "first_name" },
        { label: "الاسم الأخير", key: "last_name" },
        { label: "تاريخ الميلاد", key: "birthday" },
        { label: "العمر", key: "age" },
        { label: "الجنس", key: "gender" },
        { label: "السيرة الذاتية", key: "bio" },
        { label: "عن نفسي", key: "aboutMe" },
      ],
    },
    {
      title: "معلومات الاتصال",
      icon: Phone,
      fields: [
        { label: "رقم الهاتف", key: "phone_number" },
        { label: "الدولة", key: "country" },
        { label: "المدينة", key: "city" },
      ],
    },
    {
      title: "معلومات العمل والتعليم",
      icon: Briefcase,
      fields: [
        { label: "اسم الشركة", key: "company_name" },
        { label: "المسمى الوظيفي", key: "job_title" },
        { label: "المدرسة/الجامعة", key: "school" },
      ],
    },
    {
      title: "معلومات الملف الشخصي",
      icon: Heart,
      fields: [
        { label: "ماذا تريد", key: "profile_honestly_want" },
        { label: "الحالة العاطفية", key: "profile_relationship" },
        { label: "التوجه الجنسي", key: "profile_sexuality" },
        { label: "الطول", key: "profile_body_height" },
        { label: "نوع الجسم", key: "profile_body_type" },
        { label: "السكن", key: "profile_living" },
        { label: "الأطفال", key: "profile_kids" },
        { label: "التدخين", key: "profile_smoking" },
        { label: "الشرب", key: "profile_drinking" },
        { label: "اللغة", key: "profile_language" },
      ],
    },
    {
      title: "الميزات المميزة",
      icon: Users,
      fields: [
        { label: "الرصيد", key: "credit" },
        { label: "الماسات", key: "diamonds" },
        { label: "VIP مدى الحياة", key: "premium_lifetime" },
        { label: "VIP عادي", key: "normal_vip" },
        { label: "عضو MVP", key: "mvp_member" },
        { label: "Super VIP", key: "super_vip" },
        { label: "Diamond VIP", key: "diamond_vip" },
      ],
    },
    {
      title: "معلومات الحساب",
      icon: Users,
      fields: [
        { label: "الشهرة", key: "popularity" },
        { label: "آخر ظهور", key: "lastOnline" },
        { label: "حالة التفعيل", key: "activationStatus" },
        { label: "الحساب محذوف", key: "accountDeleted" },
        { label: "تاريخ الإنشاء", key: "createdAt" },
        { label: "آخر تحديث", key: "updatedAt" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h2>
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
                معلومات إضافية
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
            إغلاق
          </Button>
        </div>
      </Card>
    </div>
  );
}

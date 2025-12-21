import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSearchParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  Edit2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Hash,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function ViewCategory() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");

  const { data: category, isLoading } = trpc.parse.queryClass.useQuery(
    {
      className: "Category",
      limit: 1,
    },
    {
      enabled: !!categoryId,
      select: (data) => data.find((item: any) => item.id === categoryId),
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading category details...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The category you're trying to view doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/admin/categories")}>
            Back to Categories
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin/categories")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category.name || "Unnamed Category"}
            </h1>
            <p className="text-gray-600 mt-1">Category Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/admin/categories/edit?id=${categoryId}`)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => setLocation("/admin/categories")}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Category Name
                </Label>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {category.name || "No Name"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Description
                </Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {category.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Display Order
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-medium">
                      {category.order || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <div className="mt-2">
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                      className={
                        category.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {category.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Category Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Category ID</span>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {categoryId?.substring(0, 8)}...
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">
                    {category.updatedAt
                      ? new Date(category.updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  setLocation(`/admin/categories/edit?id=${categoryId}`)
                }
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Category
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigator.clipboard.writeText(categoryId || "")}
              >
                Copy ID
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete this category? This action cannot be undone."
                    )
                  ) {
                    // Add delete logic here
                  }
                }}
              >
                Delete Category
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Usage Notes</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Categories organize content in the app</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Only active categories are visible to users</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Order determines display sequence</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
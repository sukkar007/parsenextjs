import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSearchParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EditCategory() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const { data: category, isLoading: loadingCategory } = trpc.parse.queryClass.useQuery(
    {
      className: "Category",
      limit: 1,
    },
    {
      enabled: !!categoryId,
      select: (data) => data.find((item: any) => item.id === categoryId),
    }
  );

  const updateMutation = trpc.parse.updateObject.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully!");
      setLocation("/admin/categories");
    },
    onError: (error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setOrder(category.order || 0);
      setIsActive(category.isActive !== false);
      setLoading(false);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      toast.error("Category ID is missing");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        className: "Category",
        objectId: categoryId,
        data: {
          name,
          description,
          order,
          isActive,
        },
      });
    } catch (error) {
      console.error("Update category error:", error);
    }
  };

  if (loadingCategory || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading category...</span>
        </div>
      </div>
    );
  }

  if (!category && !loadingCategory) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The category you're trying to edit doesn't exist or has been removed.
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-gray-600 mt-1">Update category information</p>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              ID: {categoryId}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    placeholder="0"
                    className="mt-2"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="status" className="text-base font-medium">
                    Status
                  </Label>
                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isActive
                          ? "Category will be visible to users"
                          : "Category will be hidden"}
                      </p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Category
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setLocation("/admin/categories")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full mt-3"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this category?")) {
                        // Add delete logic here
                        toast.info("Delete functionality to be implemented");
                      }
                    }}
                  >
                    Delete Category
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Category Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {category?.createdAt ? new Date(category.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">
                    {category?.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
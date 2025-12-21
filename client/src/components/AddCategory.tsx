import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AddCategory() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const createMutation = trpc.parse.createObject.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully!");
      setLocation("/admin/categories");
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        className: "Category",
        data: {
          name,
          description,
          order,
          isActive,
        },
      });
    } catch (error) {
      console.error("Create category error:", error);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
            <p className="text-gray-600 mt-1">Create a new content category</p>
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
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Category
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
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Category Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Categories help organize your content</p>
                <p>• Active categories are visible to users</p>
                <p>• Use order to control display sequence</p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
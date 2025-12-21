import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function AddAnnouncement() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createMutation = trpc.parse.createObject.useMutation({
    onSuccess: () => {
      toast.success("Announcement created successfully!");
      setLocation("/admin/announcements");
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`);
    },
  });

  const uploadMutation = trpc.parse.uploadFile.useMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: any = {
        title,
        content,
        type,
        priority: Number(priority),
        isActive,
      };

      // Upload image if exists
      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const uploadResult = await uploadMutation.mutateAsync({
            base64,
            fileName: imageFile.name,
            mimeType: imageFile.type,
          });

          if (uploadResult.success) {
            data.image = {
              __type: "File",
              name: imageFile.name,
              url: uploadResult.fileUrl,
            };
            
            await createMutation.mutateAsync({
              className: "Announcement",
              data,
            });
          }
        };
      } else {
        await createMutation.mutateAsync({
          className: "Announcement",
          data,
        });
      }
    } catch (error) {
      console.error("Create announcement error:", error);
      toast.error("Failed to create announcement");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin/announcements")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Announcement</h1>
            <p className="text-gray-600 mt-1">Create official announcement for users</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Announcement Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter announcement content..."
                    className="mt-2 min-h-[200px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={priority.toString()} 
                      onValueChange={(value) => setPriority(Number(value))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low (1)</SelectItem>
                        <SelectItem value="2">Medium (2)</SelectItem>
                        <SelectItem value="3">High (3)</SelectItem>
                        <SelectItem value="4">Critical (4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Announcement Image (Optional)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">
                              {imageFile?.name}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="font-medium text-gray-700">
                                Click to upload image
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
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
                          ? "Announcement will be visible"
                          : "Announcement will be hidden"}
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
                        Publish Announcement
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setLocation("/admin/announcements")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Announcement Types
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium">General:</span> Regular updates
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-medium">Important:</span> Critical information
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">Update:</span> System updates
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">Maintenance:</span> Service interruptions
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="font-medium">Promotion:</span> Special offers
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
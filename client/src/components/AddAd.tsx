import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Link as LinkIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AddAd() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [adType, setAdType] = useState("banner");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createMutation = trpc.parse.createObject.useMutation({
    onSuccess: () => {
      toast.success("Ad created successfully!");
      setLocation("/admin/ads");
    },
    onError: (error) => {
      toast.error(`Failed to create ad: ${error.message}`);
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
    
    if (!imageFile) {
      toast.error("Please upload an ad image");
      return;
    }

    try {
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
          await createMutation.mutateAsync({
            className: "Ad",
            data: {
              title,
              adType,
              url,
              isActive,
              image: {
                __type: "File",
                name: imageFile.name,
                url: uploadResult.fileUrl,
              },
              clicks: 0,
            },
          });
        }
      };
    } catch (error) {
      console.error("Create ad error:", error);
      toast.error("Failed to create ad");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin/ads")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Ad</h1>
            <p className="text-gray-600 mt-1">Add advertisement to the platform</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Ad Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter ad title"
                    className="mt-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type">Ad Type</Label>
                    <Select value={adType} onValueChange={setAdType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="interstitial">Interstitial</SelectItem>
                        <SelectItem value="video">Video Ad</SelectItem>
                        <SelectItem value="native">Native Ad</SelectItem>
                        <SelectItem value="rewarded">Rewarded Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="url">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Target URL
                      </div>
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Ad Image *</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-3">
                    Recommended sizes: Banner (728x90), Interstitial (1200x627)
                  </p>
                  <div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="image">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">
                              {imageFile?.name} • {imageFile && `${(imageFile.size / 1024).toFixed(2)} KB`}
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
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="font-medium text-gray-700">
                                Click to upload ad image
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                PNG, JPG, GIF up to 10MB
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
                          ? "Ad will be displayed"
                          : "Ad will be paused"}
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
                    disabled={createMutation.isLoading || !imageFile}
                  >
                    {createMutation.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Ad
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setLocation("/admin/ads")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Ad Specifications
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Banner:</span> 728×90, 300×250
                </div>
                <div>
                  <span className="font-medium">Interstitial:</span> 1200×627
                </div>
                <div>
                  <span className="font-medium">Video:</span> MP4, up to 30s
                </div>
                <div>
                  <span className="font-medium">Native:</span> 1200×628
                </div>
                <div className="pt-2 text-xs text-gray-500">
                  All images should be high quality and optimized
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3">
                Tracking Information
              </h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• Clicks will be automatically tracked</p>
                <p>• Impression data available in analytics</p>
                <p>• Performance reports generated weekly</p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
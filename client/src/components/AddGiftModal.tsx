// src/components/AddGiftModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Upload,
  Gift,
  Coins,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGiftModal({ isOpen, onClose, onSuccess }: AddGiftModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("love");
  const [credits, setCredits] = useState("100");
  const [description, setDescription] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    { value: "love", label: "❤️ Love" },
    { value: "moods", label: "😊 Moods" },
    { value: "artists", label: "🎨 Artists" },
    { value: "collectibles", label: "📦 Collectibles" },
    { value: "games", label: "🎮 Games" },
    { value: "family", label: "👨‍👩‍👧‍👦 Family" },
    { value: "classic", label: "🏛️ Classic" },
    { value: "3d", label: "🔷 3D" },
    { value: "vip", label: "👑 VIP" },
    { value: "svga_gifts", label: "🎁 SVGA Gifts" },
  ];

  const createGiftMutation = trpc.parse.createGift.useMutation({
    onMutate: () => {
      setUploadProgress(10);
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      setSuccess(`Gift "${name}" created successfully!`);
      setTimeout(() => {
        onSuccess();
        resetForm();
        onClose();
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setUploadProgress(0);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'preview') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'main') {
      // التحقق من نوع الملف الرئيسي
      const validTypes = ['.svga', '.gif', '.png', '.jpg', '.jpeg', '.webp'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setError(`Invalid file type. Please upload one of: ${validTypes.join(', ')}`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError("Main file size must be less than 10MB");
        return;
      }
      
      setMainFile(file);
    } else {
      // التحقق من نوع ملف المعاينة
      const validPreviewTypes = ['.png', '.jpg', '.jpeg', '.webp'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validPreviewTypes.includes(fileExt)) {
        setError(`Preview must be an image: ${validPreviewTypes.join(', ')}`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("Preview image must be less than 5MB");
        return;
      }
      
      setPreviewFile(file);
    }
    
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    // التحقق من المدخلات
    if (!name.trim()) {
      setError("Gift name is required");
      return;
    }

    if (!mainFile) {
      setError("Main file is required");
      return;
    }

    if (!previewFile) {
      setError("Preview image is required");
      return;
    }

    if (!credits || parseInt(credits) <= 0) {
      setError("Credits must be a positive number");
      return;
    }

    try {
      setError(null);
      setUploadProgress(20);

      // تحويل الملفات إلى base64
      const [mainBase64, previewBase64] = await Promise.all([
        fileToBase64(mainFile),
        fileToBase64(previewFile),
      ]);

      setUploadProgress(50);

      // إنشاء الهدية
      await createGiftMutation.mutateAsync({
        name: name.trim(),
        categories: category,
        coins: parseInt(credits),
        fileData: {
          base64: mainBase64,
          fileName: mainFile.name,
          mimeType: mainFile.type || 'application/svga'
        },
        previewData: {
          base64: previewBase64,
          fileName: previewFile.name,
          mimeType: previewFile.type || 'image/png'
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create gift");
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("love");
    setCredits("100");
    setDescription("");
    setMainFile(null);
    setPreviewFile(null);
    setStep(1);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4" />
                Gift Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter gift name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                Category *
              </Label>
              <select
                id="category"
                className="w-full p-2 border rounded-md"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="credits" className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4" />
                Credits Cost *
              </Label>
              <Input
                id="credits"
                type="number"
                min="1"
                placeholder="Enter credits cost"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Enter gift description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Next: Upload Files
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="block mb-4 font-medium">
                Main Gift File (SVGA/GIF/Image) *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="mainFile"
                  className="hidden"
                  accept=".svga,.gif,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => handleFileUpload(e, 'main')}
                />
                <label htmlFor="mainFile" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    {mainFile ? mainFile.name : "Click to upload main file"}
                  </p>
                  <p className="text-sm text-gray-500">
                    SVGA, GIF, PNG, JPG, WebP (Max 10MB)
                  </p>
                </label>
              </div>
              {mainFile && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  File selected: {mainFile.name} ({(mainFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-4 font-medium">
                Preview Image *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="previewFile"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => handleFileUpload(e, 'preview')}
                />
                <label htmlFor="previewFile" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    {previewFile ? previewFile.name : "Click to upload preview image"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WebP (Max 5MB)
                  </p>
                </label>
              </div>
              {previewFile && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(previewFile)}
                    alt="Preview"
                    className="max-w-full h-40 object-contain mx-auto rounded-lg border"
                  />
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Preview selected: {previewFile.name}
                  </p>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div>
                <Label className="block mb-2">Upload Progress</Label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {uploadProgress}% Complete
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Success!</span>
                </div>
                <p className="text-green-600 mt-2">{success}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createGiftMutation.isLoading || !mainFile || !previewFile}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {createGiftMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Gift'
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Gift</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className={`px-3 py-1 rounded-full text-sm ${step === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  Step 1: Details
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${step === 2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  Step 2: Files
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {renderStepContent()}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>
                * Required fields. Gift will be available to users immediately after creation.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
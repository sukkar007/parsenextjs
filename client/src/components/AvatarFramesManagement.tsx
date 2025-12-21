// client/src/components/AvatarFramesManagement.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Coins,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  RefreshCw,
  X,
  Film,
  FileImage,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// دالة لإصلاح روابط الصور
const fixImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // إذا كان الرابط يحتوي على files/myAppId فقط
  if (url.includes('/files/myAppId/') && !url.includes('/parse/files/myAppId/')) {
    return url.replace('/files/myAppId/', '/parse/files/myAppId/');
  }
  
  // إذا كان الرابط يبدأ بـ /files/ مباشرة
  if (url.startsWith('/files/')) {
    return `https://parse-server-example-o1ht.onrender.com/parse${url}`;
  }
  
  // إذا كان الرابط لا يحتوي على النطاق
  if (!url.startsWith('http')) {
    return `https://parse-server-example-o1ht.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  return url;
};

// أيقونة بديلة عند فشل تحميل الصورة
const placeholderIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMzAgMjBDMjYuMTM0IDIwIDIzIDIzLjEzNCAyMyAyN0MyMyAzMC44NjYgMjYuMTM0IDM0IDMwIDM0QzMzLjg2NiAzNCAzNyAzMC44NjYgMzcgMjdDMzcgMjMuMTM0IDMzLjg2NiAyMCAzMCAyMFpNMzAgMzZDMjMuMzcgMzYgMTggNDEuMzcgMTggNDhMNDIgNDhDNDIgNDEuMzcgMzYuNjMgMzYgMzAgMzZaIiBmaWxsPSIjRTBFMEUwIi8+Cjwvc3ZnPgo=';

// دالة للتحقق من أنواع الملفات
const ALLOWED_FILE_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 
  'image/webp', 'image/apng', 'image/svg+xml', 
  'application/octet-stream' // لملفات SVGA
];

const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.apng', '.svg', '.svga'
];

const isFileTypeAllowed = (file: File): boolean => {
  const extension = '.' + file.name.toLowerCase().split('.').pop();
  return ALLOWED_FILE_TYPES.includes(file.type) || 
         ALLOWED_EXTENSIONS.includes(extension);
};

const getFileTypeIcon = (fileName: string, mimeType: string) => {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.endsWith('.gif') || mimeType === 'image/gif') {
    return { icon: Film, color: "text-green-600", label: "GIF" };
  }
  if (lowerName.endsWith('.webp') || mimeType === 'image/webp') {
    return { icon: Film, color: "text-purple-600", label: "WebP" };
  }
  if (lowerName.endsWith('.apng') || mimeType === 'image/apng') {
    return { icon: Film, color: "text-blue-600", label: "APNG" };
  }
  if (lowerName.endsWith('.svga')) {
    return { icon: FileImage, color: "text-orange-600", label: "SVGA" };
  }
  return { icon: ImageIcon, color: "text-gray-600", label: "Image" };
};

export default function AvatarFramesManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMode, setUploadMode] = useState<'simple' | 'advanced'>('simple');
  
  const [simpleFrame, setSimpleFrame] = useState({
    name: "",
    credits: 0,
    period: 15,
    file: null as File | null,
    previewUrl: "",
  });
  
  const [advancedFrame, setAdvancedFrame] = useState({
    name: "",
    credits: 0,
    period: 15,
    mainFile: null as File | null,
    previewFile: null as File | null,
    mainPreviewUrl: "",
    previewPreviewUrl: "",
  });
  
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const simpleFileInputRef = useRef<HTMLInputElement>(null);

  const { data: frames = [], isLoading, refetch } = trpc.parse.getAvatarFrames.useQuery();
  const createFrameMutation = trpc.parse.createAvatarFrame.useMutation();
  const createAdvancedFrameMutation = trpc.parse.createAvatarFrameAdvanced.useMutation();
  const deleteFrameMutation = trpc.parse.deleteObject.useMutation();
  const testUploadMutation = trpc.parse.testFileUpload.useMutation();

  const handleSimpleFileSelect = async (file: File) => {
    if (!isFileTypeAllowed(file)) {
      toast.error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSimpleFrame(prev => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
  };

  const handleAdvancedFileSelect = async (file: File, type: 'main' | 'preview') => {
    if (!isFileTypeAllowed(file)) {
      toast.error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    // التحقق من حجم الملف (15MB كحد أقصى للـ SVGA)
    const maxSize = file.name.toLowerCase().endsWith('.svga') ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (type === 'main') {
      setAdvancedFrame(prev => ({
        ...prev,
        mainFile: file,
        mainPreviewUrl: URL.createObjectURL(file)
      }));
    } else {
      setAdvancedFrame(prev => ({
        ...prev,
        previewFile: file,
        previewPreviewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleSimpleAddFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!simpleFrame.file) {
      toast.error("Please select a file");
      return;
    }

    try {
      toast.loading("Creating avatar frame...", { id: "create-frame" });

      // تحويل الملف إلى base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(simpleFrame.file!);
      });

      console.log("Creating simple frame with data:", {
        name: simpleFrame.name,
        credits: simpleFrame.credits,
        fileSize: simpleFrame.file!.size,
        fileName: simpleFrame.file!.name,
        mimeType: simpleFrame.file!.type
      });

      // إنشاء الإطار
      const result = await createFrameMutation.mutateAsync({
        name: simpleFrame.name,
        credits: simpleFrame.credits,
        period: simpleFrame.period,
        fileData: {
          base64,
          fileName: simpleFrame.file.name,
          mimeType: simpleFrame.file.type
        }
      });

      console.log("Simple frame created successfully:", result);
      toast.success("Avatar frame created successfully", { id: "create-frame" });
      
      // إعادة تعيين النموذج
      setSimpleFrame({
        name: "",
        credits: 0,
        period: 15,
        file: null,
        previewUrl: "",
      });
      
      if (simpleFrame.previewUrl) {
        URL.revokeObjectURL(simpleFrame.previewUrl);
      }
      
      setShowAddModal(false);
      refetch();
      
    } catch (error: any) {
      console.error("Create simple frame error:", error);
      toast.error(error?.message || "Failed to create frame");
    }
  };

  const handleAdvancedAddFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!advancedFrame.mainFile) {
      toast.error("Please select a main file");
      return;
    }

    try {
      toast.loading("Creating advanced avatar frame...", { id: "create-advanced-frame" });

      // تحويل الملفات إلى base64
      const mainBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(advancedFrame.mainFile!);
      });

      let previewBase64: string | undefined;
      if (advancedFrame.previewFile) {
        previewBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(advancedFrame.previewFile!);
        });
      }

      console.log("Creating advanced frame with data:", {
        name: advancedFrame.name,
        credits: advancedFrame.credits,
        mainFile: {
          size: advancedFrame.mainFile!.size,
          name: advancedFrame.mainFile!.name,
          mimeType: advancedFrame.mainFile!.type
        },
        previewFile: advancedFrame.previewFile ? {
          size: advancedFrame.previewFile!.size,
          name: advancedFrame.previewFile!.name,
          mimeType: advancedFrame.previewFile!.type
        } : undefined
      });

      // إنشاء الإطار المتقدم
      const result = await createAdvancedFrameMutation.mutateAsync({
        name: advancedFrame.name,
        credits: advancedFrame.credits,
        period: advancedFrame.period,
        files: {
          mainFile: {
            base64: mainBase64,
            fileName: advancedFrame.mainFile.name,
            mimeType: advancedFrame.mainFile.type
          },
          previewFile: previewBase64 ? {
            base64: previewBase64,
            fileName: advancedFrame.previewFile!.name,
            mimeType: advancedFrame.previewFile!.type
          } : undefined
        }
      });

      console.log("Advanced frame created successfully:", result);
      toast.success("Advanced avatar frame created successfully", { id: "create-advanced-frame" });
      
      // إعادة تعيين النموذج
      setAdvancedFrame({
        name: "",
        credits: 0,
        period: 15,
        mainFile: null,
        previewFile: null,
        mainPreviewUrl: "",
        previewPreviewUrl: "",
      });
      
      if (advancedFrame.mainPreviewUrl) {
        URL.revokeObjectURL(advancedFrame.mainPreviewUrl);
      }
      if (advancedFrame.previewPreviewUrl) {
        URL.revokeObjectURL(advancedFrame.previewPreviewUrl);
      }
      
      setShowAddModal(false);
      refetch();
      
    } catch (error: any) {
      console.error("Create advanced frame error:", error);
      toast.error(error?.message || "Failed to create advanced frame");
    }
  };

  const handleDeleteFrame = async (frameId: string, frameName: string) => {
    if (!confirm(`Delete frame "${frameName}"?`)) return;
    
    try {
      await deleteFrameMutation.mutateAsync({
        className: "Gifts",
        objectId: frameId,
      });
      toast.success("Frame deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete frame");
      console.error(error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredFrames = frames.filter(frame =>
    frame.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSimpleFile = () => {
    if (simpleFrame.previewUrl) {
      URL.revokeObjectURL(simpleFrame.previewUrl);
    }
    setSimpleFrame(prev => ({ ...prev, file: null, previewUrl: "" }));
    if (simpleFileInputRef.current) {
      simpleFileInputRef.current.value = "";
    }
  };

  const clearAdvancedFile = (type: 'main' | 'preview') => {
    if (type === 'main') {
      if (advancedFrame.mainPreviewUrl) {
        URL.revokeObjectURL(advancedFrame.mainPreviewUrl);
      }
      setAdvancedFrame(prev => ({ ...prev, mainFile: null, mainPreviewUrl: "" }));
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = "";
      }
    } else {
      if (advancedFrame.previewPreviewUrl) {
        URL.revokeObjectURL(advancedFrame.previewPreviewUrl);
      }
      setAdvancedFrame(prev => ({ ...prev, previewFile: null, previewPreviewUrl: "" }));
      if (previewFileInputRef.current) {
        previewFileInputRef.current.value = "";
      }
    }
  };

  const renderFileTypeBadge = (fileName: string, mimeType: string) => {
    const fileInfo = getFileTypeIcon(fileName, mimeType);
    const Icon = fileInfo.icon;
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${fileInfo.color}`}>
        <Icon className="w-3 h-3" />
        {fileInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avatar Frames</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage avatar frames (PNG, GIF, WebP, APNG, SVGA)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Frame
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.length}
              </h3>
              <p className="text-sm text-gray-600">Total Frames</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.reduce((sum, frame) => sum + (frame.coins || 0), 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Credits Value</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.length > 0 
                  ? Math.round(frames.reduce((sum, frame) => sum + (frame.period || 15), 0) / frames.length)
                  : 0}
              </h3>
              <p className="text-sm text-gray-600">Avg. Period (days)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.filter(f => f.isAnimated || f.isSVGA || f.fileType?.includes('gif')).length}
              </h3>
              <p className="text-sm text-gray-600">Animated Frames</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search frames by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Frames Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name & Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFrames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No avatar frames found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFrames.map((frame) => {
                    const fileUrl = fixImageUrl(frame.file?.url);
                    const previewUrl = fixImageUrl(frame.preview?.url) || fileUrl;
                    const isAnimated = frame.isAnimated || frame.fileType?.includes('gif') || frame.file?.name?.endsWith('.gif');
                    const isSVGA = frame.isSVGA || frame.file?.name?.endsWith('.svga');
                    
                    return (
                      <TableRow key={frame.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={frame.name}
                                className={`max-w-full max-h-full object-contain ${
                                  isAnimated && !isSVGA ? 'animate-pulse' : ''
                                }`}
                                onError={(e) => {
                                  e.currentTarget.src = placeholderIcon;
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{frame.name}</p>
                              {isAnimated && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <Film className="w-3 h-3 mr-1" />
                                  Animated
                                </Badge>
                              )}
                              {isSVGA && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  <FileImage className="w-3 h-3 mr-1" />
                                  SVGA
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">ID: {frame.id?.substring(0, 8)}...</p>
                            <div className="flex items-center gap-2 mt-1">
                              {frame.file?.name && renderFileTypeBadge(frame.file.name, frame.fileType || '')}
                              {frame.preview && (
                                <Badge variant="outline" className="text-gray-600">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold">{frame.coins || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            {frame.period || 15} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                            {frame.categories || "avatar_frame"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-700">
                            {formatDate(frame.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(fileUrl, '_blank')}
                              disabled={!fileUrl}
                              title="View File"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            {frame.preview?.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(fixImageUrl(frame.preview?.url), '_blank')}
                                title="View Preview"
                              >
                                <ImageIcon className="w-4 h-4 text-purple-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Implement edit */}}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFrame(frame.id, frame.name)}
                              disabled={deleteFrameMutation.isLoading}
                              title="Delete"
                            >
                              {deleteFrameMutation.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-600" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add Frame Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Avatar Frame</DialogTitle>
            <DialogDescription>
              Create a new avatar frame with support for PNG, GIF, WebP, APNG, and SVGA formats
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="simple" onValueChange={(value) => setUploadMode(value as 'simple' | 'advanced')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple Upload</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Upload</TabsTrigger>
            </TabsList>
            
            {/* Simple Upload Tab */}
            <TabsContent value="simple" className="space-y-6">
              <form onSubmit={handleSimpleAddFrame} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="simple-name">Frame Name *</Label>
                    <Input
                      id="simple-name"
                      placeholder="Enter frame name"
                      value={simpleFrame.name}
                      onChange={(e) => setSimpleFrame({...simpleFrame, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="simple-credits">Required Credits *</Label>
                    <Input
                      id="simple-credits"
                      type="number"
                      placeholder="Enter credits amount"
                      value={simpleFrame.credits}
                      onChange={(e) => setSimpleFrame({...simpleFrame, credits: parseInt(e.target.value) || 0})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="simple-period">Period (Days)</Label>
                    <Input
                      id="simple-period"
                      type="number"
                      placeholder="Default: 15 days"
                      value={simpleFrame.period}
                      onChange={(e) => setSimpleFrame({...simpleFrame, period: parseInt(e.target.value) || 15})}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="simple-file">Image File *</Label>
                    <Input
                      id="simple-file"
                      ref={simpleFileInputRef}
                      type="file"
                      accept={ALLOWED_EXTENSIONS.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSimpleFileSelect(file);
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Allowed formats: {ALLOWED_EXTENSIONS.join(', ')}. Max 10MB (15MB for SVGA).
                    </p>
                  </div>
                </div>
                
                {/* Preview Section */}
                {simpleFrame.previewUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={simpleFrame.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={clearSimpleFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {simpleFrame.file && (
                      <div className="flex items-center gap-2 mt-2">
                        {renderFileTypeBadge(simpleFrame.file.name, simpleFrame.file.type)}
                        <span className="text-sm text-gray-600">
                          {(simpleFrame.file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      clearSimpleFile();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFrameMutation.isLoading || !simpleFrame.file}
                  >
                    {createFrameMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Frame"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            {/* Advanced Upload Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <form onSubmit={handleAdvancedAddFrame} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advanced-name">Frame Name *</Label>
                    <Input
                      id="advanced-name"
                      placeholder="Enter frame name"
                      value={advancedFrame.name}
                      onChange={(e) => setAdvancedFrame({...advancedFrame, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advanced-credits">Required Credits *</Label>
                    <Input
                      id="advanced-credits"
                      type="number"
                      placeholder="Enter credits amount"
                      value={advancedFrame.credits}
                      onChange={(e) => setAdvancedFrame({...advancedFrame, credits: parseInt(e.target.value) || 0})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advanced-period">Period (Days)</Label>
                    <Input
                      id="advanced-period"
                      type="number"
                      placeholder="Default: 15 days"
                      value={advancedFrame.period}
                      onChange={(e) => setAdvancedFrame({...advancedFrame, period: parseInt(e.target.value) || 15})}
                      min="1"
                    />
                  </div>
                </div>
                
                {/* Main File Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="main-file">Main File (Animated/SVGA) *</Label>
                    <div className="mt-2">
                      <Input
                        id="main-file"
                        ref={mainFileInputRef}
                        type="file"
                        accept={ALLOWED_EXTENSIONS.join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdvancedFileSelect(file, 'main');
                        }}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Main animated file (GIF/WebP/APNG/SVGA). Max 10MB (15MB for SVGA).
                      </p>
                    </div>
                    
                    {advancedFrame.mainPreviewUrl && (
                      <div className="mt-4 relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300">
                        <img
                          src={advancedFrame.mainPreviewUrl}
                          alt="Main Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => clearAdvancedFile('main')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {advancedFrame.mainFile && (
                          <div className="absolute -bottom-8 left-0 flex items-center gap-2">
                            {renderFileTypeBadge(advancedFrame.mainFile.name, advancedFrame.mainFile.type)}
                            <span className="text-xs text-gray-600">
                              {(advancedFrame.mainFile.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Preview File Section (Optional) */}
                  <div>
                    <Label htmlFor="preview-file">Preview File (Optional)</Label>
                    <div className="mt-2">
                      <Input
                        id="preview-file"
                        ref={previewFileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdvancedFileSelect(file, 'preview');
                        }}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Static preview image (PNG/JPG recommended). Max 5MB.
                      </p>
                    </div>
                    
                    {advancedFrame.previewPreviewUrl && (
                      <div className="mt-4 relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300">
                        <img
                          src={advancedFrame.previewPreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => clearAdvancedFile('preview')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {advancedFrame.previewFile && (
                          <div className="absolute -bottom-8 left-0 flex items-center gap-2">
                            {renderFileTypeBadge(advancedFrame.previewFile.name, advancedFrame.previewFile.type)}
                            <span className="text-xs text-gray-600">
                              {(advancedFrame.previewFile.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      clearAdvancedFile('main');
                      clearAdvancedFile('preview');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAdvancedFrameMutation.isLoading || !advancedFrame.mainFile}
                  >
                    {createAdvancedFrameMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Advanced Frame"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
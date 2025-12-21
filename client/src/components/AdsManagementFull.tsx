// client/src/components/AdsManagementFull.tsx
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
  Eye,
  Edit2,
  Search,
  RefreshCw,
  Megaphone,
  Clock,
  Image as ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const AD_TYPES = [
  { value: "video", label: "Video" },
  { value: "banner", label: "Banner" },
  { value: "medium_image", label: "Medium Image" },
  { value: "full_screen_image", label: "Full Screen Image" },
];

export default function AdsManagementFull() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    type: "banner",
    link: "",
    duration: 5,
    isActive: true,
    file: null as File | null,
    previewUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ads = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Advertising",
    limit: 500,
  });

  const createAdMutation = trpc.parse.createObject.useMutation();
  const updateAdMutation = trpc.parse.updateObject.useMutation();
  const deleteAdMutation = trpc.parse.deleteObject.useMutation();

  const filteredAds = ads.filter((ad: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ad.title?.toLowerCase().includes(query) ||
      ad.description?.toLowerCase().includes(query) ||
      ad.type?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select an image (JPG/PNG) or video (MP4) file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setNewAd(prev => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAd.title || !newAd.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      toast.loading("Creating ad...", { id: "create-ad" });

      await createAdMutation.mutateAsync({
        className: "Advertising",
        data: {
          title: newAd.title,
          description: newAd.description,
          type: newAd.type,
          link: newAd.link,
          PresentationDuration: newAd.duration,
          isActive: newAd.isActive,
        }
      });

      toast.success("Ad created successfully", { id: "create-ad" });
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Create ad error:", error);
      toast.error(error?.message || "Failed to create ad", { id: "create-ad" });
    }
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAd) return;

    try {
      toast.loading("Updating ad...", { id: "update-ad" });

      await updateAdMutation.mutateAsync({
        className: "Advertising",
        objectId: selectedAd.id,
        data: {
          title: selectedAd.title,
          description: selectedAd.description,
          type: selectedAd.type,
          link: selectedAd.link,
          PresentationDuration: selectedAd.PresentationDuration,
          isActive: selectedAd.isActive,
        }
      });

      toast.success("Ad updated successfully", { id: "update-ad" });
      setShowEditModal(false);
      setSelectedAd(null);
      refetch();
    } catch (error: any) {
      console.error("Update ad error:", error);
      toast.error(error?.message || "Failed to update ad", { id: "update-ad" });
    }
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${adTitle}"?`)) return;

    try {
      await deleteAdMutation.mutateAsync({
        className: "Advertising",
        objectId: adId
      });
      toast.success("Ad deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete ad error:", error);
      toast.error("Failed to delete ad");
    }
  };

  const resetForm = () => {
    setNewAd({
      title: "",
      description: "",
      type: "banner",
      link: "",
      duration: 5,
      isActive: true,
      file: null,
      previewUrl: "",
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4" />;
    return <ImageIcon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ads Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage all advertisements in the app
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ad
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
          <div className="text-sm text-gray-600">Total Ads</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {ads.filter((ad: any) => ad.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Ads</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {ads.filter((ad: any) => !ad.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactive Ads</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {ads.filter((ad: any) => ad.type === 'video').length}
          </div>
          <div className="text-sm text-gray-600">Video Ads</div>
        </Card>
      </div>

      {/* Table */}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAds.map((ad: any) => (
                    <TableRow key={ad.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            {getTypeIcon(ad.type)}
                          </div>
                          <div>
                            <p className="font-medium">{ad.title || "Untitled"}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {ad.description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ad.type || "banner"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{ad.PresentationDuration || 5}s</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ad.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(ad.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAd(ad);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAd(ad);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id, ad.title)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAds.length)} of {filteredAds.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Ad</DialogTitle>
            <DialogDescription>
              Enter the details for the new advertisement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAd} className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Title *</Label>
              <Input
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                placeholder="Enter ad title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newAd.description}
                onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                placeholder="Enter ad description"
              />
            </div>
            <div className="space-y-2">
              <Label>Ad Type *</Label>
              <Select
                value={newAd.type}
                onValueChange={(value) => setNewAd({ ...newAd, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ad Link</Label>
              <Input
                type="url"
                value={newAd.link}
                onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Duration (seconds)</Label>
              <Input
                type="number"
                min={1}
                value={newAd.duration}
                onChange={(e) => setNewAd({ ...newAd, duration: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={newAd.isActive}
                onCheckedChange={(checked) => setNewAd({ ...newAd, isActive: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAdMutation.isLoading}>
                {createAdMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <form onSubmit={handleUpdateAd} className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Title *</Label>
                <Input
                  value={selectedAd.title || ""}
                  onChange={(e) => setSelectedAd({ ...selectedAd, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedAd.description || ""}
                  onChange={(e) => setSelectedAd({ ...selectedAd, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ad Type</Label>
                <Select
                  value={selectedAd.type || "banner"}
                  onValueChange={(value) => setSelectedAd({ ...selectedAd, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ad Link</Label>
                <Input
                  type="url"
                  value={selectedAd.link || ""}
                  onChange={(e) => setSelectedAd({ ...selectedAd, link: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Duration (seconds)</Label>
                <Input
                  type="number"
                  min={1}
                  value={selectedAd.PresentationDuration || 5}
                  onChange={(e) => setSelectedAd({ ...selectedAd, PresentationDuration: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={selectedAd.isActive}
                  onCheckedChange={(checked) => setSelectedAd({ ...selectedAd, isActive: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAdMutation.isLoading}>
                  {updateAdMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ad Details</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Title</Label>
                  <p className="font-medium">{selectedAd.title || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Type</Label>
                  <p className="font-medium capitalize">{selectedAd.type || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <p>{selectedAd.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Duration</Label>
                  <p>{selectedAd.PresentationDuration || 5} seconds</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Description</Label>
                <p>{selectedAd.description || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Link</Label>
                <p className="text-blue-600 break-all">{selectedAd.link || "-"}</p>
              </div>
              {selectedAd.file?.url && (
                <div>
                  <Label className="text-gray-500">File</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedAd.file.url, '_blank')}
                  >
                    View File
                  </Button>
                </div>
              )}
              <div>
                <Label className="text-gray-500">Created At</Label>
                <p>{formatDate(selectedAd.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

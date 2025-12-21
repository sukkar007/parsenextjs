// src/components/GiftsManagement.tsx
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Filter,
  Eye,
  Trash2,
  Plus,
  Download,
  Gift,
  Coins,
  Calendar,
  Hash,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  ExternalLink,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddGiftModal from "@/components/AddGiftModal";

// قائمة فئات الهدايا المعتمدة فقط
const GIFT_CATEGORIES = [
  "love",
  "moods", 
  "artists",
  "collectibles",
  "games",
  "family",
  "classic",
  "3d",
  "vip",
  "svga_gifts",
  "gifts", // فئة عامة
  "special",
  "holiday",
  "birthday",
  "anniversary"
];

// قائمة فئات يجب استبعادها (الإطارات والثيمات)
const EXCLUDED_CATEGORIES = [
  "avatar_frame",
  "avatar_frames",
  "frame",
  "frames",
  "party_theme",
  "entrance_effect",
  "entrance_effects",
  "promotional_image",
  "promotional_images",
  "background",
  "backgrounds",
  "theme",
  "themes",
  "sticker",
  "stickers",
  "badge",
  "badges"
];

export default function GiftsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [showGiftDetails, setShowGiftDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["all"]);

  const { 
    data: gifts = [], 
    isLoading: loadingGifts, 
    error: giftsError,
    refetch 
  } = trpc.parse.queryClass.useQuery({
    className: "Gifts",
    limit: 200,
  });

  useEffect(() => {
    if (gifts.length > 0) {
      // استخراج الفئات الفعلية من الهدايا بعد التصفية
      const categoriesFromGifts = Array.from(
        new Set(
          gifts
            .filter((gift: any) => {
              const category = gift.categories?.toLowerCase()?.trim();
              // استبعاد الفئات غير المرغوبة
              return !EXCLUDED_CATEGORIES.some(excluded => 
                category?.includes(excluded.toLowerCase())
              );
            })
            .map((gift: any) => gift.categories)
            .filter((cat: string) => cat && cat.trim() !== "")
            .map((cat: string) => cat.toLowerCase())
        )
      ).sort();
      
      setAvailableCategories(["all", ...categoriesFromGifts]);
    }
  }, [gifts]);

  const deleteGiftMutation = trpc.parse.deleteObject.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // تصفية الهدايا لاستبعاد الإطارات والثيمات
  const filteredGifts = gifts.filter((gift: any) => {
    const category = gift.categories?.toLowerCase()?.trim() || "";
    
    // استبعاد الفئات غير المرغوبة
    const isExcluded = EXCLUDED_CATEGORIES.some(excluded => 
      category.includes(excluded.toLowerCase())
    );
    
    if (isExcluded) {
      return false;
    }

    // إذا كان هناك بحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = gift.name?.toLowerCase().includes(query);
      const matchesCategory = category.includes(query);
      return matchesName || matchesCategory;
    }

    // إذا كان هناك تصفية بالفئة
    if (selectedCategory !== "all") {
      return category === selectedCategory.toLowerCase();
    }

    return true;
  });

  const handleDeleteGift = async (giftId: string, giftName: string) => {
    if (window.confirm(`Are you sure you want to delete gift "${giftName}"?`)) {
      try {
        await deleteGiftMutation.mutateAsync({
          className: "Gifts",
          objectId: giftId
        });
        alert("Gift deleted successfully");
      } catch (error) {
        console.error("Delete gift error:", error);
        alert("Failed to delete gift");
      }
    }
  };

  const handleViewGiftDetails = (gift: any) => {
    setSelectedGift(gift);
    setShowGiftDetails(true);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getFileType = (fileName: string) => {
    if (!fileName) return "Unknown";
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || "Unknown";
  };

  const GiftDetailModal = ({ gift, onClose }: { gift: any; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{gift.name || "Unnamed Gift"}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="capitalize">
                  {gift.categories || "Uncategorized"}
                </Badge>
                {EXCLUDED_CATEGORIES.some(excluded => 
                  gift.categories?.toLowerCase().includes(excluded.toLowerCase())
                ) && (
                  <Badge variant="destructive" className="text-xs">
                    Excluded Category
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Gift ID</label>
                  <p className="text-sm bg-gray-100 p-2 rounded font-mono">{gift.id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <div className="mt-1">
                    <Badge className={`capitalize ${
                      EXCLUDED_CATEGORIES.some(excluded => 
                        gift.categories?.toLowerCase().includes(excluded.toLowerCase())
                      ) ? 'bg-red-100 text-red-800' : ''
                    }`}>
                      {gift.categories || "Uncategorized"}
                    </Badge>
                    {EXCLUDED_CATEGORIES.some(excluded => 
                      gift.categories?.toLowerCase().includes(excluded.toLowerCase())
                    ) && (
                      <p className="text-xs text-red-600 mt-1">
                        This item is excluded from gifts list
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Credits Cost</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <p className="text-lg font-bold text-yellow-600">{gift.coins || 0} credits</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="text-sm mt-1">{formatDate(gift.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm mt-1">{formatDate(gift.updatedAt || gift.createdAt)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Files</h3>
              <div className="space-y-4">
                {gift.file?.url && (
                  <div className="border rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4" />
                      Main File
                    </label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Type: <Badge variant="outline">{getFileType(gift.file.name || gift.file.url)}</Badge>
                        </span>
                        <span className="text-sm text-gray-500">
                          {gift.fileSize ? `${gift.fileSize}KB` : "Size unknown"}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(gift.file.url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = gift.file.url;
                            link.download = gift.file.name || 'gift_file';
                            link.click();
                          }}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {gift.preview?.url && (
                  <div className="border rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4" />
                      Preview Image
                    </label>
                    <div className="mt-2">
                      <img 
                        src={gift.preview.url} 
                        alt={`${gift.name} preview`}
                        className="max-w-full h-48 object-contain rounded-lg border mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/300x200?text=No+Preview";
                        }}
                      />
                      <div className="flex justify-center mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(gift.preview.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!gift.file?.url && !gift.preview?.url && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No files attached</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete gift "${gift.name}"? This action cannot be undone.`)) {
                    handleDeleteGift(gift.id, gift.name);
                    onClose();
                  }
                }}
                disabled={deleteGiftMutation.isLoading}
              >
                {deleteGiftMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Gift
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loadingGifts) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gifts Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and organize all gifts in the system (excluding avatar frames and themes)
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Gift
          </Button>
        </div>
        
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading gifts...</p>
          </div>
        </Card>
      </div>
    );
  }

  // حساب الإحصاءات
  const totalGifts = gifts.length;
  const excludedItems = gifts.filter((gift: any) => 
    EXCLUDED_CATEGORIES.some(excluded => 
      gift.categories?.toLowerCase()?.includes(excluded.toLowerCase())
    )
  ).length;
  const availableGifts = totalGifts - excludedItems;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gifts Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing only gifts (excluding avatar frames, themes, and other non-gift items)
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-green-600">
              <Package className="w-4 h-4 inline mr-1" />
              Available Gifts: {availableGifts}
            </span>
            <span className="text-gray-400">
              <Filter className="w-4 h-4 inline mr-1" />
              Excluded Items: {excludedItems}
            </span>
            <span className="text-blue-600">
              <Gift className="w-4 h-4 inline mr-1" />
              Total in Database: {totalGifts}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={loadingGifts}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingGifts ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Gift
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Gifts</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search gifts by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Gift Categories" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Gift Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
            <div className="flex items-center justify-around bg-gray-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{filteredGifts.length}</div>
                <div className="text-xs text-gray-500">Showing</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{availableGifts}</div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {filteredGifts.reduce((sum: number, gift: any) => sum + (gift.coins || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">Total Credits</div>
              </div>
            </div>
          </div>
        </div>

        {filteredGifts.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory !== "all" 
                ? "No gifts match your search" 
                : "No gifts available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filter" 
                : availableGifts === 0 
                  ? "All items are excluded as they are avatar frames or themes" 
                  : "Start by adding your first gift"}
            </p>
            {availableGifts === 0 && totalGifts > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Note: Found {totalGifts} items in database, but all are excluded 
                  (avatar frames, themes, etc.)
                </p>
              </div>
            )}
            {searchQuery || selectedCategory !== "all" ? (
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Gift
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredGifts.length} of {availableGifts} available gifts
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Excluding: {EXCLUDED_CATEGORIES.slice(0, 3).join(", ")}...
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Gift</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Credits</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Files</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGifts.map((gift: any) => (
                    <tr key={gift.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {gift.preview?.url ? (
                            <img
                              src={gift.preview.url}
                              alt={gift.name}
                              className="w-12 h-12 rounded-lg object-cover border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/48?text=Gift";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                              <Gift className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{gift.name || "Unnamed Gift"}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              ID: {gift.id?.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            GIFT_CATEGORIES.includes(gift.categories?.toLowerCase()) 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {gift.categories || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{gift.coins || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-gray-700 text-sm">{formatDate(gift.createdAt)}</span>
                          {gift.updatedAt && gift.updatedAt !== gift.createdAt && (
                            <span className="text-xs text-gray-500">
                              Updated: {formatDate(gift.updatedAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {gift.file?.url && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Main
                            </span>
                          )}
                          {gift.preview?.url && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Preview
                            </span>
                          )}
                          {!gift.file?.url && !gift.preview?.url && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              No Files
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewGiftDetails(gift)}
                            className="p-2 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          {gift.file?.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(gift.file.url, '_blank')}
                              className="p-2 hover:bg-green-50 rounded-lg"
                              title="Download File"
                            >
                              <Download className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGift(gift.id, gift.name)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title="Delete Gift"
                            disabled={deleteGiftMutation.isLoading}
                          >
                            {deleteGiftMutation.isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {showGiftDetails && selectedGift && (
        <GiftDetailModal
          gift={selectedGift}
          onClose={() => {
            setShowGiftDetails(false);
            setSelectedGift(null);
          }}
        />
      )}

      <AddGiftModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refetch();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
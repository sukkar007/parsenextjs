// client/src/components/PostsManagementFull.tsx
import { useState } from "react";
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
  Trash2,
  Eye,
  Search,
  RefreshCw,
  FileText,
  User,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function PostsManagementFull() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Posts",
    limit: 500,
  });

  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.text?.toLowerCase().includes(query) ||
      item.Author?.username?.toLowerCase().includes(query) ||
      item.Author?.name?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Posts",
        objectId: id
      });
      toast.success("Post deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMediaCount = (item: any) => {
    let count = 0;
    if (item.image1?.url) count++;
    if (item.image2?.url) count++;
    if (item.image3?.url) count++;
    if (item.video?.url) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Posts Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage user posts
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-500">
            {items.reduce((sum: number, item: any) => sum + (item.likes || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Likes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {items.reduce((sum: number, item: any) => sum + (item.comments || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Comments</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {items.reduce((sum: number, item: any) => sum + (item.shares || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Shares</div>
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
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.Author?.avatar?.url ? (
                            <img
                              src={item.Author.avatar.url}
                              alt={item.Author.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {item.Author?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.Author?.name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">@{item.Author?.username || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 truncate max-w-[250px]">
                          {item.text || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getMediaCount(item) > 0 ? (
                          <Badge variant="outline">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {getMediaCount(item)} files
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-red-500">
                            <Heart className="w-4 h-4" />
                            {item.likes || 0}
                          </span>
                          <span className="flex items-center gap-1 text-blue-500">
                            <MessageCircle className="w-4 h-4" />
                            {item.comments || 0}
                          </span>
                          <span className="flex items-center gap-1 text-green-500">
                            <Share2 className="w-4 h-4" />
                            {item.shares || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length}
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

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedItem.Author?.avatar?.url ? (
                  <img
                    src={selectedItem.Author.avatar.url}
                    alt={selectedItem.Author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {selectedItem.Author?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedItem.Author?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">@{selectedItem.Author?.username || "-"}</p>
                </div>
              </div>

              {/* Text */}
              {selectedItem.text && (
                <div>
                  <Label className="text-gray-500">Content</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedItem.text}</p>
                </div>
              )}

              {/* Media */}
              <div className="grid grid-cols-2 gap-2">
                {selectedItem.image1?.url && (
                  <img
                    src={selectedItem.image1.url}
                    alt="Post image 1"
                    className="rounded-lg object-cover w-full h-48"
                  />
                )}
                {selectedItem.image2?.url && (
                  <img
                    src={selectedItem.image2.url}
                    alt="Post image 2"
                    className="rounded-lg object-cover w-full h-48"
                  />
                )}
                {selectedItem.image3?.url && (
                  <img
                    src={selectedItem.image3.url}
                    alt="Post image 3"
                    className="rounded-lg object-cover w-full h-48"
                  />
                )}
              </div>
              {selectedItem.video?.url && (
                <div>
                  <Label className="text-gray-500">Video</Label>
                  <video
                    src={selectedItem.video.url}
                    controls
                    className="mt-2 max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-500">
                    <Heart className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedItem.likes || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedItem.comments || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-500">
                    <Share2 className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedItem.shares || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Shares</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-500">
                    <Eye className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedItem.views || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500">Views</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p>{formatDate(selectedItem.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Object ID</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedItem.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

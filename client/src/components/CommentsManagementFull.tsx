// client/src/components/CommentsManagementFull.tsx
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
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  FileText,
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

export default function CommentsManagementFull() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Comment",
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
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Comment",
        objectId: id
      });
      toast.success("Comment deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete comment");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comments Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage user comments
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
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-sm text-gray-600">Total Comments</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-500">
            {items.reduce((sum: number, item: any) => sum + (item.likes || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Likes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {new Set(items.map((item: any) => item.Author?.id).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Authors</div>
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
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No comments found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.Author?.avatar?.url ? (
                            <img
                              src={item.Author.avatar.url}
                              alt={item.Author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                              {item.Author?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.Author?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">@{item.Author?.username || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 truncate max-w-[250px]">
                          {item.text || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {item.Post ? (
                          <Badge variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            {item.Post.id?.substring(0, 8) || "Post"}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{item.likes || 0}</span>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
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

              {/* Comment Text */}
              <div>
                <Label className="text-gray-500">Comment</Label>
                <p className="mt-1 p-3 bg-blue-50 rounded-lg whitespace-pre-wrap">{selectedItem.text}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Likes</Label>
                  <div className="flex items-center gap-1 text-red-500 mt-1">
                    <Heart className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedItem.likes || 0}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="mt-1">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>

              {/* Post Reference */}
              {selectedItem.Post && (
                <div>
                  <Label className="text-gray-500">Post ID</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">{selectedItem.Post.id}</p>
                </div>
              )}

              <div>
                <Label className="text-gray-500">Comment ID</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedItem.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

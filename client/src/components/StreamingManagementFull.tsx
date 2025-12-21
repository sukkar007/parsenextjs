// client/src/components/StreamingManagementFull.tsx
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
  Edit2,
  Search,
  RefreshCw,
  Radio,
  User,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function StreamingManagementFull() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Streaming",
    limit: 500,
  });

  const updateMutation = trpc.parse.updateObject.useMutation();
  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.Author?.username?.toLowerCase().includes(query) ||
      item.Author?.name?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    try {
      toast.loading("Updating stream...", { id: "update" });

      await updateMutation.mutateAsync({
        className: "Streaming",
        objectId: selectedItem.id,
        data: {
          title: selectedItem.title,
          isLive: selectedItem.isLive,
          isApproved: selectedItem.isApproved,
        }
      });

      toast.success("Stream updated successfully", { id: "update" });
      setShowEditModal(false);
      setSelectedItem(null);
      refetch();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update", { id: "update" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Streaming",
        objectId: id
      });
      toast.success("Stream deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete stream");
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
          <div className="p-3 rounded-lg bg-red-100 text-red-600">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Streaming Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage live streams
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
            placeholder="Search streams..."
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
          <div className="text-sm text-gray-600">Total Streams</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {items.filter((item: any) => item.isLive).length}
          </div>
          <div className="text-sm text-gray-600">Live Now</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((item: any) => item.isApproved).length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {items.reduce((sum: number, item: any) => sum + (item.viewers || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Viewers</div>
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
                  <TableHead>Stream</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Viewers</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No streams found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                            {item.thumbnail?.url ? (
                              <img
                                src={item.thumbnail.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Radio className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {item.isLive && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="font-medium truncate max-w-[150px]">{item.title || "Untitled"}</p>
                        </div>
                      </TableCell>
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
                          <span className="text-sm">{item.Author?.name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isLive ? (
                          <Badge className="bg-red-100 text-red-800">
                            <Wifi className="w-3 h-3 mr-1" />
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <WifiOff className="w-3 h-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{item.viewers || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isApproved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
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
                            onClick={() => {
                              setSelectedItem(item);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 text-green-600" />
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Stream</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedItem.title || ""}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Live</Label>
                <Switch
                  checked={selectedItem.isLive}
                  onCheckedChange={(checked) => setSelectedItem({ ...selectedItem, isLive: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Approved</Label>
                <Switch
                  checked={selectedItem.isApproved}
                  onCheckedChange={(checked) => setSelectedItem({ ...selectedItem, isApproved: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
            <DialogTitle>Stream Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Thumbnail */}
              {selectedItem.thumbnail?.url && (
                <img
                  src={selectedItem.thumbnail.url}
                  alt={selectedItem.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Host Info */}
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

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Title</Label>
                  <p className="font-medium">{selectedItem.title || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <p>{selectedItem.isLive ? "Live" : "Offline"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Viewers</Label>
                  <p>{selectedItem.viewers || 0}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Approved</Label>
                  <p>{selectedItem.isApproved ? "Yes" : "No"}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Created At</Label>
                <p>{formatDate(selectedItem.createdAt)}</p>
              </div>

              <div>
                <Label className="text-gray-500">Object ID</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedItem.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

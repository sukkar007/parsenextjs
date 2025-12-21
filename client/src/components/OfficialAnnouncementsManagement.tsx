// client/src/components/OfficialAnnouncementsManagement.tsx
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
  Bell,
  Link,
  Image as ImageIcon,
  ExternalLink,
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

export default function OfficialAnnouncementsManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newItem, setNewItem] = useState({
    title: "",
    sub_title: "",
    web_view_url: "",
    file: null as File | null,
    previewUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "OfficialAnnouncement",
    limit: 500,
  });

  const createMutation = trpc.parse.createObject.useMutation();
  const updateMutation = trpc.parse.updateObject.useMutation();
  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.sub_title?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.title) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      toast.loading("Creating announcement...", { id: "create" });

      await createMutation.mutateAsync({
        className: "OfficialAnnouncement",
        data: {
          title: newItem.title,
          sub_title: newItem.sub_title,
          web_view_url: newItem.web_view_url,
        }
      });

      toast.success("Announcement created successfully", { id: "create" });
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error?.message || "Failed to create", { id: "create" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    try {
      toast.loading("Updating announcement...", { id: "update" });

      await updateMutation.mutateAsync({
        className: "OfficialAnnouncement",
        objectId: selectedItem.id,
        data: {
          title: selectedItem.title,
          sub_title: selectedItem.sub_title,
          web_view_url: selectedItem.web_view_url,
        }
      });

      toast.success("Announcement updated successfully", { id: "update" });
      setShowEditModal(false);
      setSelectedItem(null);
      refetch();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update", { id: "update" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteMutation.mutateAsync({
        className: "OfficialAnnouncement",
        objectId: id
      });
      toast.success("Announcement deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setNewItem({
      title: "",
      sub_title: "",
      web_view_url: "",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Official Announcements</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage official announcements
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
            Add Announcement
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search announcements..."
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
          <div className="text-sm text-gray-600">Total Announcements</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {items.filter((item: any) => item.web_view_url).length}
          </div>
          <div className="text-sm text-gray-600">With Links</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((item: any) => item.preview_image).length}
          </div>
          <div className="text-sm text-gray-600">With Images</div>
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
                  <TableHead>Subtitle</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No announcements found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-purple-600" />
                          </div>
                          <p className="font-medium">{item.title || "Untitled"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                          {item.sub_title || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {item.web_view_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.web_view_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.preview_image?.url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.preview_image.url, '_blank')}
                          >
                            <ImageIcon className="w-4 h-4 text-green-600" />
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
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
                            onClick={() => handleDelete(item.id, item.title)}
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

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Announcement</DialogTitle>
            <DialogDescription>
              Enter the details for the new announcement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Enter title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={newItem.sub_title}
                onChange={(e) => setNewItem({ ...newItem, sub_title: e.target.value })}
                placeholder="Enter subtitle"
              />
            </div>
            <div className="space-y-2">
              <Label>Web View URL</Label>
              <Input
                type="url"
                value={newItem.web_view_url}
                onChange={(e) => setNewItem({ ...newItem, web_view_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={selectedItem.title || ""}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={selectedItem.sub_title || ""}
                  onChange={(e) => setSelectedItem({ ...selectedItem, sub_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Web View URL</Label>
                <Input
                  type="url"
                  value={selectedItem.web_view_url || ""}
                  onChange={(e) => setSelectedItem({ ...selectedItem, web_view_url: e.target.value })}
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
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Title</Label>
                <p className="font-medium">{selectedItem.title || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Subtitle</Label>
                <p>{selectedItem.sub_title || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Web View URL</Label>
                {selectedItem.web_view_url ? (
                  <a href={selectedItem.web_view_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all hover:underline">
                    {selectedItem.web_view_url}
                  </a>
                ) : (
                  <p>-</p>
                )}
              </div>
              {selectedItem.preview_image?.url && (
                <div>
                  <Label className="text-gray-500">Preview Image</Label>
                  <img
                    src={selectedItem.preview_image.url}
                    alt="Preview"
                    className="mt-2 max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <div>
                <Label className="text-gray-500">Created At</Label>
                <p>{formatDate(selectedItem.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

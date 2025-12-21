// client/src/components/PartyThemesManagementFull.tsx
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
  Palette,
  Coins,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
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

export default function PartyThemesManagementFull() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newItem, setNewItem] = useState({
    name: "",
    credits: 0,
    period: 30,
    file: null as File | null,
    previewUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allGifts = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Gifts",
    limit: 500,
  });

  // Filter only party themes
  const items = allGifts.filter((item: any) => item.categories === "party_theme");

  const createMutation = trpc.parse.createObject.useMutation();
  const updateMutation = trpc.parse.updateObject.useMutation();
  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.name?.toLowerCase().includes(query);
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.png') && !file.type.includes('png')) {
      toast.error("Please select a PNG file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setNewItem(prev => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || newItem.credits < 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      toast.loading("Creating party theme...", { id: "create" });

      await createMutation.mutateAsync({
        className: "Gifts",
        data: {
          name: newItem.name,
          categories: "party_theme",
          coins: newItem.credits,
          period: newItem.period,
        }
      });

      toast.success("Party theme created successfully", { id: "create" });
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
      toast.loading("Updating party theme...", { id: "update" });

      await updateMutation.mutateAsync({
        className: "Gifts",
        objectId: selectedItem.id,
        data: {
          name: selectedItem.name,
          coins: selectedItem.coins,
          period: selectedItem.period,
        }
      });

      toast.success("Party theme updated successfully", { id: "update" });
      setShowEditModal(false);
      setSelectedItem(null);
      refetch();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update", { id: "update" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Gifts",
        objectId: id
      });
      toast.success("Party theme deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      credits: 0,
      period: 30,
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
          <div className="p-3 rounded-lg bg-pink-100 text-pink-600">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Party Themes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage party themes and backgrounds
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
            Add Theme
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search party themes..."
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
          <div className="text-sm text-gray-600">Total Themes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {items.reduce((sum: number, item: any) => sum + (item.coins || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Credits Value</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((item: any) => item.file?.url).length}
          </div>
          <div className="text-sm text-gray-600">With Files</div>
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
                  <TableHead>Theme</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No party themes found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.file?.url ? (
                            <img
                              src={item.file.url}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                              <Palette className="w-6 h-6 text-pink-600" />
                            </div>
                          )}
                          <p className="font-medium">{item.name || "Unnamed"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{item.coins || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.period || 30} days</Badge>
                      </TableCell>
                      <TableCell>
                        {item.file?.url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.file.url, '_blank')}
                          >
                            <Download className="w-4 h-4 text-blue-600" />
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
                            onClick={() => handleDelete(item.id, item.name)}
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
            <DialogTitle>Add New Party Theme</DialogTitle>
            <DialogDescription>
              Enter the details for the new party theme
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Theme Name *</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter theme name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Credits *</Label>
              <Input
                type="number"
                min={0}
                value={newItem.credits}
                onChange={(e) => setNewItem({ ...newItem, credits: parseInt(e.target.value) || 0 })}
                placeholder="Credits needed to buy"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Period (days)</Label>
              <Input
                type="number"
                min={1}
                value={newItem.period}
                onChange={(e) => setNewItem({ ...newItem, period: parseInt(e.target.value) || 30 })}
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
            <DialogTitle>Edit Party Theme</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Name *</Label>
                <Input
                  value={selectedItem.name || ""}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Credits *</Label>
                <Input
                  type="number"
                  min={0}
                  value={selectedItem.coins || 0}
                  onChange={(e) => setSelectedItem({ ...selectedItem, coins: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Period (days)</Label>
                <Input
                  type="number"
                  min={1}
                  value={selectedItem.period || 30}
                  onChange={(e) => setSelectedItem({ ...selectedItem, period: parseInt(e.target.value) || 30 })}
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
            <DialogTitle>Party Theme Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.file?.url && (
                <div className="flex justify-center">
                  <img
                    src={selectedItem.file.url}
                    alt={selectedItem.name}
                    className="max-w-full h-auto rounded-lg max-h-64"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">{selectedItem.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Credits</Label>
                  <p className="font-medium">{selectedItem.coins || 0}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Period</Label>
                  <p>{selectedItem.period || 30} days</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p>{formatDate(selectedItem.createdAt)}</p>
                </div>
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

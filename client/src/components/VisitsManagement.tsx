// client/src/components/VisitsManagement.tsx
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
  Eye as EyeIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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

export default function VisitsManagement() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Visit",
    limit: 500,
  });

  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.Visitor?.username?.toLowerCase().includes(query) ||
      item.Visitor?.name?.toLowerCase().includes(query) ||
      item.Visited?.username?.toLowerCase().includes(query) ||
      item.Visited?.name?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visit record?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Visit",
        objectId: id
      });
      toast.success("Visit record deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete visit record");
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
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <EyeIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visits Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage profile visits
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
            placeholder="Search visits..."
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
          <div className="text-sm text-gray-600">Total Visits</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(items.map((item: any) => item.Visitor?.id).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Visitors</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {new Set(items.map((item: any) => item.Visited?.id).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-600">Profiles Visited</div>
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
                  <TableHead>Visitor</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Visited Profile</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No visits found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.Visitor?.avatar?.url ? (
                            <img
                              src={item.Visitor.avatar.url}
                              alt={item.Visitor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {item.Visitor?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.Visitor?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">@{item.Visitor?.username || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.Visited?.avatar?.url ? (
                            <img
                              src={item.Visited.avatar.url}
                              alt={item.Visited.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white font-bold">
                              {item.Visited?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.Visited?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">@{item.Visited?.username || "-"}</p>
                          </div>
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
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Users */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {selectedItem.Visitor?.avatar?.url ? (
                    <img
                      src={selectedItem.Visitor.avatar.url}
                      alt={selectedItem.Visitor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {selectedItem.Visitor?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedItem.Visitor?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">Visitor</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-medium">{selectedItem.Visited?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">Visited</p>
                  </div>
                  {selectedItem.Visited?.avatar?.url ? (
                    <img
                      src={selectedItem.Visited.avatar.url}
                      alt={selectedItem.Visited.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white font-bold">
                      {selectedItem.Visited?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <Label className="text-gray-500">Visited At</Label>
                <p className="mt-1">{formatDate(selectedItem.createdAt)}</p>
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

// client/src/components/ChallengesManagementFull.tsx
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
  Trophy,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  Calendar,
  CheckCircle,
  Clock,
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

export default function ChallengesManagementFull() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Challenge",
    limit: 500,
  });

  const deleteMutation = trpc.parse.deleteObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Challenge",
        objectId: id
      });
      toast.success("Challenge deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete challenge");
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

  const getChallengeStatus = (item: any) => {
    const now = new Date();
    const startDate = item.startDate ? new Date(item.startDate) : null;
    const endDate = item.endDate ? new Date(item.endDate) : null;

    if (startDate && now < startDate) return "upcoming";
    if (endDate && now > endDate) return "completed";
    return "active";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-gray-600">
            <Trophy className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Challenges Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage challenges
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
            placeholder="Search challenges..."
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
          <div className="text-sm text-gray-600">Total Challenges</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((item: any) => getChallengeStatus(item) === "active").length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {items.filter((item: any) => getChallengeStatus(item) === "upcoming").length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">
            {items.filter((item: any) => getChallengeStatus(item) === "completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
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
                  <TableHead>Challenge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No challenges found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image?.url ? (
                            <img
                              src={item.image.url}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.title || "Untitled"}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {item.description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(getChallengeStatus(item))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{item.participants || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.startDate)}</TableCell>
                      <TableCell>{formatDate(item.endDate)}</TableCell>
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
            <DialogTitle>Challenge Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Image */}
              {selectedItem.image?.url && (
                <img
                  src={selectedItem.image.url}
                  alt={selectedItem.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Title & Description */}
              <div>
                <Label className="text-gray-500">Title</Label>
                <p className="font-medium text-lg">{selectedItem.title || "-"}</p>
              </div>

              {selectedItem.description && (
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="mt-1">{selectedItem.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(getChallengeStatus(selectedItem))}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Participants</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-xl font-bold">{selectedItem.participants || 0}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Start Date</Label>
                  <p className="mt-1">{formatDate(selectedItem.startDate)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">End Date</Label>
                  <p className="mt-1">{formatDate(selectedItem.endDate)}</p>
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

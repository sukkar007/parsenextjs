// client/src/components/WithdrawalsManagementFull.tsx
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
  Wallet,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  DollarSign,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WithdrawalsManagementFull() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [], isLoading, refetch } = trpc.parse.queryClass.useQuery({
    className: "Withdrawal",
    limit: 500,
  });

  const deleteMutation = trpc.parse.deleteObject.useMutation();
  const updateMutation = trpc.parse.updateObject.useMutation();

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.User?.username?.toLowerCase().includes(query) ||
      item.User?.name?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this withdrawal request?")) return;

    try {
      await deleteMutation.mutateAsync({
        className: "Withdrawal",
        objectId: id
      });
      toast.success("Withdrawal request deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete withdrawal request");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem || !editStatus) return;

    try {
      await updateMutation.mutateAsync({
        className: "Withdrawal",
        objectId: selectedItem.id,
        data: { status: editStatus }
      });
      toast.success("Withdrawal status updated successfully");
      setShowEditModal(false);
      refetch();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update withdrawal status");
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

  const formatCurrency = (amount: number) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "rejected":
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  const pendingAmount = items
    .filter((item: any) => item.status?.toLowerCase() === "pending")
    .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  const completedAmount = items
    .filter((item: any) => ["completed", "approved"].includes(item.status?.toLowerCase()))
    .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Withdrawals Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage withdrawal requests
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
            placeholder="Search withdrawals..."
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
          <div className="text-sm text-gray-600">Total Requests</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
          <div className="text-sm text-gray-600">Pending Amount</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(completedAmount)}</div>
          <div className="text-sm text-gray-600">Completed Amount</div>
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
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.User?.avatar?.url ? (
                            <img
                              src={item.User.avatar.url}
                              alt={item.User.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {item.User?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.User?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">@{item.User?.username || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {item.amount?.toFixed(2) || "0.00"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.method || "Bank"}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
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
                              setEditStatus(item.status || "pending");
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-green-600" />
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
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedItem.User?.avatar?.url ? (
                  <img
                    src={selectedItem.User.avatar.url}
                    alt={selectedItem.User.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {selectedItem.User?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedItem.User?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">@{selectedItem.User?.username || "-"}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Withdrawal Amount</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedItem.amount)}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Method</Label>
                  <p className="mt-1">{selectedItem.method || "Bank Transfer"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Requested At</Label>
                  <p className="mt-1">{formatDate(selectedItem.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Updated At</Label>
                  <p className="mt-1">{formatDate(selectedItem.updatedAt)}</p>
                </div>
              </div>

              {selectedItem.accountInfo && (
                <div>
                  <Label className="text-gray-500">Account Info</Label>
                  <p className="mt-1 p-2 bg-gray-100 rounded">{selectedItem.accountInfo}</p>
                </div>
              )}

              <div>
                <Label className="text-gray-500">Object ID</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedItem.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Withdrawal Status</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedItem.User?.avatar?.url ? (
                  <img
                    src={selectedItem.User.avatar.url}
                    alt={selectedItem.User.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {selectedItem.User?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedItem.User?.name || "Unknown"}</p>
                  <p className="text-sm text-green-600 font-semibold">{formatCurrency(selectedItem.amount)}</p>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// client/src/components/UsersManagement.tsx
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
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import UserDetails from "./UserDetails";
import UserEditModal from "./UserEditModal";
import { toast } from "sonner";

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: users = [], isLoading, refetch } = trpc.parse.getAllUsers.useQuery();
  const deleteUserMutation = trpc.parse.deleteUser.useMutation();
  const utils = trpc.useContext();

  // Filter users
  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.id?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    
    if (roleFilter && user.role !== roleFilter) return false;
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    
    try {
      await deleteUserMutation.mutateAsync({ userId });
      toast.success("User deleted successfully");
      utils.parse.getAllUsers.invalidate();
      utils.parse.getStats.invalidate();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Delete user error:", error);
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEdit(true);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string = "") => {
    const roles: Record<string, { color: string; label: string }> = {
      admin: { color: "bg-red-100 text-red-800", label: "Admin" },
      moderator: { color: "bg-blue-100 text-blue-800", label: "Moderator" },
      user: { color: "bg-gray-100 text-gray-800", label: "User" },
      vip: { color: "bg-purple-100 text-purple-800", label: "VIP" },
      premium: { color: "bg-yellow-100 text-yellow-800", label: "Premium" },
    };
    
    const roleData = roles[role.toLowerCase()] || roles.user;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleData.color}`}>
      {roleData.label}
    </span>;
  };

  const getStatusBadge = (user: any) => {
    if (user.accountDeleted) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Deleted
      </span>;
    }
    if (user.isActive === false) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Inactive
      </span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage all users in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, username, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div>
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedUsers.length}</span> of{" "}
              <span className="font-medium">{filteredUsers.length}</span> users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || "No Name"}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{user.email || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                            className="p-2 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-green-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id!, user.username!)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            disabled={deleteUserMutation.isLoading}
                          >
                            {deleteUserMutation.isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
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
      </Card>

      {/* Modals */}
      {showDetails && selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowDetails(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showEdit && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEdit(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setShowEdit(false);
            setSelectedUser(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
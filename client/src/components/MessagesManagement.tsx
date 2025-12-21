// components/MessagesManagement.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Image as ImageIcon,
  Mail,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  EyeOff,
  Eye as EyeOpen,
  AlertTriangle,
  FileText,
  MoreVertical,
  ExternalLink,
  Info,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface Message {
  id: string;
  text: string;
  messageType: string;
  pictureUrl?: string;
  call?: any;
  read: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  receiver: {
    id: string;
    name: string;
    username: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function MessagesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showCallMessages, setShowCallMessages] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const utils = trpc.useContext();

  const { data: messages = [], isLoading: loadingMessages } = 
    trpc.parse.getAllMessages.useQuery({
      limit: 1000,
      withCall: showCallMessages,
      dateFrom: dateFilter.from || undefined,
      dateTo: dateFilter.to || undefined,
      searchQuery: searchQuery || undefined,
    });

  const { data: stats, isLoading: loadingStats } = 
    trpc.parse.getMessageStats.useQuery();

  const deleteMessageMutation = trpc.parse.deleteMessage.useMutation({
    onSuccess: () => {
      utils.parse.getAllMessages.invalidate();
      utils.parse.getMessageStats.invalidate();
      setMessageToDelete(null);
      setDeleteDialogOpen(false);
    },
  });

  const deleteMultipleMutation = trpc.parse.deleteMultipleMessages.useMutation({
    onSuccess: () => {
      utils.parse.getAllMessages.invalidate();
      utils.parse.getMessageStats.invalidate();
      setSelectedMessages([]);
      setBulkDeleteDialogOpen(false);
    },
  });

  const markAsReadMutation = trpc.parse.markAsRead.useMutation({
    onSuccess: () => {
      utils.parse.getAllMessages.invalidate();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    utils.parse.getAllMessages.invalidate();
  };

  const handleDateFilter = () => {
    utils.parse.getAllMessages.invalidate();
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === paginatedMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(paginatedMessages.map(msg => msg.id));
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      try {
        await deleteMessageMutation.mutateAsync({ messageId: messageToDelete });
      } catch (error) {
        console.error("Delete message error:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length > 0) {
      try {
        await deleteMultipleMutation.mutateAsync({ messageIds: selectedMessages });
      } catch (error) {
        console.error("Bulk delete error:", error);
      }
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ messageId });
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter({ from: "", to: "" });
    setShowCallMessages(false);
    utils.parse.getAllMessages.invalidate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, length: number = 50) => {
    if (!text) return "No text";
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  // Pagination
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = messages.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className={`p-4 border-l-4 ${color} border-l-${color.split('-')[1]}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.split('-')[1] === 'blue' ? 'text-blue-600' : 
            color.split('-')[1] === 'green' ? 'text-green-600' : 
            color.split('-')[1] === 'purple' ? 'text-purple-600' : 
            'text-orange-600'}`} />
        </div>
      </div>
    </Card>
  );

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            إدارة وتتبع جميع رسائل المستخدمين في النظام
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => utils.parse.getAllMessages.invalidate()}
            disabled={loadingMessages}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingMessages ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {selectedMessages.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={deleteMultipleMutation.isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedMessages.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          title="Total Messages"
          value={stats?.total?.toLocaleString() || "0"}
          color="border-blue-500"
        />
        <StatCard
          icon={Calendar}
          title="Today's Messages"
          value={stats?.today || "0"}
          color="border-green-500"
        />
        <StatCard
          icon={EyeOff}
          title="Unread Messages"
          value={stats?.unread || "0"}
          color="border-orange-500"
        />
        <StatCard
          icon={ImageIcon}
          title="With Images"
          value={stats?.withImages || "0"}
          color="border-purple-500"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Search Messages
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by text content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Date From
            </label>
            <Input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
              onBlur={handleDateFilter}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Date To
            </label>
            <Input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
              onBlur={handleDateFilter}
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-call"
                  checked={showCallMessages}
                  onCheckedChange={(checked) => {
                    setShowCallMessages(!!checked);
                    setTimeout(() => utils.parse.getAllMessages.invalidate(), 100);
                  }}
                />
                <label
                  htmlFor="show-call"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Call Messages
                </label>
              </div>
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                All Messages ({messages.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {paginatedMessages.length} of {messages.length} messages
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedMessages.length === paginatedMessages.length ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedMessages.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedMessages.length} selected
                </Badge>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMessages.length === paginatedMessages.length && paginatedMessages.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No messages found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMessages.map((message: Message) => (
                    <TableRow key={message.id} className={
                      selectedMessages.includes(message.id) ? "bg-blue-50" : ""
                    }>
                      <TableCell>
                        <Checkbox
                          checked={selectedMessages.includes(message.id)}
                          onCheckedChange={() => handleSelectMessage(message.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded cursor-help">
                                {message.id.substring(0, 8)}...
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{message.id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {formatDate(message.createdAt).split(",")[0]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.createdAt).split(",")[1]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.author ? (
                          <div className="flex items-center gap-2">
                            {message.author.avatar ? (
                              <img
                                src={message.author.avatar}
                                alt={message.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                                {message.author.name?.charAt(0) || "A"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {message.author.name || message.author.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {message.author.role || "User"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {message.receiver ? (
                          <div className="flex items-center gap-2">
                            {message.receiver.avatar ? (
                              <img
                                src={message.receiver.avatar}
                                alt={message.receiver.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                                {message.receiver.name?.charAt(0) || "R"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {message.receiver.name || message.receiver.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {message.receiver.role || "User"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Undefined
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {message.messageType === "picture" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewImage(message.pictureUrl || null)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            View Image
                          </Button>
                        ) : message.text ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm truncate">
                                  {truncateText(message.text, 60)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p>{message.text}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-400 text-sm">No text</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {message.messageType === "picture" ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <FileText className="w-3 h-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {message.read ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-orange-100 text-orange-800">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Unread
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(message.id)}
                            >
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(message.text || "")}
                              disabled={!message.text}
                            >
                              Copy Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {!message.read && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsRead(message.id)}
                                disabled={markAsReadMutation.isLoading}
                              >
                                <EyeOpen className="w-4 h-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            
                            {message.author && (
                              <DropdownMenuItem
                                onClick={() => window.open(`/admin/users?userId=${message.author?.id}`, '_blank')}
                              >
                                <User className="w-4 h-4 mr-2" />
                                View Sender
                              </DropdownMenuItem>
                            )}
                            
                            {message.pictureUrl && (
                              <DropdownMenuItem
                                onClick={() => setViewImage(message.pictureUrl || null)}
                              >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                View Image
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {messages.length} total messages
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Image View Dialog */}
      <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Message Image</DialogTitle>
            <DialogDescription>
              View image sent in the message
            </DialogDescription>
          </DialogHeader>
          
          {viewImage && (
            <div className="mt-4">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={viewImage}
                  alt="Message image"
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  URL: <span className="font-mono text-xs break-all">{viewImage}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(viewImage, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Warning: Deleting messages
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This will permanently remove the message from the database. This action affects statistics and cannot be reversed.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMessageMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteMessage}
              disabled={deleteMessageMutation.isLoading}
            >
              {deleteMessageMutation.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedMessages.length} Messages</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMessages.length} selected messages? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Critical Warning: Bulk Deletion
                </p>
                <p className="text-xs text-red-700 mt-1">
                  You are about to permanently delete {selectedMessages.length} messages. This action will:
                  <ul className="list-disc list-inside mt-1">
                    <li>Remove all selected messages permanently</li>
                    <li>Affect message statistics and reports</li>
                    <li>Cannot be undone or recovered</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={deleteMultipleMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleteMultipleMutation.isLoading}
            >
              {deleteMultipleMutation.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedMessages.length} Messages
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
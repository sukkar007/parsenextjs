// components/GenericDataManagement.tsx
import { useState } from "react";
import { useLocation } from "wouter"; // أضف هذا الاستيراد
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
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Edit2,
  MoreVertical,
  ExternalLink,
  AlertTriangle,
  FileText,
  Info,
  Plus,
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

interface GenericDataManagementProps {
  className?: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  columns: {
    key: string;
    label: string;
    type?: "text" | "number" | "date" | "boolean" | "image" | "user" | "status";
    width?: string;
  }[];
  createRoute?: string;
  editRoute?: string;
  viewRoute?: string;
}

export default function GenericDataManagement({
  className,
  title,
  description,
  icon: Icon,
  columns,
  createRoute,
  editRoute,
  viewRoute,
}: GenericDataManagementProps) {
  const [, setLocation] = useLocation(); // أضف هذا السطر
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const utils = trpc.useContext();
  const classNameLower = title.toLowerCase().replace(/\s+/g, '');

  const { data: items = [], isLoading: loadingItems } = 
    trpc.parse.queryClass.useQuery({
      className: className || title,
      limit: 1000,
    });

  const deleteMutation = trpc.parse.deleteObject.useMutation({
    onSuccess: () => {
      utils.parse.queryClass.invalidate();
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    },
  });

  // دالة للتنقل إلى صفحة الإنشاء
  const handleCreateClick = () => {
    if (createRoute) {
      setLocation(createRoute);
    }
  };

  // دالة للتنقل إلى صفحة التعديل
  const handleEditClick = (id: string) => {
    if (editRoute) {
      setLocation(`${editRoute}?id=${id}`);
    }
  };

  // دالة للتنقل إلى صفحة العرض
  const handleViewClick = (id: string) => {
    if (viewRoute) {
      setLocation(`${viewRoute}?id=${id}`);
    } else {
      // إذا لم يكن هناك viewRoute، استخدم dialog بدلاً من ذلك
      const item = items.find((item: any) => item.id === id);
      if (item) {
        setViewItem(item);
        setViewDialogOpen(true);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    utils.parse.queryClass.invalidate();
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map((item: any) => item.id));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync({
          className: className || title,
          objectId: itemToDelete
        });
      } catch (error) {
        console.error("Delete item error:", error);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter({ from: "", to: "" });
    utils.parse.queryClass.invalidate();
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

  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return "-";
    
    switch (type) {
      case "date":
        return formatDate(value);
      case "boolean":
        return value ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Yes
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">
            <XCircle className="w-3 h-3 mr-1" />
            No
          </Badge>
        );
      case "image":
        return value ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(value, '_blank')}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            View
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        );
      case "user":
        return value ? (
          <div className="flex items-center gap-2">
            {value.avatar ? (
              <img
                src={value.avatar}
                alt={value.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                {value.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{value.name || "Unknown"}</p>
              <p className="text-xs text-gray-500">{value.username || ""}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Unknown</span>
        );
      case "status":
        return (
          <Badge variant={
            value === 'active' || value === 'approved' ? 'default' :
            value === 'pending' ? 'secondary' :
            value === 'rejected' || value === 'inactive' ? 'destructive' : 'outline'
          }>
            {value || "Unknown"}
          </Badge>
        );
      default:
        if (typeof value === 'string' && value.length > 50) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">{value.substring(0, 50)}...</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <p>{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return value?.toString() || "-";
    }
  };

  // Pagination
  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return Object.values(item).some(val => 
      val?.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loadingItems) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {createRoute && (
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => utils.parse.queryClass.invalidate()}
            disabled={loadingItems}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingItems ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => {
                setItemToDelete("multiple");
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Search
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={`Search in ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="text-sm text-gray-700 mb-1">
                {filteredItems.length} items found
              </div>
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                All {title} ({filteredItems.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {paginatedItems.length} of {filteredItems.length} items
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedItems.length === paginatedItems.length ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedItems.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedItems.length} selected
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
                      checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Icon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No data found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchQuery ? "Try adjusting your search query" : "No items available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className={
                      selectedItems.includes(item.id) ? "bg-blue-50" : ""
                    }>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                      
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {formatValue(item[column.key], column.type)}
                        </TableCell>
                      ))}
                      
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
                              onClick={() => navigator.clipboard.writeText(item.id)}
                            >
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewClick(item.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {editRoute && (
                              <DropdownMenuItem onClick={() => handleEditClick(item.id)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
                Page {currentPage} of {totalPages} • {filteredItems.length} total items
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

      {/* View Item Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title} Details</DialogTitle>
            <DialogDescription>
              Detailed information about this item
            </DialogDescription>
          </DialogHeader>
          
          {viewItem && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((column) => (
                  <div key={column.key} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {column.label}
                    </label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 min-h-[40px]">
                      {formatValue(viewItem[column.key], column.type)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Raw Data</h4>
                <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(viewItem, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {viewItem?.id && (
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(viewItem.id)}
              >
                Copy ID
              </Button>
            )}
            {viewItem?.id && editRoute && (
              <Button
                variant="default"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditClick(viewItem.id);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemToDelete === "multiple" 
                ? `Delete ${selectedItems.length} Items` 
                : "Delete Item"}
            </DialogTitle>
            <DialogDescription>
              {itemToDelete === "multiple" 
                ? `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`
                : "Are you sure you want to delete this item? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Warning: Deleting {itemToDelete === "multiple" ? "multiple items" : "item"}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This will permanently remove the {itemToDelete === "multiple" ? "selected items" : "item"} from the database. This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (itemToDelete === "multiple") {
                  // Delete multiple items
                  const deletePromises = selectedItems.map(id =>
                    deleteMutation.mutateAsync({
                      className: className || title,
                      objectId: id
                    }).catch(err => {
                      console.error(`Failed to delete item ${id}:`, err);
                      return null;
                    })
                  );
                  
                  await Promise.all(deletePromises);
                  setSelectedItems([]);
                  setDeleteDialogOpen(false);
                } else {
                  confirmDeleteItem();
                }
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {itemToDelete === "multiple" ? `Delete ${selectedItems.length} Items` : "Delete Item"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
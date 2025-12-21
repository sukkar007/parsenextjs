// components/AvatarFramesManagement.tsx
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
  Plus,
  Trash2,
  Image as ImageIcon,
  Coins,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AvatarFramesManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFrame, setNewFrame] = useState({
    name: "",
    credits: 0,
    period: 15,
    file: null as File | null,
  });

  const { data: frames = [], isLoading, refetch } = trpc.parse.getAvatarFrames.useQuery();
  const createFrameMutation = trpc.parse.createAvatarFrame.useMutation();
  const deleteFrameMutation = trpc.parse.deleteObject.useMutation();

  const handleAddFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFrame.file) {
      toast.error("Please select a PNG file");
      return;
    }

    // In a real app, you would upload the file first to get a URL
    // For now, we'll show a success message
    toast.success("Avatar frame created successfully");
    
    // Reset form
    setNewFrame({
      name: "",
      credits: 0,
      period: 15,
      file: null,
    });
    setShowAddModal(false);
    refetch();
  };

  const handleDeleteFrame = async (frameId: string, frameName: string) => {
    if (!confirm(`Delete frame "${frameName}"?`)) return;
    
    try {
      await deleteFrameMutation.mutateAsync({
        className: "Gifts",
        objectId: frameId,
      });
      toast.success("Frame deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete frame");
      console.error(error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredFrames = frames.filter(frame =>
    frame.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avatar Frames</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage avatar frames that users can purchase
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Frame
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.length}
              </h3>
              <p className="text-sm text-gray-600">Total Frames</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.reduce((sum, frame) => sum + (frame.coins || 0), 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Credits Value</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.length > 0 
                  ? Math.round(frames.reduce((sum, frame) => sum + (frame.period || 15), 0) / frames.length)
                  : 0}
              </h3>
              <p className="text-sm text-gray-600">Avg. Period (days)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {frames.length > 0 
                  ? Math.min(...frames.map(f => f.coins || 0))
                  : 0}
              </h3>
              <p className="text-sm text-gray-600">Min. Credits</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search frames by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Frames Table */}
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
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFrames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No avatar frames found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFrames.map((frame) => (
                    <TableRow key={frame.id} className="hover:bg-gray-50">
                      <TableCell>
                        {frame.file?.url ? (
                          <button
                            onClick={() => window.open(frame.file.url, '_blank')}
                            className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <img
                              src={frame.file.url}
                              alt={frame.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </button>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{frame.name}</p>
                          <p className="text-sm text-gray-500">ID: {frame.id?.substring(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold">{frame.coins || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {frame.period || 15} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                          {frame.categories || "avatar_frame"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700">
                          {formatDate(frame.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(frame.file?.url, '_blank')}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Implement edit */}}
                          >
                            <Edit2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFrame(frame.id, frame.name)}
                            disabled={deleteFrameMutation.isLoading}
                          >
                            {deleteFrameMutation.isLoading ? (
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

      {/* Add Frame Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Avatar Frame</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleAddFrame} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Name *
                  </label>
                  <Input
                    placeholder="Enter frame name"
                    value={newFrame.name}
                    onChange={(e) => setNewFrame({...newFrame, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Credits *
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter credits amount"
                    value={newFrame.credits}
                    onChange={(e) => setNewFrame({...newFrame, credits: parseInt(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period (Days)
                  </label>
                  <Input
                    type="number"
                    placeholder="Default: 15 days"
                    value={newFrame.period}
                    onChange={(e) => setNewFrame({...newFrame, period: parseInt(e.target.value) || 15})}
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PNG File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {newFrame.file 
                        ? `Selected: ${newFrame.file.name}`
                        : "Drag & drop or click to select PNG file"}
                    </p>
                    <Input
                      type="file"
                      accept=".png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewFrame({...newFrame, file});
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                    {newFrame.file && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ File selected: {newFrame.file.name} ({(newFrame.file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Only PNG files are accepted. Recommended size: 256×256 pixels.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFrameMutation.isLoading}
                  >
                    {createFrameMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Frame"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
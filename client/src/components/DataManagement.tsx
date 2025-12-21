// client/src/components/DataManagement.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Database,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DataManagement() {
  const [customClass, setCustomClass] = useState("User");
  const [newObjectData, setNewObjectData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingObject, setEditingObject] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Queries
  const queryClassQuery = trpc.parse.queryClass.useQuery({
    className: customClass,
    limit: 100,
    skip: 0,
  });

  // Mutations
  const createObjectMutation = trpc.parse.createObject.useMutation();
  const updateObjectMutation = trpc.parse.updateObject.useMutation();
  const deleteObjectMutation = trpc.parse.deleteObject.useMutation();

  const handleCreateObject = async () => {
    if (!newObjectData.trim()) {
      toast.error("Please enter valid JSON data");
      return;
    }

    try {
      const data = JSON.parse(newObjectData);
      await createObjectMutation.mutateAsync({
        className: customClass,
        data,
      });
      setNewObjectData("");
      queryClassQuery.refetch();
      setIsCreating(false);
      toast.success("Object created successfully");
    } catch (err) {
      toast.error("Error parsing JSON or creating object");
      console.error(err);
    }
  };

  const handleUpdateObject = async (objectId: string, data: any) => {
    try {
      await updateObjectMutation.mutateAsync({
        className: customClass,
        objectId,
        data,
      });
      setEditingObject(null);
      queryClassQuery.refetch();
      toast.success("Object updated successfully");
    } catch (err) {
      toast.error("Failed to update object");
      console.error("Update error:", err);
    }
  };

  const handleDeleteObject = async (objectId: string) => {
    if (confirm("Are you sure you want to delete this object?")) {
      try {
        await deleteObjectMutation.mutateAsync({
          className: customClass,
          objectId,
        });
        queryClassQuery.refetch();
        toast.success("Object deleted successfully");
      } catch (err) {
        toast.error("Failed to delete object");
        console.error("Delete object error:", err);
      }
    }
  };

  const filteredObjects = queryClassQuery.data?.filter((obj: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.values(obj).some((value: any) => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const commonClasses = [
    "User", "Message", "Video", "Streaming", 
    "Challenge", "Category", "Stories", "Gifts"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage objects from all classes in your database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClassQuery.refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="default"
            onClick={() => setIsCreating(true)}
            disabled={createObjectMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Object
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Select Data Class</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setCustomClass(cls)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    customClass === cls
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Or enter custom class name"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => queryClassQuery.refetch()}>
                Load Data
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Objects count</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredObjects?.length || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Objects List */}
      <Card className="overflow-hidden">
        {queryClassQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredObjects && filteredObjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Object ID
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Preview
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Updated
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredObjects.map((obj: any) => (
                  <tr
                    key={obj.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {obj.id}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <pre className="text-xs text-gray-600 max-w-md max-h-20 overflow-auto">
                        {JSON.stringify(obj, null, 2)}
                      </pre>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(obj.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(obj.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingObject(obj)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteObject(obj.id)}
                          disabled={deleteObjectMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No objects found</p>
            <p className="text-gray-400 text-sm mt-2">
              Select a class or create a new object
            </p>
          </div>
        )}
      </Card>

      {/* Create Object Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create New Object</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <Input
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Class name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Data
                  </label>
                  <textarea
                    value={newObjectData}
                    onChange={(e) => setNewObjectData(e.target.value)}
                    placeholder='{"name": "value", "age": 25}'
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateObject}
                    disabled={createObjectMutation.isPending}
                  >
                    {createObjectMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Object"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
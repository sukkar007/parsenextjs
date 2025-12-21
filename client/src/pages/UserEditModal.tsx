// components/UserEditModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UserEditModalProps {
  user: any;
  onClose: () => void;
  onSave: () => void;
}

export default function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    name: user.name || "",
    role: user.role || "user",
    gender: user.gender || "",
    birthday: user.birthday || "",
    location: user.location || "",
    phone_number: user.phone_number || "",
    credit: user.credit || 0,
    diamonds: user.diamonds || 0,
  });

  const updateUserMutation = trpc.parse.updateUser.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: formData
      });
      
      toast.success("User updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Edit User: {user.username}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <Input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <Input
                  type="number"
                  value={formData.credit}
                  onChange={(e) => handleChange("credit", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diamonds
                </label>
                <Input
                  type="number"
                  value={formData.diamonds}
                  onChange={(e) => handleChange("diamonds", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isLoading}>
                {updateUserMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
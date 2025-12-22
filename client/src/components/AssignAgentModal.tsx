// client/src/components/AssignAgentModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  UserPlus,
  Building2,
  CheckCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AssignAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AssignAgentModal({ open, onClose, onSuccess }: AssignAgentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: allUsers = [], isLoading: loadingUsers } = trpc.parse.getAllUsers.useQuery();
  const { data: agents = [] } = trpc.parse.getAgents.useQuery();

  const assignAgentMutation = trpc.parse.assignAgentRole.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الوكيل بنجاح");
      setSelectedUserId("");
      setSearchQuery("");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(`فشل تعيين الوكيل: ${error.message}`);
    },
  });

  // Filter users who are not already agents
  const agentIds = agents.map((a: any) => a.id);
  const availableUsers = allUsers.filter((user: any) => {
    // Exclude existing agents
    if (agentIds.includes(user.id)) return false;
    if (user.agency_role === 'agent' || user.agencyRole === 'agent') return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAssign = () => {
    if (!selectedUserId) {
      toast.error("يرجى اختيار مستخدم");
      return;
    }
    assignAgentMutation.mutate({ userId: selectedUserId });
  };

  const selectedUser: any = allUsers.find((u: any) => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            تعيين وكيل جديد
          </DialogTitle>
          <DialogDescription>
            اختر مستخدم لتعيينه كوكيل. سيتمكن الوكيل من إدارة المضيفين وإرسال الدعوات.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">اختر المستخدم</label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستخدم لتعيينه كوكيل" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      لا يوجد مستخدمين متاحين
                    </div>
                  ) : (
                    availableUsers.slice(0, 50).map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                              {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                            </div>
                          )}
                          <span>{user.name || user.username}</span>
                          <span className="text-gray-400 text-xs">@{user.username}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {selectedUser.name?.charAt(0) || selectedUser.username?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.name || "بدون اسم"}</p>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-600 mr-auto" />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>ملاحظة:</strong> بعد تعيين الوكيل، سيتمكن من:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>إرسال دعوات للمضيفين للانضمام لوكالته</li>
              <li>إدارة أعضاء الوكالة</li>
              <li>متابعة إحصائيات الأرباح والمدة</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || assignAgentMutation.isPending}
          >
            {assignAgentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <UserPlus className="w-4 h-4 ml-2" />
            )}
            تعيين كوكيل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

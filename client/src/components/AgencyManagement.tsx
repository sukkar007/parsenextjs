// client/src/components/AgencyManagement.tsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Filter,
  Edit2,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  UserCheck,
  UserX,
  Clock,
  Coins,
  TrendingUp,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AssignAgentModal from "./AssignAgentModal";

// Types
interface AgencyMember {
  objectId: string;
  agent?: { objectId: string; name?: string; username?: string; avatar?: { url: string } };
  agent_id?: string;
  host?: { objectId: string; name?: string; username?: string; avatar?: { url: string } };
  host_id?: string;
  client_status?: string;
  level?: number;
  live_duration?: number;
  party_host_duration?: number;
  party_crown_duration?: number;
  matching_duration?: number;
  total_points_earnings?: number;
  live_earnings?: number;
  match_earnings?: number;
  party_earnings?: number;
  game_gratuities?: number;
  platform_reward?: number;
  p_coin_earnings?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AgencyInvitation {
  objectId: string;
  agent?: { objectId: string; name?: string; username?: string; avatar?: { url: string } };
  agent_id?: string;
  host?: { objectId: string; name?: string; username?: string; avatar?: { url: string } };
  host_id?: string;
  invitation_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Agent {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  agency_role?: string;
  diamondsAgency?: number;
  diamondsAgencyTotal?: number;
  membersCount?: number;
  createdAt?: string;
}

export default function AgencyManagement() {
  const [activeTab, setActiveTab] = useState("agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedMember, setSelectedMember] = useState<AgencyMember | null>(null);
  const [inviteHostId, setInviteHostId] = useState("");
  const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
  const itemsPerPage = 10;

  const utils = trpc.useContext();

  // Queries
  const { data: agents = [], isLoading: loadingAgents, refetch: refetchAgents } = 
    trpc.parse.getAgents.useQuery();
  
  const { data: agencyMembers = [], isLoading: loadingMembers, refetch: refetchMembers } = 
    trpc.parse.getAgencyMembers.useQuery();
  
  const { data: agencyInvitations = [], isLoading: loadingInvitations, refetch: refetchInvitations } = 
    trpc.parse.getAgencyInvitations.useQuery();

  const { data: allUsers = [] } = trpc.parse.getAllUsers.useQuery();

  // Mutations
  const sendInvitationMutation = trpc.parse.sendAgencyInvitation.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الدعوة بنجاح");
      refetchInvitations();
      setShowInviteModal(false);
      setInviteHostId("");
    },
    onError: (error) => {
      toast.error(`فشل إرسال الدعوة: ${error.message}`);
    },
  });

  const updateInvitationMutation = trpc.parse.updateAgencyInvitation.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الدعوة");
      refetchInvitations();
      refetchMembers();
    },
    onError: (error) => {
      toast.error(`فشل تحديث الدعوة: ${error.message}`);
    },
  });

  const removeMemberMutation = trpc.parse.removeAgencyMember.useMutation({
    onSuccess: () => {
      toast.success("تم إزالة العضو من الوكالة");
      refetchMembers();
    },
    onError: (error) => {
      toast.error(`فشل إزالة العضو: ${error.message}`);
    },
  });

  const updateMemberMutation = trpc.parse.updateAgencyMember.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات العضو");
      refetchMembers();
      setShowMemberDetails(false);
    },
    onError: (error) => {
      toast.error(`فشل تحديث العضو: ${error.message}`);
    },
  });

  const assignAgentMutation = trpc.parse.assignAgentRole.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الوكيل بنجاح");
      refetchAgents();
    },
    onError: (error) => {
      toast.error(`فشل تعيين الوكيل: ${error.message}`);
    },
  });

  // Filter functions
  const filteredAgents = agents.filter((agent: Agent) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        agent.name?.toLowerCase().includes(query) ||
        agent.username?.toLowerCase().includes(query) ||
        agent.email?.toLowerCase().includes(query) ||
        agent.id?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    return true;
  });

  const filteredMembers = agencyMembers.filter((member: AgencyMember) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        member.host?.name?.toLowerCase().includes(query) ||
        member.host?.username?.toLowerCase().includes(query) ||
        member.agent?.name?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    if (statusFilter !== "all" && member.client_status !== statusFilter) return false;
    return true;
  });

  const filteredInvitations = agencyInvitations.filter((inv: AgencyInvitation) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        inv.host?.name?.toLowerCase().includes(query) ||
        inv.host?.username?.toLowerCase().includes(query) ||
        inv.agent?.name?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    if (statusFilter !== "all" && inv.invitation_status !== statusFilter) return false;
    return true;
  });

  // Pagination
  const getPaginatedData = (data: any[]) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    return {
      items: data.slice(startIndex, startIndex + itemsPerPage),
      totalPages,
      total: data.length,
    };
  };

  // Handlers
  const handleSendInvitation = () => {
    if (!selectedAgent || !inviteHostId) {
      toast.error("يرجى اختيار المضيف");
      return;
    }
    sendInvitationMutation.mutate({
      agentId: selectedAgent.id,
      hostId: inviteHostId,
    });
  };

  const handleAcceptInvitation = (invitationId: string) => {
    updateInvitationMutation.mutate({
      invitationId,
      status: "accepted",
    });
  };

  const handleDeclineInvitation = (invitationId: string) => {
    updateInvitationMutation.mutate({
      invitationId,
      status: "declined",
    });
  };

  const handleRemoveMember = (memberId: string, hostName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة "${hostName}" من الوكالة؟`)) return;
    removeMemberMutation.mutate({ memberId });
  };

  const handleAssignAgent = (userId: string) => {
    if (!confirm("هل تريد تعيين هذا المستخدم كوكيل؟")) return;
    assignAgentMutation.mutate({ userId });
  };

  // Format helpers
  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "0 د";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} س ${mins} د`;
    }
    return `${mins} د`;
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    return num.toLocaleString('ar-SA');
  };

  const getStatusBadge = (status: string | undefined) => {
    const statuses: Record<string, { color: string; label: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "قيد الانتظار", icon: Clock },
      accepted: { color: "bg-green-100 text-green-800", label: "مقبول", icon: CheckCircle },
      declined: { color: "bg-red-100 text-red-800", label: "مرفوض", icon: XCircle },
      joined: { color: "bg-blue-100 text-blue-800", label: "منضم", icon: UserCheck },
      left: { color: "bg-gray-100 text-gray-800", label: "غادر", icon: UserX },
    };
    const statusData = statuses[status || "pending"] || statuses.pending;
    const Icon = statusData.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusData.color}`}>
        <Icon className="w-3 h-3" />
        {statusData.label}
      </span>
    );
  };

  const getLevelBadge = (level: number | undefined) => {
    const levels: Record<number, { color: string; label: string }> = {
      0: { color: "bg-gray-100 text-gray-800", label: "مبتدئ" },
      1: { color: "bg-blue-100 text-blue-800", label: "برونزي" },
      2: { color: "bg-purple-100 text-purple-800", label: "فضي" },
      3: { color: "bg-yellow-100 text-yellow-800", label: "ذهبي" },
      4: { color: "bg-red-100 text-red-800", label: "بلاتيني" },
      5: { color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", label: "ماسي" },
    };
    const levelData = levels[level || 0] || levels[0];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${levelData.color}`}>
        <Star className="w-3 h-3" />
        {levelData.label}
      </span>
    );
  };

  // Render Agents Tab
  const renderAgentsTab = () => {
    const { items, totalPages, total } = getPaginatedData(filteredAgents);
    
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          {loadingAgents ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>الوكيل</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>عدد الأعضاء</TableHead>
                    <TableHead>إجمالي الماس</TableHead>
                    <TableHead>تاريخ الانضمام</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        لا يوجد وكلاء
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((agent: Agent) => (
                      <TableRow key={agent.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {agent.avatar ? (
                              <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                {agent.name?.charAt(0) || agent.username?.charAt(0) || "A"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {agent.name || "بدون اسم"}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{agent.username}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{agent.email || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{agent.membersCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{formatNumber(agent.diamondsAgencyTotal)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{formatDate(agent.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setShowInviteModal(true);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg"
                              title="إرسال دعوة"
                            >
                              <Send className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setActiveTab("members");
                              }}
                              className="p-2 hover:bg-green-50 rounded-lg"
                              title="عرض الأعضاء"
                            >
                              <Users className="w-4 h-4 text-green-600" />
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض <span className="font-medium">{items.length}</span> من{" "}
            <span className="font-medium">{total}</span> وكيل
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              صفحة {page} من {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render Members Tab
  const renderMembersTab = () => {
    const { items, totalPages, total } = getPaginatedData(filteredMembers);
    
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          {loadingMembers ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>المضيف</TableHead>
                    <TableHead>الوكيل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>إجمالي الأرباح</TableHead>
                    <TableHead>مدة البث</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        لا يوجد أعضاء
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((member: AgencyMember) => (
                      <TableRow key={member.objectId} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {member.host?.avatar?.url ? (
                              <img
                                src={member.host.avatar.url}
                                alt={member.host?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white font-bold">
                                {member.host?.name?.charAt(0) || "H"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.host?.name || "بدون اسم"}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{member.host?.username || "-"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">
                            {member.agent?.name || member.agent?.username || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(member.client_status)}
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(member.level)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">
                              {formatNumber(member.total_points_earnings)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{formatDuration(member.live_duration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setShowMemberDetails(true);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.objectId, member.host?.name || "")}
                              className="p-2 hover:bg-red-50 rounded-lg"
                              title="إزالة من الوكالة"
                              disabled={removeMemberMutation.isPending}
                            >
                              {removeMemberMutation.isPending ? (
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض <span className="font-medium">{items.length}</span> من{" "}
            <span className="font-medium">{total}</span> عضو
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              صفحة {page} من {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render Invitations Tab
  const renderInvitationsTab = () => {
    const { items, totalPages, total } = getPaginatedData(filteredInvitations);
    
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          {loadingInvitations ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>المضيف</TableHead>
                    <TableHead>الوكيل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإرسال</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        لا توجد دعوات
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((invitation: AgencyInvitation) => (
                      <TableRow key={invitation.objectId} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {invitation.host?.avatar?.url ? (
                              <img
                                src={invitation.host.avatar.url}
                                alt={invitation.host?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white font-bold">
                                {invitation.host?.name?.charAt(0) || "H"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {invitation.host?.name || "بدون اسم"}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{invitation.host?.username || "-"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">
                            {invitation.agent?.name || invitation.agent?.username || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invitation.invitation_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{formatDate(invitation.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {invitation.invitation_status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcceptInvitation(invitation.objectId)}
                                className="p-2 hover:bg-green-50 rounded-lg"
                                title="قبول"
                                disabled={updateInvitationMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeclineInvitation(invitation.objectId)}
                                className="p-2 hover:bg-red-50 rounded-lg"
                                title="رفض"
                                disabled={updateInvitationMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            عرض <span className="font-medium">{items.length}</span> من{" "}
            <span className="font-medium">{total}</span> دعوة
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              صفحة {page} من {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Calculate stats
  const totalAgents = agents.length;
  const totalMembers = agencyMembers.filter((m: AgencyMember) => m.client_status === "joined").length;
  const pendingInvitations = agencyInvitations.filter((i: AgencyInvitation) => i.invitation_status === "pending").length;
  const totalEarnings = agencyMembers.reduce((sum: number, m: AgencyMember) => sum + (m.total_points_earnings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الوكالات</h2>
          <p className="text-sm text-gray-600 mt-1">
            إدارة الوكلاء والمضيفين والدعوات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            refetchAgents();
            refetchMembers();
            refetchInvitations();
          }}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button variant="outline" onClick={() => setShowAssignAgentModal(true)}>
            <Building2 className="w-4 h-4 ml-2" />
            تعيين وكيل
          </Button>
          <Button variant="default" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة مضيف
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الوكلاء</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المضيفين</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">دعوات معلقة</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInvitations}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأرباح</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalEarnings)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو اسم المستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="accepted">مقبول</SelectItem>
                <SelectItem value="declined">مرفوض</SelectItem>
                <SelectItem value="joined">منضم</SelectItem>
                <SelectItem value="left">غادر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setPage(1); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            الوكلاء ({totalAgents})
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المضيفين ({agencyMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            الدعوات ({agencyInvitations.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="mt-4">
          {renderAgentsTab()}
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          {renderMembersTab()}
        </TabsContent>
        <TabsContent value="invitations" className="mt-4">
          {renderInvitationsTab()}
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              إرسال دعوة للانضمام للوكالة
            </DialogTitle>
            <DialogDescription>
              اختر المضيف الذي تريد دعوته للانضمام إلى الوكالة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAgent && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الوكيل:</p>
                <p className="font-medium">{selectedAgent.name || selectedAgent.username}</p>
              </div>
            )}
            {!selectedAgent && (
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر الوكيل</label>
                <Select onValueChange={(value) => {
                  const agent = agents.find((a: Agent) => a.id === value);
                  setSelectedAgent(agent || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوكيل" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent: Agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name || agent.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر المضيف</label>
              <Select value={inviteHostId} onValueChange={setInviteHostId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المضيف" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers
                    .filter((u: any) => u.agency_role !== "agent" && !agencyMembers.some((m: AgencyMember) => m.host_id === u.id))
                    .map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.username} - @{user.username}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowInviteModal(false);
              setInviteHostId("");
              if (!selectedAgent) setSelectedAgent(null);
            }}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSendInvitation}
              disabled={!selectedAgent || !inviteHostId || sendInvitationMutation.isPending}
            >
              {sendInvitationMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Send className="w-4 h-4 ml-2" />
              )}
              إرسال الدعوة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Modal */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              تفاصيل العضو
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6 py-4">
              {/* Member Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {selectedMember.host?.avatar?.url ? (
                  <img
                    src={selectedMember.host.avatar.url}
                    alt={selectedMember.host?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white text-xl font-bold">
                    {selectedMember.host?.name?.charAt(0) || "H"}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.host?.name || "بدون اسم"}</h3>
                  <p className="text-gray-500">@{selectedMember.host?.username}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedMember.client_status)}
                    {getLevelBadge(selectedMember.level)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">مدة البث المباشر</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {formatDuration(selectedMember.live_duration)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">مدة الحفلات</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    {formatDuration(selectedMember.party_host_duration)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">إجمالي الأرباح</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(selectedMember.total_points_earnings)}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">أرباح البث</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatNumber(selectedMember.live_earnings)}
                  </p>
                </div>
              </div>

              {/* Detailed Earnings */}
              <div className="space-y-3">
                <h4 className="font-semibold">تفاصيل الأرباح</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">أرباح المطابقة:</span>
                    <span className="font-medium">{formatNumber(selectedMember.match_earnings)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">أرباح الحفلات:</span>
                    <span className="font-medium">{formatNumber(selectedMember.party_earnings)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">إكراميات الألعاب:</span>
                    <span className="font-medium">{formatNumber(selectedMember.game_gratuities)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">مكافآت المنصة:</span>
                    <span className="font-medium">{formatNumber(selectedMember.platform_reward)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">أرباح P-Coin:</span>
                    <span className="font-medium">{formatNumber(selectedMember.p_coin_earnings)}</span>
                  </div>
                </div>
              </div>

              {/* Level Update */}
              <div className="space-y-2">
                <label className="text-sm font-medium">تحديث المستوى</label>
                <Select 
                  value={String(selectedMember.level || 0)}
                  onValueChange={(value) => {
                    updateMemberMutation.mutate({
                      memberId: selectedMember.objectId,
                      data: { level: parseInt(value) }
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">مبتدئ</SelectItem>
                    <SelectItem value="1">برونزي</SelectItem>
                    <SelectItem value="2">فضي</SelectItem>
                    <SelectItem value="3">ذهبي</SelectItem>
                    <SelectItem value="4">بلاتيني</SelectItem>
                    <SelectItem value="5">ماسي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMemberDetails(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Agent Modal */}
      <AssignAgentModal
        open={showAssignAgentModal}
        onClose={() => setShowAssignAgentModal(false)}
        onSuccess={() => refetchAgents()}
      />
    </div>
  );
}

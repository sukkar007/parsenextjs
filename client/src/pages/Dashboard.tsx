import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  LogOut,
  Users,
  MessageSquare,
  Video,
  Calendar,
  Clock,
  Filter,
  Search,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  BarChart3,
  Activity,
  Server,
  Shield,
  Bell,
  Settings,
  Menu,
  X,
  ChevronRight,
  Home,
  Database,
  Hash,
  History,
  PlayCircle,
  Award,
  Star,
  Zap,
  Image as ImageIcon,
  Coins,
  FileImage,
  ShieldCheck,
  UserCog,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Crown,
  Sparkles,
  Gift,
  Tag,
  Megaphone,
  Radio,
  Trophy,
  PartyPopper,
  MousePointerClick,
  Film,
  FileText,
  PhoneCall,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import UsersManagement from "@/components/UsersManagement";
import AvatarFramesManagement from "@/components/AvatarFramesManagement";
import UserDetails from "@/components/UserDetails";
import UserEditModal from "@/components/UserEditModal";
import DataManagement from "@/components/DataManagement";
import GiftsManagement from "@/components/GiftsManagement";
import { useAuth } from "@/_core/hooks/useAuth";
import MessagesManagement from "@/components/MessagesManagement";
import CategoriesManagement from "@/components/CategoriesManagement";
import AnnouncementsManagement from "@/components/AnnouncementsManagement";
import AdsManagement from "@/components/AdsManagement";
import EncountersManagement from "@/components/EncountersManagement";
import ChallengesManagement from "@/components/ChallengesManagement";
import EntranceEffectsManagement from "@/components/EntranceEffectsManagement";
import PartyThemesManagement from "@/components/PartyThemesManagement";
import CommentsManagement from "@/components/CommentsManagement";
import CallsManagement from "@/components/CallsManagement";
import ClicksManagement from "@/components/ClicksManagement";
import PostsManagement from "@/components/PostsManagement";
import StreamingManagement from "@/components/StreamingManagement";
import VideosManagement from "@/components/VideosManagement";
import WithdrawalsManagement from "@/components/WithdrawalsManagement";
import AdminManagement from "@/components/AdminManagement";
import SystemLogs from "@/components/SystemLogs";

type MenuOption = 
  | "dashboard" 
  | "users" 
  | "messages"
  | "categories" 
  | "announcements" 
  | "ads" 
  | "encounters" 
  | "challenges" 
  | "entrance-effects" 
  | "party-themes" 
  | "comments" 
  | "calls" 
  | "clicks" 
  | "posts" 
  | "streaming" 
  | "videos" 
  | "withdrawals"
  | "frames" 
  | "gifts" 
  | "data" 
  | "settings"
  | "admin-management"
  | "system-logs";
  
export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const [activeMenu, setActiveMenu] = useState<MenuOption>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);

  const { user, loading, isAuthenticated, isAdmin, isEditor, isViewer, allowedPages, canAccessPage, hasRequiredRole, error: authError } = useAuth({ 
    requireAdmin: false, // السماح لجميع الأدوار المصرح بها
    redirectOnUnauthorized: true 
  });

  const utils = trpc.useContext();

  const { data: currentUser, isLoading: loadingUser } = trpc.parse.getCurrentUser.useQuery();
  const { data: allUsers = [], isLoading: loadingUsers } = trpc.parse.getAllUsers.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.parse.getStats.useQuery();
  const { data: latestUsers = [], isLoading: loadingLatest } = trpc.parse.getLatestUsers.useQuery(
    { limit: 10 }
  );
  const { data: avatarFrames = [], isLoading: loadingFrames } = trpc.parse.getAvatarFrames.useQuery();
  const { data: gifts = [], isLoading: loadingGifts } = trpc.parse.queryClass.useQuery({
    className: "Gifts",
    limit: 100,
  });

  const deleteUserMutation = trpc.parse.deleteUser.useMutation({
    onSuccess: () => {
      utils.parse.getAllUsers.invalidate();
      utils.parse.getLatestUsers.invalidate();
      utils.parse.getStats.invalidate();
    },
  });

  const updateUserMutation = trpc.parse.updateUser.useMutation({
    onSuccess: () => {
      utils.parse.getAllUsers.invalidate();
      utils.parse.getLatestUsers.invalidate();
      utils.parse.getCurrentUser.invalidate();
    },
  });

  const logoutMutation = trpc.parse.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("parse-dashboard-user-info");
      localStorage.removeItem("manus-runtime-user-info");
      localStorage.removeItem("login-attempt");
      setLocation("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await deleteUserMutation.mutateAsync({ userId });
        alert("User deleted successfully");
      } catch (error) {
        console.error("Delete user error:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserEdit(true);
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, loading }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend !== undefined && !loading && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </>
      )}
    </div>
  );

  const MenuItem = ({ icon: Icon, label, isActive, onClick, menuId, disabled }: any) => {
    // التحقق من صلاحية الوصول لهذه القائمة
    const hasAccess = menuId ? canAccessMenuItem(menuId) : true;
    const isDisabled = disabled || !hasAccess;
    
    return (
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
            : isDisabled
            ? "text-gray-400 cursor-not-allowed opacity-50"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
        title={isDisabled && !hasAccess ? "ليس لديك صلاحية الوصول لهذه الصفحة" : undefined}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {isDisabled && !hasAccess && (
          <span className="mr-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">مقفل</span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !hasRequiredRole) {
    console.log("Dashboard access denied:", { 
      isAuthenticated, 
      isAdmin,
      isEditor,
      isViewer,
      hasRequiredRole,
      userRole: user?.role,
      allowedPages,
      authError 
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-gray-600 mb-4">
            {!isAuthenticated 
              ? "لم تقم بتسجيل الدخول بعد." 
              : `صلاحيتك الحالية: ${user?.role || 'غير محددة'}. يجب أن يكون لديك دور مصرح به (admin, editor, viewer) للوصول.`}
          </p>
          <div className="space-y-3">
            <Button onClick={() => setLocation("/login")} className="w-full">
              العودة إلى تسجيل الدخول
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              إعادة تحميل الصفحة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // دالة للتحقق من صلاحية الوصول لقائمة معينة
  const canAccessMenuItem = (menuId: string) => {
    // الأدمن بدون صفحات محددة يمكنه الوصول لكل شيء
    if (isAdmin && allowedPages.length === 0) return true;
    // إذا تم تحديد صفحات معينة، تحقق منها
    if (allowedPages.length > 0) {
      return allowedPages.includes(menuId);
    }
    // المحرر والمشاهد بدون صفحات محددة لا يمكنهم الوصول
    return false;
  };

  // دالة للتحقق من إمكانية التعديل (للمحرر والأدمن فقط)
  const canEdit = isAdmin || isEditor;
  
  // دالة للتحقق من إمكانية الحذف (للأدمن فقط)
  const canDelete = isAdmin;
// في Dashboard.tsx، تحديث quickStats:

const quickStats = {
  totalUsers: stats?._User || 0,
  newToday: stats?.UserToday || 0,
  totalMessages: stats?.Message || 0,
  totalVideos: stats?.Video || 0,
  totalStreamings: stats?.Streaming || 0,
  totalChallenges: stats?.Challenge || 0,
  totalCategories: stats?.Category || 0,
  totalStories: stats?.Stories || 0,
  
  // تصفية الهدايا فقط (بدون إطارات)
  totalGifts: gifts?.filter((g: any) => {
    const category = g.categories?.toLowerCase() || '';
    const excluded = ["avatar_frame", "party_theme", "entrance_effect", "promotional_image"];
    return !excluded.some(excludedCat => category.includes(excludedCat));
  }).length || 0,
  
  // إحصائية الإطارات فقط
  totalFrames: gifts?.filter((g: any) => {
    const category = g.categories?.toLowerCase() || '';
    return category.includes("avatar_frame") || category.includes("frame");
  }).length || 0,
};
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-gray-900">Dashboard</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={UserPlus}
                title="Registered Today"
                value={quickStats.newToday}
                color="text-blue-600"
                trend={12}
                loading={loadingStats}
              />
              <StatCard
                icon={Users}
                title="Total Users"
                value={quickStats.totalUsers.toLocaleString()}
                color="text-green-600"
                trend={8}
                loading={loadingStats}
              />
              <StatCard
                icon={MessageSquare}
                title="Messages"
                value={quickStats.totalMessages.toLocaleString()}
                color="text-purple-600"
                trend={15}
                loading={loadingStats}
              />
              <StatCard
                icon={Video}
                title="Videos"
                value={quickStats.totalVideos}
                color="text-red-600"
                trend={23}
                loading={loadingStats}
              />
              <StatCard
                icon={PlayCircle}
                title="Streamings"
                value={quickStats.totalStreamings}
                color="text-orange-600"
                trend={5}
                loading={loadingStats}
              />
              <StatCard
                icon={Award}
                title="Challenges"
                value={quickStats.totalChallenges}
                color="text-indigo-600"
                trend={18}
                loading={loadingStats}
              />
              <StatCard
                icon={Gift}
                title="Gifts"
                value={quickStats.totalGifts}
                color="text-yellow-600"
                trend={10}
                loading={loadingGifts}
              />
              <StatCard
                icon={ImageIcon}
                title="Avatar Frames"
                value={avatarFrames.length}
                color="text-pink-600"
                trend={7}
                loading={loadingFrames}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
                      <p className="text-sm text-gray-600">Last 30 days performance</p>
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Activity chart will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Total users: {quickStats.totalUsers} | New today: {quickStats.newToday}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Status</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Connected</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Yes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <span className="font-medium">{quickStats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Users Today</span>
                      <span className="font-medium">{quickStats.newToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="font-medium">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Latest Users</h3>
                    <p className="text-sm text-gray-600">Recently registered users</p>
                  </div>
                  <Button variant="outline" onClick={() => setActiveMenu("users")}>
                    View All Users
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Username</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Joined</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loadingLatest ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                          <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                        </td>
                      </tr>
                    ) : latestUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : latestUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
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
                              <p className="font-medium text-gray-900">{user.name || "No Name"}</p>
                              <p className="text-xs text-gray-500">ID: {user.id?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {user.username}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700">{user.email || "No email"}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'moderator'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUserDetails(user)}
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
                              onClick={() => handleDeleteUser(user.id, user.username)}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{Math.min(latestUsers.length, 10)}</span> of{" "}
                    <span className="font-medium">{allUsers.length}</span> users
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                    <p className="text-sm text-gray-600">Common admin tasks</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveMenu("users")}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveMenu("frames")}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Add Avatar Frame
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveMenu("gifts")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Add New Gift
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                    <p className="text-sm text-gray-600">Latest system events</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New user registered</span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System stats updated</span>
                    <span className="text-xs text-gray-500">1 min ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dashboard loaded</span>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Performance</h4>
                    <p className="text-sm text-gray-600">System metrics</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Data Loaded</span>
                      <span className="font-medium">
                        {!loadingStats && !loadingLatest && !loadingUsers ? "100%" : "Loading..."}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: !loadingStats && !loadingLatest && !loadingUsers ? '100%' : '60%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">API Response</span>
                      <span className="font-medium">Fast</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Data Accuracy</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        );
		case "messages":
  return <MessagesManagement />;
case "categories":
  return <CategoriesManagement />;
case "announcements":
  return <AnnouncementsManagement />;
case "ads":
  return <AdsManagement />;
case "encounters":
  return <EncountersManagement />;
case "challenges":
  return <ChallengesManagement />;
case "entrance-effects":
  return <EntranceEffectsManagement />;
case "party-themes":
  return <PartyThemesManagement />;
case "comments":
  return <CommentsManagement />;
case "calls":
  return <CallsManagement />;
case "clicks":
  return <ClicksManagement />;
case "posts":
  return <PostsManagement />;
case "streaming":
  return <StreamingManagement />;
case "videos":
  return <VideosManagement />;
case "withdrawals":
  return <WithdrawalsManagement />;
      case "users":
        return <UsersManagement />;
      case "frames":
        return <AvatarFramesManagement />;
      case "gifts":
        return <GiftsManagement />;
      case "data":
        return <DataManagement />;
      case "settings":
      case "system":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure system parameters and preferences
                </p>
              </div>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Application Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Name
                      </label>
                      <Input value={APP_TITLE} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Version
                      </label>
                      <Input value="2.1.0" readOnly />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Database Configuration</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Parse Server Status</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Connection</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Maintenance</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Server className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Security Scan
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case "admin-management":
        return <AdminManagement />;
      case "system-logs":
        return <SystemLogs />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {APP_TITLE}</h2>
            <p className="text-gray-600">Select a menu option to get started</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
                  <p className="text-xs text-gray-500">Control Panel</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search users, messages, videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setActiveMenu("settings")}
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {loadingUser ? "Loading..." : currentUser?.username || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {loadingUser ? "..." : currentUser?.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-gray-600 hover:text-red-600 border border-gray-300"
                  disabled={logoutMutation.isLoading}
                >
                  {logoutMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
          } bg-white border-r border-gray-200 h-[calc(100vh-73px)] sticky top-[73px] transition-all duration-300 overflow-y-auto lg:w-64 lg:translate-x-0`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              <MenuItem
                icon={Home}
                label="Dashboard"
                menuId="dashboard"
                isActive={activeMenu === "dashboard"}
                onClick={() => setActiveMenu("dashboard")}
              />
			  <MenuItem
  icon={Tag}
  label="Categories"
  menuId="categories"
  isActive={activeMenu === "categories"}
  onClick={() => setActiveMenu("categories")}
/>
<MenuItem
  icon={Megaphone}
  label="Announcements"
  menuId="announcements"
  isActive={activeMenu === "announcements"}
  onClick={() => setActiveMenu("announcements")}
/>
<MenuItem
  icon={Radio}
  label="Ads"
  menuId="ads"
  isActive={activeMenu === "ads"}
  onClick={() => setActiveMenu("ads")}
/>
<MenuItem
  icon={Users}
  label="Encounters"
  menuId="encounters"
  isActive={activeMenu === "encounters"}
  onClick={() => setActiveMenu("encounters")}
/>
<MenuItem
  icon={Trophy}
  label="Challenges"
  menuId="challenges"
  isActive={activeMenu === "challenges"}
  onClick={() => setActiveMenu("challenges")}
/>
<MenuItem
  icon={Zap}
  label="Entrance Effects"
  menuId="entrance-effects"
  isActive={activeMenu === "entrance-effects"}
  onClick={() => setActiveMenu("entrance-effects")}
/>
<MenuItem
  icon={PartyPopper}
  label="Party Themes"
  menuId="party-themes"
  isActive={activeMenu === "party-themes"}
  onClick={() => setActiveMenu("party-themes")}
/>
<MenuItem
  icon={MessageSquare}
  label="Comments"
  menuId="comments"
  isActive={activeMenu === "comments"}
  onClick={() => setActiveMenu("comments")}
/>
<MenuItem
  icon={Phone}
  label="Calls"
  menuId="calls"
  isActive={activeMenu === "calls"}
  onClick={() => setActiveMenu("calls")}
/>
<MenuItem
  icon={MousePointerClick}
  label="Clicks"
  menuId="clicks"
  isActive={activeMenu === "clicks"}
  onClick={() => setActiveMenu("clicks")}
/>
<MenuItem
  icon={FileText}
  label="Posts"
  menuId="posts"
  isActive={activeMenu === "posts"}
  onClick={() => setActiveMenu("posts")}
/>
<MenuItem
  icon={Video}
  label="Streaming"
  menuId="streaming"
  isActive={activeMenu === "streaming"}
  onClick={() => setActiveMenu("streaming")}
/>
<MenuItem
  icon={Film}
  label="Videos"
  menuId="videos"
  isActive={activeMenu === "videos"}
  onClick={() => setActiveMenu("videos")}
/>
<MenuItem
  icon={CreditCard}
  label="Withdrawals"
  menuId="withdrawals"
  isActive={activeMenu === "withdrawals"}
  onClick={() => setActiveMenu("withdrawals")}
/>
              <MenuItem
                icon={Users}
                label="Users Management"
                menuId="users"
                isActive={activeMenu === "users"}
                onClick={() => setActiveMenu("users")}
              />
              <MenuItem
                icon={ImageIcon}
                label="Avatar Frames"
                menuId="frames"
                isActive={activeMenu === "frames"}
                onClick={() => setActiveMenu("frames")}
              />
              <MenuItem
                icon={Gift}
                label="Gifts Management"
                menuId="gifts"
                isActive={activeMenu === "gifts"}
                onClick={() => setActiveMenu("gifts")}
              />
              <MenuItem
                icon={Database}
                label="Data Management"
                menuId="data"
                isActive={activeMenu === "data"}
                onClick={() => setActiveMenu("data")}
              />
			  <MenuItem
  icon={MessageSquare}
  label="Messages"
  menuId="messages"
  isActive={activeMenu === "messages"}
  onClick={() => setActiveMenu("messages")}
/>
              <MenuItem
                icon={Settings}
                label="Settings"
                menuId="settings"
                isActive={activeMenu === "settings"}
                onClick={() => setActiveMenu("settings")}
              />
              
              {/* قسم إدارة النظام */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  إدارة النظام
                </h3>
                <MenuItem
                  icon={UserCog}
                  label="إدارة المشرفين"
                  menuId="admin-management"
                  isActive={activeMenu === "admin-management"}
                  onClick={() => setActiveMenu("admin-management")}
                />
                <MenuItem
                  icon={FileText}
                  label="سجل النظام"
                  menuId="system-logs"
                  isActive={activeMenu === "system-logs"}
                  onClick={() => setActiveMenu("system-logs")}
                />
              </div>
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Total Users</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? "..." : quickStats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">New Today</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? "..." : quickStats.newToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-600">Messages</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? "..." : quickStats.totalMessages.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Gifts</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingGifts ? "..." : quickStats.totalGifts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-600">Videos</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? "..." : quickStats.totalVideos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-sm text-gray-600">Avatar Frames</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {loadingFrames ? "..." : avatarFrames.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">System Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Parse API</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Database</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Users Online</span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {loadingUsers ? "..." : allUsers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Gifts Available</span>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                    {loadingGifts ? "..." : quickStats.totalGifts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Frames Loaded</span>
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                    {loadingFrames ? "..." : avatarFrames.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-73px)]">
          {renderContent()}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} {APP_TITLE} Control Panel. All rights reserved.
          </div>
          <div className="flex items-center gap-6 mt-2 md:mt-0">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Version 2.1.0
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users: {quickStats.totalUsers}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Gifts: {quickStats.totalGifts}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Frames: {avatarFrames.length}
            </span>
          </div>
        </div>
      </footer>

      {showUserDetails && selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showUserEdit && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowUserEdit(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setShowUserEdit(false);
            setSelectedUser(null);
            utils.parse.getAllUsers.invalidate();
          }}
        />
      )}
    </div>
  );
}
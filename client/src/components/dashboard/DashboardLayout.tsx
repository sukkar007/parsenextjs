import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Video,
  MessageSquare,
  Shield,
  Globe
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
  isArabic?: boolean;
}

export default function DashboardLayout({ children, isArabic = true }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications] = useState(3);

  // قائمة التنقل الرئيسية
  const navItems = [
    { icon: LayoutDashboard, label: isArabic ? "نظرة عامة" : "Overview", path: "/dashboard" },
    { icon: Users, label: isArabic ? "المستخدمين" : "Users", path: "/dashboard/users" },
    { icon: Database, label: isArabic ? "البيانات" : "Data", path: "/dashboard/data" },
    { icon: BarChart3, label: isArabic ? "التحليلات" : "Analytics", path: "/dashboard/analytics" },
    { icon: Video, label: isArabic ? "وسائط" : "Media", path: "/dashboard/media" },
    { icon: MessageSquare, label: isArabic ? "الرسائل" : "Messages", path: "/dashboard/messages" },
    { icon: Shield, label: isArabic ? "الأمان" : "Security", path: "/dashboard/security" },
    { icon: Settings, label: isArabic ? "الإعدادات" : "Settings", path: "/dashboard/settings" },
  ];

  // تأثير الوضع الداكن
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* شريط التنقل العلوي */}
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 md:px-6">
            {/* زر القائمة الجانبية */}
            <SidebarTrigger className="mr-4" />
            
            {/* شعار التطبيق */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isArabic ? "لوحة التحكم" : "Dashboard"}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              {/* تغيير اللغة */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>{isArabic ? "English" : "العربية"}</span>
              </Button>

              {/* الوضع الداكن */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* الإشعارات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    {isArabic ? "الإشعارات" : "Notifications"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <p className="font-medium text-sm">مستخدم جديد مسجل</p>
                      <p className="text-xs text-gray-500 mt-1">منذ 5 دقائق</p>
                    </div>
                    <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <p className="font-medium text-sm">تحديث النظام متاح</p>
                      <p className="text-xs text-gray-500 mt-1">منذ ساعة</p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* المساعدة */}
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* حساب المستخدم */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.username || "Admin"}</p>
                      <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {isArabic ? "حسابي" : "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    {isArabic ? "الملف الشخصي" : "Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {isArabic ? "الإعدادات" : "Settings"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isArabic ? "تسجيل الخروج" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <div className="flex">
          {/* القائمة الجانبية */}
          <Sidebar 
            collapsible="icon"
            className={`border-r dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${
              isCollapsed ? 'w-16' : 'w-64'
            }`}
          >
            <SidebarHeader className="p-4">
              <div className="flex items-center justify-between">
                {!isCollapsed && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">AdminPanel</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1"
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <Link href={item.path} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

              {/* قسم سريع */}
              {!isCollapsed && (
                <div className="mt-8 px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {isArabic ? "سريع" : "Quick"}
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      {isArabic ? "مستخدم جديد" : "New User"}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Database className="w-4 h-4 mr-2" />
                      {isArabic ? "نسخ احتياطي" : "Backup"}
                    </Button>
                  </div>
                </div>
              )}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t dark:border-gray-700">
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">نظام الإدارة</p>
                    <p className="text-xs text-gray-500 truncate">v2.0.1</p>
                  </div>
                )}
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* المحتوى الرئيسي */}
          <SidebarInset>
            <main className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Video, 
  TrendingUp,
  Hash,
  Folder,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    newToday: number;
    messages: number;
    videos: number;
    streamings: number;
    challenges: number;
    categories: number;
    stories: number;
  };
  isLoading?: boolean;
  isArabic?: boolean;
}

const statCards = [
  {
    key: 'totalUsers',
    icon: Users,
    labelAr: 'إجمالي المستخدمين',
    labelEn: 'Total Users',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    key: 'newToday',
    icon: UserPlus,
    labelAr: 'مسجل اليوم',
    labelEn: 'New Today',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    key: 'messages',
    icon: MessageSquare,
    labelAr: 'الرسائل',
    labelEn: 'Messages',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    key: 'videos',
    icon: Video,
    labelAr: 'الفيديوهات',
    labelEn: 'Videos',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    key: 'streamings',
    icon: TrendingUp,
    labelAr: 'البث المباشر',
    labelEn: 'Streamings',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    key: 'challenges',
    icon: Hash,
    labelAr: 'التحديات',
    labelEn: 'Challenges',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  },
  {
    key: 'categories',
    icon: Folder,
    labelAr: 'الفئات',
    labelEn: 'Categories',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    key: 'stories',
    icon: Clock,
    labelAr: 'القصص',
    labelEn: 'Stories',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20'
  }
];

export default function StatsCards({ stats, isLoading = false, isArabic = true }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value = stats[stat.key as keyof typeof stats];
        
        return (
          <Card 
            key={stat.key}
            className={cn(
              "border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden",
              stat.bgColor
            )}
          >
            <CardContent className="p-6 relative">
              {/* خلفية زخرفية */}
              <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br ${stat.color} rounded-full -translate-y-8 translate-x-8`} />
              
              {/* المحتوى */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? stat.labelAr : stat.labelEn}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* شريط التقدم */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isArabic ? "التقدم الشهري" : "Monthly Progress"}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(Math.floor(value / 1000 * 100), 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(Math.floor(value / 1000 * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
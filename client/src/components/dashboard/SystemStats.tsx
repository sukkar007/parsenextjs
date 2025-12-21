import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  Shield,
  Clock,
  BarChart3,
  Activity
} from "lucide-react";

interface SystemStatsProps {
  isArabic?: boolean;
}

export default function SystemStats({ isArabic = true }: SystemStatsProps) {
  const stats = [
    {
      icon: Cpu,
      labelAr: "استخدام المعالج",
      labelEn: "CPU Usage",
      value: "24%",
      color: "text-green-500",
      progress: 24
    },
    {
      icon: Database,
      labelAr: "ذاكرة النظام",
      labelEn: "System Memory",
      value: "3.2/8 GB",
      color: "text-blue-500",
      progress: 40
    },
    {
      icon: HardDrive,
      labelAr: "مساحة التخزين",
      labelEn: "Storage",
      value: "45/120 GB",
      color: "text-purple-500",
      progress: 38
    },
    {
      icon: Network,
      labelAr: "سرعة الشبكة",
      labelEn: "Network Speed",
      value: "124 Mbps",
      color: "text-orange-500",
      progress: 62
    },
    {
      icon: Shield,
      labelAr: "حالة الأمان",
      labelEn: "Security Status",
      value: "محمي",
      color: "text-green-500",
      progress: 100
    },
    {
      icon: Clock,
      labelAr: "وقت التشغيل",
      labelEn: "Uptime",
      value: "15 يوم",
      color: "text-teal-500",
      progress: 100
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5" />
          {isArabic ? "إحصائيات النظام" : "System Statistics"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <div key={stat.labelAr} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {isArabic ? stat.labelAr : stat.labelEn}
                  </p>
                  <p className="text-xs text-gray-500">{stat.value}</p>
                </div>
              </div>
              
              <div className="w-24">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full`}
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 block text-right mt-1">
                  {stat.progress}%
                </span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{isArabic ? "آخر تحديث" : "Last Updated"}</span>
            <span className="font-medium">
              {new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: !isArabic 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
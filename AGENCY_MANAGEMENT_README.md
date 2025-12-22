# نظام إدارة الوكالات - Agency Management System

## نظرة عامة

تم إضافة نظام متكامل لإدارة الوكالات في لوحة التحكم، يتيح للمشرفين:
- تعيين وكلاء جدد
- إرسال دعوات للمضيفين للانضمام للوكالات
- إدارة أعضاء الوكالة
- متابعة الإحصائيات والأرباح

---

## الملفات المضافة/المعدلة

### ملفات جديدة:

1. **`client/src/components/AgencyManagement.tsx`**
   - المكون الرئيسي لإدارة الوكالات
   - يحتوي على 3 تبويبات: الوكلاء، المضيفين، الدعوات
   - عرض إحصائيات شاملة
   - فلترة وبحث متقدم

2. **`client/src/components/AssignAgentModal.tsx`**
   - نافذة منبثقة لتعيين وكيل جديد
   - بحث واختيار المستخدمين
   - معاينة المستخدم المحدد

### ملفات معدلة:

1. **`server/routers.ts`**
   - إضافة API endpoints للوكالات:
     - `getAgents` - جلب قائمة الوكلاء
     - `getAgencyMembers` - جلب أعضاء الوكالة
     - `getAgencyInvitations` - جلب الدعوات
     - `sendAgencyInvitation` - إرسال دعوة
     - `updateAgencyInvitation` - قبول/رفض دعوة
     - `removeAgencyMember` - إزالة عضو
     - `updateAgencyMember` - تحديث بيانات عضو
     - `assignAgentRole` - تعيين وكيل
     - `removeAgentRole` - إزالة صلاحية وكيل
     - `getAgencyStats` - إحصائيات الوكالات

2. **`client/src/pages/Dashboard.tsx`**
   - إضافة قسم "إدارة الوكالات" في القائمة الجانبية
   - إضافة استيراد `AgencyManagement` و `Building2`

---

## هيكل قاعدة البيانات

### جدول AgencyMember
```javascript
{
  objectId: string,
  agent_id: string,        // معرف الوكيل
  host_id: string,         // معرف المضيف
  client_status: string,   // joined, left
  level: number,           // 0-5 (مبتدئ - ماسي)
  live_duration: number,   // مدة البث بالدقائق
  party_host_duration: number,
  party_crown_duration: number,
  matching_duration: number,
  total_points_earnings: number,
  live_earnings: number,
  match_earnings: number,
  party_earnings: number,
  game_gratuities: number,
  platform_reward: number,
  p_coin_earnings: number,
  createdAt: Date,
  updatedAt: Date
}
```

### جدول AgencyInvitation
```javascript
{
  objectId: string,
  agent_id: string,           // معرف الوكيل
  host_id: string,            // معرف المضيف المدعو
  invitation_status: string,  // pending, accepted, declined
  createdAt: Date,
  updatedAt: Date
}
```

### حقول المستخدم المتعلقة بالوكالة
```javascript
{
  agency_role: string,    // agent, agency_client, no_agency
  my_agent_id: string,    // معرف الوكيل (للمضيفين)
  diamondsAgency: number,
  diamondsAgencyTotal: number
}
```

---

## الميزات

### 1. إدارة الوكلاء
- عرض قائمة جميع الوكلاء
- عدد الأعضاء لكل وكيل
- إجمالي الماس المكتسب
- تعيين وكيل جديد

### 2. إدارة المضيفين (أعضاء الوكالة)
- عرض جميع المضيفين المنضمين
- حالة العضو (منضم/غادر)
- مستوى العضو (مبتدئ - ماسي)
- إحصائيات الأرباح التفصيلية
- مدة البث والحفلات
- إمكانية تحديث المستوى
- إزالة عضو من الوكالة

### 3. إدارة الدعوات
- عرض جميع الدعوات
- حالة الدعوة (معلقة/مقبولة/مرفوضة)
- قبول أو رفض الدعوات
- إرسال دعوات جديدة

### 4. الإحصائيات
- إجمالي الوكلاء
- إجمالي المضيفين النشطين
- الدعوات المعلقة
- إجمالي الأرباح

---

## سير العمل

### إضافة مضيف لوكالة:
1. الوكيل يرسل دعوة للمضيف
2. الدعوة تظهر بحالة "قيد الانتظار"
3. عند قبول الدعوة:
   - يتم إنشاء سجل في `AgencyMember`
   - يتم تحديث المستخدم بـ `agency_role: "agency_client"` و `my_agent_id`
4. المضيف يصبح جزءاً من الوكالة

### إزالة مضيف:
1. النقر على زر الإزالة
2. تأكيد العملية
3. تحديث حالة العضو إلى "غادر"
4. إزالة معلومات الوكالة من المستخدم

---

## الاستخدام

### الوصول للصفحة:
1. تسجيل الدخول للوحة التحكم
2. من القائمة الجانبية، اختر "إدارة الوكالات" > "الوكالات والوكلاء"

### تعيين وكيل جديد:
1. انقر على زر "تعيين وكيل"
2. ابحث عن المستخدم
3. اختر المستخدم من القائمة
4. انقر "تعيين كوكيل"

### إرسال دعوة:
1. انقر على زر "إضافة مضيف"
2. اختر الوكيل (إذا لم يكن محدداً)
3. اختر المضيف من القائمة
4. انقر "إرسال الدعوة"

---

## التسجيل والمراقبة

جميع العمليات يتم تسجيلها في `SystemLog`:
- إرسال دعوة وكالة
- قبول/رفض دعوة
- إزالة عضو من الوكالة
- تحديث بيانات عضو
- تعيين/إزالة وكيل

---

## التقنيات المستخدمة

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: tRPC + Parse Server
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

---

## ملاحظات للمطورين

1. جميع الـ mutations تستخدم `isPending` بدلاً من `isLoading` (tRPC v11)
2. يتم استخدام `any` type في بعض الأماكن للتوافق مع Parse Server
3. جميع النصوص باللغة العربية مع دعم RTL
4. الواجهة متجاوبة مع جميع أحجام الشاشات

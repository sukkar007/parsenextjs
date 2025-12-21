/**
 * Check if user has admin permission
 */
export function hasAdminPermission(role?: string): boolean {
  if (!role) return false;
  
  const normalizedRole = role.toLowerCase().trim();
  
  return normalizedRole === 'admin' || 
         normalizedRole === 'administrator' || 
         normalizedRole === 'مدير' ||
         normalizedRole === 'مسؤول' ||
         normalizedRole === 'إداري' ||
         normalizedRole.includes('admin');
}

/**
 * Get user permission level
 */
export function getUserPermissionLevel(role?: string): number {
  if (!role) return 0;
  
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === 'admin' || 
      normalizedRole === 'administrator' || 
      normalizedRole === 'مدير' ||
      normalizedRole === 'مسؤول') {
    return 100; // أعلى صلاحية
  }
  
  if (normalizedRole === 'moderator' || 
      normalizedRole === 'مشرف' ||
      normalizedRole.includes('mod')) {
    return 50; // صلاحية متوسطة
  }
  
  return 10; // مستخدم عادي
}
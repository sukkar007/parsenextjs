export type Role = 'admin' | 'editor' | 'viewer';

export interface Permission {
  canViewLogs: boolean;
  canEditUsers: boolean;
  canDeleteData: boolean;
  canManageSettings: boolean;
  allowedMenus: string[];
}

export const ROLE_PERMISSIONS: Record<string, Permission> = {
  admin: {
    canViewLogs: true,
    canEditUsers: true,
    canDeleteData: true,
    canManageSettings: true,
    allowedMenus: ['dashboard', 'users', 'content', 'settings', 'logs', 'messages', 'categories', 'announcements', 'ads'],
  },
  editor: {
    canViewLogs: false,
    canEditUsers: false,
    canDeleteData: false,
    canManageSettings: false,
    allowedMenus: ['dashboard', 'content', 'messages', 'categories', 'announcements', 'ads'],
  },
  viewer: {
    canViewLogs: false,
    canEditUsers: false,
    canDeleteData: false,
    canManageSettings: false,
    allowedMenus: ['dashboard'],
  },
};

export const getPermissions = (role: string = 'viewer'): Permission => {
  const normalizedRole = role.toLowerCase().trim();
  if (normalizedRole.includes('admin')) return ROLE_PERMISSIONS.admin;
  if (normalizedRole === 'editor') return ROLE_PERMISSIONS.editor;
  return ROLE_PERMISSIONS.viewer;
};

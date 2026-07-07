export const ROLE_PERMISSIONS = {
  admin: [
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'sale:create',
    'sale:read',
    'dashboard:read',
    'user:manage',
  ],
  manager: [
    'product:create',
    'product:read',
    'product:update',
    'sale:create',
    'sale:read',
    'dashboard:read',
  ],
  employee: ['product:read', 'sale:create', 'sale:read', 'dashboard:read'],
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[Role][number];

export const roles = Object.keys(ROLE_PERMISSIONS) as Role[];
export const roleRights = new Map<Role, readonly Permission[]>(
  Object.entries(ROLE_PERMISSIONS) as [Role, readonly Permission[]][]
);

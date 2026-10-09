import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Role Definitions
// ============================================================================

export type Role = 'candidate' | 'admin' | 'organization_admin' | 'super_admin';

export interface Permission {
  resource: string;
  actions: string[];
}

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  candidate: [
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'career_graph', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'applications', actions: ['read', 'create', 'update'] },
    { resource: 'jobs', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'update'] },
  ],
  admin: [
    { resource: 'profile', actions: ['read', 'update', 'delete'] },
    { resource: 'career_graph', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'applications', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'jobs', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'organizations', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'audit_logs', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'create', 'update', 'delete'] },
  ],
  organization_admin: [
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'career_graph', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'applications', actions: ['read', 'create', 'update'] },
    { resource: 'jobs', actions: ['read'] },
    { resource: 'organization', actions: ['read', 'update'] },
    { resource: 'cohorts', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'cohort_members', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'update'] },
  ],
  super_admin: [
    { resource: '*', actions: ['*'] }, // Full access to everything
  ],
};

// ============================================================================
// Permission Checking Functions
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role,
  resource: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) {
    return false;
  }

  // Check for wildcard permission (super_admin)
  if (permissions.some(p => p.resource === '*' && p.actions.includes('*'))) {
    return true;
  }

  // Check for specific resource permission
  const permission = permissions.find(p => p.resource === resource);
  if (!permission) {
    return false;
  }

  // Check for wildcard action or specific action
  return permission.actions.includes('*') || permission.actions.includes(action);
}

/**
 * Check if user has permission for a resource
 */
export function userHasPermission(
  user: { role: string },
  resource: string,
  action: string
): boolean {
  return hasPermission(user.role as Role, resource, action);
}

// ============================================================================
// RBAC Middleware
// ============================================================================

/**
 * Middleware to require specific permission
 */
export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!userHasPermission(req.user, resource, action)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
        role: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({
        error: 'Insufficient role',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require any of the specified permissions
 */
export function requireAnyPermission(permissions: Array<{ resource: string; action: string }>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasAnyPermission = permissions.some(p =>
      userHasPermission(req.user, p.resource, p.action)
    );

    if (!hasAnyPermission) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        role: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require all of the specified permissions
 */
export function requireAllPermissions(permissions: Array<{ resource: string; action: string }>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasAllPermissions = permissions.every(p =>
      userHasPermission(req.user, p.resource, p.action)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        role: req.user.role,
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is admin-level
 */
export function isAdminRole(role: Role): boolean {
  return ['admin', 'super_admin', 'organization_admin'].includes(role);
}

/**
 * Check if role can manage users
 */
export function canManageUsers(role: Role): boolean {
  return hasPermission(role, 'users', 'create');
}

/**
 * Check if role can view audit logs
 */
export function canViewAuditLogs(role: Role): boolean {
  return hasPermission(role, 'audit_logs', 'read');
}

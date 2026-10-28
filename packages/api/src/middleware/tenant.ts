import type { NextFunction, Request, Response } from 'express';

// ============================================================================
// Tenant Isolation Middleware
// ============================================================================

/**
 * Ensures that users can only access data within their own tenant.
 * This middleware must be used AFTER authenticate middleware.
 */
export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Check every supplied source; a matching header must not mask a different
  // tenant in a route parameter or request body.
  const requestedTenantIds = [req.headers['x-tenant-id'], req.params.tenantId, req.body?.tenantId];
  if (
    req.user.role !== 'super_admin' &&
    requestedTenantIds.some((id) => id != null && id !== req.user?.tenantId)
  ) {
    res.status(403).json({ error: 'Access denied to this tenant' });
    return;
  }

  next();
}

/**
 * Adds tenant filter to database queries.
 * Use this to ensure queries only return data for the current tenant.
 */
export function getTenantFilter(req: Request): { tenantId: string } {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  return { tenantId: req.user.tenantId };
}

/**
 * Validates that a resource belongs to the current tenant.
 */
export function validateResourceOwnership<T extends { tenantId: string }>(
  req: Request,
  resource: T
): boolean {
  if (!req.user) {
    return false;
  }

  // Super admins can access any resource
  if (req.user.role === 'super_admin') {
    return true;
  }

  // Check if resource belongs to user's tenant
  return resource.tenantId === req.user.tenantId;
}

/**
 * Middleware to enforce tenant isolation on all routes.
 * Route handlers must apply the attached filter to their database queries.
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Attach tenant filter to request for use in route handlers
  req.tenantFilter = getTenantFilter(req);

  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantFilter?: { tenantId: string };
    }
  }
}

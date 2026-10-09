import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requirePermission, requireRole, hasPermission } from './rbac';

describe('RBAC Middleware', () => {
  describe('hasPermission', () => {
    it('should return true for candidate with profile:read permission', () => {
      expect(hasPermission('candidate', 'profile', 'read')).toBe(true);
    });

    it('should return true for candidate with career_graph:create permission', () => {
      expect(hasPermission('candidate', 'career_graph', 'create')).toBe(true);
    });

    it('should return false for candidate with users:delete permission', () => {
      expect(hasPermission('candidate', 'users', 'delete')).toBe(false);
    });

    it('should return true for admin with users:delete permission', () => {
      expect(hasPermission('admin', 'users', 'delete')).toBe(true);
    });

    it('should return true for super_admin with any permission', () => {
      expect(hasPermission('super_admin', 'anything', 'anywhere')).toBe(true);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid_role' as any, 'profile', 'read')).toBe(false);
    });
  });

  describe('requirePermission middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        user: {
          id: 'user-1',
          tenantId: 'tenant-1',
          email: 'test@example.com',
          role: 'candidate',
        },
      };
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      next = vi.fn();
    });

    it('should call next() if user has permission', () => {
      const middleware = requirePermission('profile', 'read');
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user lacks permission', () => {
      const middleware = requirePermission('users', 'delete');
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: 'users:delete',
        role: 'candidate',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      req.user = undefined;
      const middleware = requirePermission('profile', 'read');
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        user: {
          id: 'user-1',
          tenantId: 'tenant-1',
          email: 'test@example.com',
          role: 'candidate',
        },
      };
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      next = vi.fn();
    });

    it('should call next() if user has required role', () => {
      const middleware = requireRole('candidate', 'admin');
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user lacks required role', () => {
      const middleware = requireRole('admin', 'super_admin');
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient role',
        required: ['admin', 'super_admin'],
        current: 'candidate',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      req.user = undefined;
      const middleware = requireRole('candidate');
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

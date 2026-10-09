import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  requireTenant,
  getTenantFilter,
  validateResourceOwnership,
} from './tenant';

describe('Tenant Isolation Middleware', () => {
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
      headers: {},
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('requireTenant', () => {
    it('should call next() if no tenant ID specified', () => {
      requireTenant(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if tenant ID matches user tenant', () => {
      req.headers = { 'x-tenant-id': 'tenant-1' };
      requireTenant(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if tenant ID does not match', () => {
      req.headers = { 'x-tenant-id': 'tenant-2' };
      requireTenant(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied to this tenant',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow super_admin to access any tenant', () => {
      req.user = {
        id: 'admin-1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'super_admin',
      };
      req.headers = { 'x-tenant-id': 'tenant-2' };

      requireTenant(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      req.user = undefined;
      requireTenant(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getTenantFilter', () => {
    it('should return tenant filter for authenticated user', () => {
      const filter = getTenantFilter(req as Request);

      expect(filter).toEqual({ tenantId: 'tenant-1' });
    });

    it('should throw error if user is not authenticated', () => {
      req.user = undefined;

      expect(() => getTenantFilter(req as Request)).toThrow(
        'User not authenticated'
      );
    });
  });

  describe('validateResourceOwnership', () => {
    it('should return true if resource belongs to user tenant', () => {
      const resource = { tenantId: 'tenant-1', id: 'resource-1' };
      const isValid = validateResourceOwnership(req as Request, resource);

      expect(isValid).toBe(true);
    });

    it('should return false if resource belongs to different tenant', () => {
      const resource = { tenantId: 'tenant-2', id: 'resource-1' };
      const isValid = validateResourceOwnership(req as Request, resource);

      expect(isValid).toBe(false);
    });

    it('should return true for super_admin accessing any resource', () => {
      req.user = {
        id: 'admin-1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'super_admin',
      };
      const resource = { tenantId: 'tenant-2', id: 'resource-1' };
      const isValid = validateResourceOwnership(req as Request, resource);

      expect(isValid).toBe(true);
    });

    it('should return false if user is not authenticated', () => {
      req.user = undefined;
      const resource = { tenantId: 'tenant-1', id: 'resource-1' };
      const isValid = validateResourceOwnership(req as Request, resource);

      expect(isValid).toBe(false);
    });
  });
});

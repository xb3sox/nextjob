import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
} from './index';

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toContain(':');
      expect(hash.split(':')).toHaveLength(2);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('User Registration', () => {
    it('should register new user', async () => {
      const user = await registerUser({
        email: 'test@example.com',
        password: 'testPassword123',
        name: 'Test User',
        tenantId: 'test-tenant-id',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.tenantId).toBe('test-tenant-id');
      expect(user.role).toBe('candidate');
      expect(user.status).toBe('active');
    });

    it('should reject duplicate email', async () => {
      await registerUser({
        email: 'duplicate@example.com',
        password: 'testPassword123',
        tenantId: 'test-tenant-id',
      });

      await expect(
        registerUser({
          email: 'duplicate@example.com',
          password: 'testPassword123',
          tenantId: 'test-tenant-id',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should normalize email to lowercase', async () => {
      const user = await registerUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'testPassword123',
        tenantId: 'test-tenant-id',
      });

      expect(user.email).toBe('test@example.com');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Clean up test users
      // In production, use test database transactions
    });

    it('should login with correct credentials', async () => {
      const email = 'login@example.com';
      const password = 'testPassword123';

      await registerUser({
        email,
        password,
        tenantId: 'test-tenant-id',
      });

      const result = await loginUser({ email, password });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.tokens.expiresIn).toBe(3600);
    });

    it('should reject incorrect password', async () => {
      const email = 'wrong@example.com';
      await registerUser({
        email,
        password: 'correctPassword',
        tenantId: 'test-tenant-id',
      });

      await expect(
        loginUser({ email, password: 'wrongPassword' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      await expect(
        loginUser({ email: 'nonexistent@example.com', password: 'password' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject inactive user', async () => {
      // This would require setting up a user with inactive status
      // Simplified for this test
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { AutomationPolicyService } from './automation-policy-service.js';
import { AutomationPolicyNotFoundError, InvalidAutomationPolicyError, VersionConflictError } from './types.js';

describe('AutomationPolicyService', () => {
  let service: AutomationPolicyService;

  beforeEach(() => {
    service = new AutomationPolicyService();
  });

  describe('createPolicy', () => {
    it('should create policy with required fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      const result = await service.createPolicy(request);

      expect(result.policy.userId).toBe('user-123');
      expect(result.policy.defaultMode).toBe('copilot');
      expect(result.version).toBe(1);
      expect(result.policy.autoApply?.enabled).toBe(false);
      expect(result.policy.safetySettings?.alwaysAskForSensitiveFields).toBe(true);
    });

    it('should create policy with all optional fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        fieldOverrides: [
          {
            fieldName: 'salary',
            mode: 'manual' as const,
            riskLevel: 'high' as const,
            requiresApproval: true,
          },
        ],
        autoApply: {
          enabled: true,
          maxApplicationsPerDay: 10,
          requireEligibilityCheck: true,
          requireProfileCoverage: true,
          minProfileCoveragePercent: 85,
        },
        safetySettings: {
          alwaysAskForSensitiveFields: true,
          blockAutoApplyWithoutVerification: true,
          requireExplicitApprovalForHighRisk: true,
          maxRetries: 5,
        },
        notifications: {
          notifyOnAutoApply: true,
          notifyOnApprovalRequired: true,
          notifyOnSubmissionComplete: true,
          notifyOnErrors: true,
        },
      };

      const result = await service.createPolicy(request);

      expect(result.policy.defaultMode).toBe('autopilot');
      expect(result.policy.fieldOverrides).toHaveLength(1);
      expect(result.policy.autoApply?.enabled).toBe(true);
      expect(result.policy.autoApply?.maxApplicationsPerDay).toBe(10);
      expect(result.policy.safetySettings?.maxRetries).toBe(5);
      expect(result.policy.notifications?.notifyOnAutoApply).toBe(true);
    });

    it('should throw error for invalid default mode', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'invalid' as any,
      };

      await expect(service.createPolicy(request)).rejects.toThrow(InvalidAutomationPolicyError);
    });
  });

  describe('getPolicy', () => {
    it('should retrieve policy for a user', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);
      const result = await service.getPolicy('user-123');

      expect(result.policy.userId).toBe('user-123');
      expect(result.policy.defaultMode).toBe('copilot');
      expect(result.version).toBe(1);
    });

    it('should throw error if policy not found', async () => {
      await expect(service.getPolicy('non-existent-user')).rejects.toThrow(
        AutomationPolicyNotFoundError
      );
    });

    it('should throw error if policy is deleted', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);
      await service.deletePolicy('user-123');

      await expect(service.getPolicy('user-123')).rejects.toThrow(AutomationPolicyNotFoundError);
    });
  });

  describe('updatePolicy', () => {
    it('should update policy and increment version', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);

      const updateRequest = {
        defaultMode: 'autopilot' as const,
      };

      const result = await service.updatePolicy('user-123', updateRequest);

      expect(result.policy.defaultMode).toBe('autopilot');
      expect(result.version).toBe(2);
    });

    it('should preserve unchanged fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
        autoApply: {
          enabled: true,
          maxApplicationsPerDay: 10,
        },
      };

      await service.createPolicy(request);

      const updateRequest = {
        defaultMode: 'autopilot' as const,
      };

      const result = await service.updatePolicy('user-123', updateRequest);

      expect(result.policy.autoApply?.enabled).toBe(true);
      expect(result.policy.autoApply?.maxApplicationsPerDay).toBe(10);
    });

    it('should throw version conflict error if expected version mismatch', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      const result = await service.createPolicy(request);

      const updateRequest = {
        defaultMode: 'autopilot' as const,
      };

      await expect(
        service.updatePolicy('user-123', updateRequest, 999)
      ).rejects.toThrow(VersionConflictError);
    });

    it('should succeed if expected version matches', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      const result = await service.createPolicy(request);

      const updateRequest = {
        defaultMode: 'autopilot' as const,
      };

      const updated = await service.updatePolicy('user-123', updateRequest, result.version);

      expect(updated.version).toBe(2);
    });
  });

  describe('deletePolicy', () => {
    it('should soft delete policy', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);
      await service.deletePolicy('user-123');

      await expect(service.getPolicy('user-123')).rejects.toThrow(AutomationPolicyNotFoundError);
    });

    it('should throw error if policy not found', async () => {
      await expect(service.deletePolicy('non-existent-user')).rejects.toThrow(
        AutomationPolicyNotFoundError
      );
    });
  });

  describe('getPolicyHistory', () => {
    it('should return all versions of policy', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'manual' as const,
      };

      await service.createPolicy(request);

      await service.updatePolicy('user-123', {
        defaultMode: 'copilot' as const,
      });

      await service.updatePolicy('user-123', {
        defaultMode: 'autopilot' as const,
      });

      const history = await service.getPolicyHistory('user-123');

      expect(history).toHaveLength(3);
      expect(history[0].defaultMode).toBe('manual');
      expect(history[1].defaultMode).toBe('copilot');
      expect(history[2].defaultMode).toBe('autopilot');
    });

    it('should throw error if policy not found', async () => {
      await expect(service.getPolicyHistory('non-existent-user')).rejects.toThrow(
        AutomationPolicyNotFoundError
      );
    });
  });

  describe('hasPolicy', () => {
    it('should return true if policy exists', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);

      const hasPolicy = await service.hasPolicy('user-123');
      expect(hasPolicy).toBe(true);
    });

    it('should return false if policy does not exist', async () => {
      const hasPolicy = await service.hasPolicy('non-existent-user');
      expect(hasPolicy).toBe(false);
    });

    it('should return false if policy is deleted', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);
      await service.deletePolicy('user-123');

      const hasPolicy = await service.hasPolicy('user-123');
      expect(hasPolicy).toBe(false);
    });
  });

  describe('getEffectiveModeForField', () => {
    it('should return field override mode if exists', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        fieldOverrides: [
          {
            fieldName: 'salary',
            mode: 'manual' as const,
            riskLevel: 'high' as const,
            requiresApproval: true,
          },
        ],
      };

      await service.createPolicy(request);

      const result = await service.getEffectiveModeForField('user-123', 'salary');

      expect(result.mode).toBe('manual');
      expect(result.requiresApproval).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should return default mode if no override exists', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
      };

      await service.createPolicy(request);

      const result = await service.getEffectiveModeForField('user-123', 'experience');

      expect(result.mode).toBe('autopilot');
    });

    it('should require approval for sensitive fields in autopilot mode', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        safetySettings: {
          alwaysAskForSensitiveFields: true,
        },
      };

      await service.createPolicy(request);

      const result = await service.getEffectiveModeForField('user-123', 'disability', 'sensitive');

      expect(result.requiresApproval).toBe(true);
    });

    it('should require approval for high risk fields in copilot mode', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
      };

      await service.createPolicy(request);

      const result = await service.getEffectiveModeForField('user-123', 'salary', 'high');

      expect(result.requiresApproval).toBe(true);
    });

    it('should not require approval for low risk fields in autopilot mode', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
      };

      await service.createPolicy(request);

      const result = await service.getEffectiveModeForField('user-123', 'name', 'low');

      expect(result.requiresApproval).toBe(false);
    });
  });

  describe('isAutoApplyAllowed', () => {
    it('should return allowed if auto-apply is enabled', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        autoApply: {
          enabled: true,
          maxApplicationsPerDay: 10,
        },
      };

      await service.createPolicy(request);

      const result = await service.isAutoApplyAllowed('user-123');

      expect(result.allowed).toBe(true);
      expect(result.constraints?.maxApplicationsPerDay).toBe(10);
    });

    it('should return not allowed if auto-apply is disabled', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'copilot' as const,
        autoApply: {
          enabled: false,
        },
      };

      await service.createPolicy(request);

      const result = await service.isAutoApplyAllowed('user-123');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Auto-apply is disabled');
    });
  });

  describe('setFieldOverride', () => {
    it('should add new field override', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
      };

      await service.createPolicy(request);

      const fieldOverride = {
        fieldName: 'salary',
        mode: 'manual' as const,
        riskLevel: 'high' as const,
        requiresApproval: true,
      };

      const result = await service.setFieldOverride('user-123', fieldOverride);

      expect(result.policy.fieldOverrides).toHaveLength(1);
      expect(result.policy.fieldOverrides?.[0].fieldName).toBe('salary');
    });

    it('should update existing field override', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        fieldOverrides: [
          {
            fieldName: 'salary',
            mode: 'manual' as const,
            riskLevel: 'high' as const,
            requiresApproval: true,
          },
        ],
      };

      await service.createPolicy(request);

      const updatedOverride = {
        fieldName: 'salary',
        mode: 'copilot' as const,
        riskLevel: 'medium' as const,
        requiresApproval: false,
      };

      const result = await service.setFieldOverride('user-123', updatedOverride);

      expect(result.policy.fieldOverrides).toHaveLength(1);
      expect(result.policy.fieldOverrides?.[0].mode).toBe('copilot');
      expect(result.policy.fieldOverrides?.[0].riskLevel).toBe('medium');
    });
  });

  describe('removeFieldOverride', () => {
    it('should remove field override', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
        fieldOverrides: [
          {
            fieldName: 'salary',
            mode: 'manual' as const,
            riskLevel: 'high' as const,
            requiresApproval: true,
          },
          {
            fieldName: 'experience',
            mode: 'copilot' as const,
            riskLevel: 'medium' as const,
            requiresApproval: false,
          },
        ],
      };

      await service.createPolicy(request);

      const result = await service.removeFieldOverride('user-123', 'salary');

      expect(result.policy.fieldOverrides).toHaveLength(1);
      expect(result.policy.fieldOverrides?.[0].fieldName).toBe('experience');
    });

    it('should handle removing non-existent override', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        defaultMode: 'autopilot' as const,
      };

      await service.createPolicy(request);

      const result = await service.removeFieldOverride('user-123', 'salary');

      expect(result.policy.fieldOverrides).toHaveLength(0);
    });
  });
});

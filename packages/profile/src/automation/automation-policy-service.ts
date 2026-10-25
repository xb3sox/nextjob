import { v4 as uuidv4 } from 'uuid';
import {
  type AutomationMode,
  type AutomationPolicy,
  AutomationPolicyNotFoundError,
  type AutomationPolicyResponse,
  AutomationPolicySchema,
  type CreateAutomationPolicyRequest,
  type FieldOverride,
  InvalidAutomationPolicyError,
  type UpdateAutomationPolicyRequest,
  VersionConflictError,
} from './types.js';

// ============================================================================
// Settings merging
// ============================================================================

type AutoApplySettings = NonNullable<AutomationPolicy['autoApply']>;
type SafetySettings = NonNullable<AutomationPolicy['safetySettings']>;
type NotificationSettings = NonNullable<AutomationPolicy['notifications']>;
type AutoApplyPatch = NonNullable<UpdateAutomationPolicyRequest['autoApply']>;
type SafetySettingsPatch = NonNullable<UpdateAutomationPolicyRequest['safetySettings']>;
type NotificationsPatch = NonNullable<UpdateAutomationPolicyRequest['notifications']>;

// Defaults mirror `AutomationPolicySchema`; used only when the stored policy
// has no value for the section (Zod would apply the same defaults on parse).
const DEFAULT_AUTO_APPLY: AutoApplySettings = {
  enabled: false,
  requireEligibilityCheck: true,
  requireProfileCoverage: true,
  minProfileCoveragePercent: 80,
};

const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  alwaysAskForSensitiveFields: true,
  blockAutoApplyWithoutVerification: true,
  requireExplicitApprovalForHighRisk: true,
  maxRetries: 3,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  notifyOnAutoApply: true,
  notifyOnApprovalRequired: true,
  notifyOnSubmissionComplete: true,
  notifyOnErrors: true,
};

/**
 * Merges a partial auto-apply patch over the current settings, keeping the
 * required shape intact (an optional patch field cannot clear a required one).
 */
function mergeAutoApply(
  current: AutoApplySettings | undefined,
  patch: AutoApplyPatch | undefined
): AutoApplySettings {
  const base = current ?? DEFAULT_AUTO_APPLY;
  if (!patch) {
    return base;
  }

  return {
    enabled: patch.enabled ?? base.enabled,
    maxApplicationsPerDay: patch.maxApplicationsPerDay ?? base.maxApplicationsPerDay,
    requireEligibilityCheck: patch.requireEligibilityCheck ?? base.requireEligibilityCheck,
    requireProfileCoverage: patch.requireProfileCoverage ?? base.requireProfileCoverage,
    minProfileCoveragePercent: patch.minProfileCoveragePercent ?? base.minProfileCoveragePercent,
  };
}

/**
 * Merges a partial safety-settings patch over the current settings.
 */
function mergeSafetySettings(
  current: SafetySettings | undefined,
  patch: SafetySettingsPatch | undefined
): SafetySettings {
  const base = current ?? DEFAULT_SAFETY_SETTINGS;
  if (!patch) {
    return base;
  }

  return {
    alwaysAskForSensitiveFields:
      patch.alwaysAskForSensitiveFields ?? base.alwaysAskForSensitiveFields,
    blockAutoApplyWithoutVerification:
      patch.blockAutoApplyWithoutVerification ?? base.blockAutoApplyWithoutVerification,
    requireExplicitApprovalForHighRisk:
      patch.requireExplicitApprovalForHighRisk ?? base.requireExplicitApprovalForHighRisk,
    maxRetries: patch.maxRetries ?? base.maxRetries,
  };
}

/**
 * Merges a partial notification-settings patch over the current settings.
 */
function mergeNotifications(
  current: NotificationSettings | undefined,
  patch: NotificationsPatch | undefined
): NotificationSettings {
  const base = current ?? DEFAULT_NOTIFICATIONS;
  if (!patch) {
    return base;
  }

  return {
    notifyOnAutoApply: patch.notifyOnAutoApply ?? base.notifyOnAutoApply,
    notifyOnApprovalRequired: patch.notifyOnApprovalRequired ?? base.notifyOnApprovalRequired,
    notifyOnSubmissionComplete: patch.notifyOnSubmissionComplete ?? base.notifyOnSubmissionComplete,
    notifyOnErrors: patch.notifyOnErrors ?? base.notifyOnErrors,
  };
}

// ============================================================================
// Automation Policy Service
// ============================================================================

/**
 * Service for managing automation policies
 */
export class AutomationPolicyService {
  // In-memory storage (replace with database in production)
  private policiesStore: Map<string, AutomationPolicy> = new Map();

  /**
   * Create new automation policy for a user
   */
  async createPolicy(request: CreateAutomationPolicyRequest): Promise<AutomationPolicyResponse> {
    const now = new Date().toISOString();
    const policyId = uuidv4();

    const policy: AutomationPolicy = {
      id: policyId,
      userId: request.userId,
      tenantId: request.tenantId,
      defaultMode: request.defaultMode,
      fieldOverrides: request.fieldOverrides || [],
      autoApply: {
        enabled: request.autoApply?.enabled || false,
        maxApplicationsPerDay: request.autoApply?.maxApplicationsPerDay,
        requireEligibilityCheck: request.autoApply?.requireEligibilityCheck ?? true,
        requireProfileCoverage: request.autoApply?.requireProfileCoverage ?? true,
        minProfileCoveragePercent: request.autoApply?.minProfileCoveragePercent ?? 80,
      },
      safetySettings: {
        alwaysAskForSensitiveFields: request.safetySettings?.alwaysAskForSensitiveFields ?? true,
        blockAutoApplyWithoutVerification:
          request.safetySettings?.blockAutoApplyWithoutVerification ?? true,
        requireExplicitApprovalForHighRisk:
          request.safetySettings?.requireExplicitApprovalForHighRisk ?? true,
        maxRetries: request.safetySettings?.maxRetries ?? 3,
      },
      notifications: {
        notifyOnAutoApply: request.notifications?.notifyOnAutoApply ?? true,
        notifyOnApprovalRequired: request.notifications?.notifyOnApprovalRequired ?? true,
        notifyOnSubmissionComplete: request.notifications?.notifyOnSubmissionComplete ?? true,
        notifyOnErrors: request.notifications?.notifyOnErrors ?? true,
      },
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      updatedBy: request.userId,
      deleted: false,
    };

    // Validate policy
    const validatedPolicy = this.validatePolicy(policy);

    // Store policy
    this.policiesStore.set(request.userId, validatedPolicy);
    this.policiesStore.set(policyId, validatedPolicy);

    return {
      policy: validatedPolicy,
      version: validatedPolicy.version,
      createdAt: validatedPolicy.createdAt,
      updatedAt: validatedPolicy.updatedAt,
    };
  }

  /**
   * Get automation policy for a user
   */
  async getPolicy(userId: string): Promise<AutomationPolicyResponse> {
    const policy = this.policiesStore.get(userId);

    if (!policy || policy.deleted) {
      throw new AutomationPolicyNotFoundError(userId);
    }

    return {
      policy,
      version: policy.version,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }

  /**
   * Update automation policy (creates new version)
   */
  async updatePolicy(
    userId: string,
    request: UpdateAutomationPolicyRequest,
    expectedVersion?: number
  ): Promise<AutomationPolicyResponse> {
    const currentPolicy = await this.getPolicy(userId);

    // Check version conflict if expected version provided
    if (expectedVersion !== undefined && currentPolicy.version !== expectedVersion) {
      throw new VersionConflictError(currentPolicy.version, expectedVersion);
    }

    const now = new Date().toISOString();
    const newPolicyId = uuidv4();

    // Merge updates with current policy
    const updatedPolicy: AutomationPolicy = {
      ...currentPolicy.policy,
      id: newPolicyId,
      previousVersionId: currentPolicy.policy.id,
      version: currentPolicy.version + 1,
      defaultMode: request.defaultMode ?? currentPolicy.policy.defaultMode,
      fieldOverrides: request.fieldOverrides ?? currentPolicy.policy.fieldOverrides,
      autoApply: mergeAutoApply(currentPolicy.policy.autoApply, request.autoApply),
      safetySettings: mergeSafetySettings(
        currentPolicy.policy.safetySettings,
        request.safetySettings
      ),
      notifications: mergeNotifications(currentPolicy.policy.notifications, request.notifications),
      updatedAt: now,
      updatedBy: userId,
    };

    // Validate updated policy
    const validatedPolicy = this.validatePolicy(updatedPolicy);

    // Store updated policy
    this.policiesStore.set(userId, validatedPolicy);
    this.policiesStore.set(newPolicyId, validatedPolicy);
    this.policiesStore.set(currentPolicy.policy.id, currentPolicy.policy);

    return {
      policy: validatedPolicy,
      version: validatedPolicy.version,
      createdAt: validatedPolicy.createdAt,
      updatedAt: validatedPolicy.updatedAt,
    };
  }

  /**
   * Delete automation policy (soft delete)
   */
  async deletePolicy(userId: string): Promise<void> {
    const policy = this.policiesStore.get(userId);

    if (!policy || policy.deleted) {
      throw new AutomationPolicyNotFoundError(userId);
    }

    const now = new Date().toISOString();
    policy.deleted = true;
    policy.deletedAt = now;
    policy.updatedAt = now;
    policy.updatedBy = userId;

    this.policiesStore.set(userId, policy);
  }

  /**
   * Get policy history (all versions)
   */
  async getPolicyHistory(userId: string): Promise<AutomationPolicy[]> {
    const currentPolicy = this.policiesStore.get(userId);

    if (!currentPolicy || currentPolicy.deleted) {
      throw new AutomationPolicyNotFoundError(userId);
    }

    const history: AutomationPolicy[] = [currentPolicy];

    // Traverse previous versions
    let current = currentPolicy;
    while (current.previousVersionId) {
      const previous = this.policiesStore.get(current.previousVersionId);
      if (!previous) break;

      history.unshift(previous);
      current = previous;
    }

    return history;
  }

  /**
   * Check if policy exists for a user
   */
  async hasPolicy(userId: string): Promise<boolean> {
    const policy = this.policiesStore.get(userId);
    return policy !== undefined && !policy.deleted;
  }

  /**
   * Get effective mode for a specific field
   */
  async getEffectiveModeForField(
    userId: string,
    fieldName: string,
    defaultRiskLevel: 'low' | 'medium' | 'high' | 'sensitive' = 'low'
  ): Promise<{
    mode: AutomationMode;
    requiresApproval: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'sensitive';
  }> {
    const policyResponse = await this.getPolicy(userId);
    const policy = policyResponse.policy;

    // Check if there's a field-specific override
    const fieldOverride = policy.fieldOverrides?.find(
      (override) => override.fieldName === fieldName
    );

    if (fieldOverride) {
      return {
        mode: fieldOverride.mode,
        requiresApproval: fieldOverride.requiresApproval,
        riskLevel: fieldOverride.riskLevel,
      };
    }

    // No override, use default mode with risk-based approval
    const requiresApproval = this.shouldRequireApproval(
      policy.defaultMode,
      defaultRiskLevel,
      policy.safetySettings
    );

    return {
      mode: policy.defaultMode,
      requiresApproval,
      riskLevel: defaultRiskLevel,
    };
  }

  /**
   * Check if auto-apply is allowed for a user
   */
  async isAutoApplyAllowed(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    constraints?: {
      maxApplicationsPerDay?: number;
      requireEligibilityCheck: boolean;
      requireProfileCoverage: boolean;
      minProfileCoveragePercent: number;
    };
  }> {
    const policyResponse = await this.getPolicy(userId);
    const policy = policyResponse.policy;

    if (!policy.autoApply?.enabled) {
      return {
        allowed: false,
        reason: 'Auto-apply is disabled',
      };
    }

    return {
      allowed: true,
      constraints: {
        maxApplicationsPerDay: policy.autoApply.maxApplicationsPerDay,
        requireEligibilityCheck: policy.autoApply.requireEligibilityCheck,
        requireProfileCoverage: policy.autoApply.requireProfileCoverage,
        minProfileCoveragePercent: policy.autoApply.minProfileCoveragePercent,
      },
    };
  }

  /**
   * Add or update a field override
   */
  async setFieldOverride(
    userId: string,
    fieldOverride: FieldOverride
  ): Promise<AutomationPolicyResponse> {
    const policyResponse = await this.getPolicy(userId);
    const policy = policyResponse.policy;

    // Remove existing override for this field if it exists
    const existingOverrides = policy.fieldOverrides || [];
    const filteredOverrides = existingOverrides.filter(
      (override) => override.fieldName !== fieldOverride.fieldName
    );

    // Add new override
    const updatedOverrides = [...filteredOverrides, fieldOverride];

    // Update policy
    return this.updatePolicy(userId, {
      fieldOverrides: updatedOverrides,
    });
  }

  /**
   * Remove a field override
   */
  async removeFieldOverride(userId: string, fieldName: string): Promise<AutomationPolicyResponse> {
    const policyResponse = await this.getPolicy(userId);
    const policy = policyResponse.policy;

    // Remove override for this field
    const existingOverrides = policy.fieldOverrides || [];
    const updatedOverrides = existingOverrides.filter(
      (override) => override.fieldName !== fieldName
    );

    // Update policy
    return this.updatePolicy(userId, {
      fieldOverrides: updatedOverrides,
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate policy data
   */
  private validatePolicy(policy: AutomationPolicy): AutomationPolicy {
    try {
      return AutomationPolicySchema.parse(policy);
    } catch (error) {
      throw new InvalidAutomationPolicyError(error);
    }
  }

  /**
   * Determine if approval is required based on mode and risk level
   */
  private shouldRequireApproval(
    mode: AutomationMode,
    riskLevel: 'low' | 'medium' | 'high' | 'sensitive',
    safetySettings?: AutomationPolicy['safetySettings']
  ): boolean {
    // Manual mode always requires approval
    if (mode === 'manual') {
      return true;
    }

    // Copilot mode requires approval for high and sensitive fields
    if (mode === 'copilot') {
      return riskLevel === 'high' || riskLevel === 'sensitive';
    }

    // Autopilot mode
    if (mode === 'autopilot') {
      // Always ask for sensitive fields if configured
      if (safetySettings?.alwaysAskForSensitiveFields && riskLevel === 'sensitive') {
        return true;
      }

      // Require explicit approval for high risk if configured
      if (safetySettings?.requireExplicitApprovalForHighRisk && riskLevel === 'high') {
        return true;
      }

      // Low and medium risk fields can be auto-filled
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const automationPolicyService = new AutomationPolicyService();

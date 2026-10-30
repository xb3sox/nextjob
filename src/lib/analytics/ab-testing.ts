import type { ExperimentConfig } from './types';

const STORAGE_PREFIX = 'nextjob_ab_';

/**
 * Gets or assigns a variant for a given experiment.
 * Persists the assignment in storage for session consistency.
 */
export function getExperimentVariant(config: ExperimentConfig, storage?: Storage): string {
  const store = storage || (typeof window !== 'undefined' ? window.sessionStorage : undefined);
  const storageKey = `${STORAGE_PREFIX}${config.id}`;

  if (store) {
    const existing = store.getItem(storageKey);
    if (existing && config.variants.includes(existing)) {
      return existing;
    }
  }

  // Random deterministic assignment between configured variants
  const randomIndex = Math.floor(Math.random() * config.variants.length);
  const assigned = config.variants[randomIndex] || config.defaultVariant;

  if (store) {
    try {
      store.setItem(storageKey, assigned);
    } catch {
      // Storage unavailable or disabled
    }
  }

  return assigned;
}

export const HERO_COPY_EXPERIMENT: ExperimentConfig = {
  id: 'hero_copy',
  variants: ['control', 'variant_direct'],
  defaultVariant: 'control',
};

export const CTA_PLACEMENT_EXPERIMENT: ExperimentConfig = {
  id: 'cta_placement',
  variants: ['control', 'variant_sticky'],
  defaultVariant: 'control',
};

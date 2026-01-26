/**
 * ============================================================================
 * LICENSE TIER MODEL
 * ============================================================================
 * 
 * Defines license tiers for product differentiation.
 * Currently all features are available (Pro tier active).
 * Future payment integration will activate tier-based restrictions.
 * 
 * Design Decisions:
 * - Free tier: Basic scanning with limited features
 * - Pro tier: Full feature set including CI mode, advanced grouping
 * - Infrastructure ready, payment integration TBD
 */

/**
 * License tiers available.
 */
export enum LicenseTier {
  /** Free tier with basic features */
  FREE = 'free',
  
  /** Pro tier with all features (currently default) */
  PRO = 'pro',
}

/**
 * Features available per tier.
 */
export interface TierFeatures {
  /** Maximum number of rules that can be executed */
  readonly maxRules: number;
  
  /** Whether CI mode (enhanced JSON output) is available */
  readonly ciMode: boolean;
  
  /** Whether grouped violations are available */
  readonly groupedViolations: boolean;
  
  /** Whether verbose mode is available */
  readonly verboseMode: boolean;
  
  /** Maximum number of files that can be scanned */
  readonly maxFiles: number;
}

/**
 * Feature set for each tier.
 */
export const TIER_FEATURES: Readonly<Record<LicenseTier, TierFeatures>> = {
  [LicenseTier.FREE]: {
    maxRules: 5,
    ciMode: false,
    groupedViolations: false,
    verboseMode: false,
    maxFiles: 10,
  },
  [LicenseTier.PRO]: {
    maxRules: Number.POSITIVE_INFINITY,
    ciMode: true,
    groupedViolations: true,
    verboseMode: true,
    maxFiles: Number.POSITIVE_INFINITY,
  },
} as const;

/**
 * Gets the active license tier.
 * Currently defaults to PRO (all features enabled).
 * Future: Will check license key or environment variable.
 * 
 * @returns Active license tier
 */
export function getActiveTier(): LicenseTier {
  // TODO: Check license key or environment variable
  // For now, always return PRO (all features available)
  return LicenseTier.PRO;
}

/**
 * Gets features for the active tier.
 * 
 * @returns Available features
 */
export function getActiveTierFeatures(): TierFeatures {
  const tier = getActiveTier();
  return TIER_FEATURES[tier];
}

/**
 * Checks if a feature is available in the active tier.
 * 
 * @param feature - Feature name to check
 * @returns True if feature is available
 */
export function isFeatureAvailable(feature: keyof TierFeatures): boolean {
  const features = getActiveTierFeatures();
  
  if (feature === 'maxRules' || feature === 'maxFiles') {
    return true; // Numeric limits checked separately
  }
  
  return features[feature] as boolean;
}

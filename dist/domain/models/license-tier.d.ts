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
export declare enum LicenseTier {
    /** Free tier with basic features */
    FREE = "free",
    /** Pro tier with all features (currently default) */
    PRO = "pro"
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
export declare const TIER_FEATURES: Readonly<Record<LicenseTier, TierFeatures>>;
/**
 * Gets the active license tier.
 * Currently defaults to PRO (all features enabled).
 * Future: Will check license key or environment variable.
 *
 * @returns Active license tier
 */
export declare function getActiveTier(): LicenseTier;
/**
 * Gets features for the active tier.
 *
 * @returns Available features
 */
export declare function getActiveTierFeatures(): TierFeatures;
/**
 * Checks if a feature is available in the active tier.
 *
 * @param feature - Feature name to check
 * @returns True if feature is available
 */
export declare function isFeatureAvailable(feature: keyof TierFeatures): boolean;
//# sourceMappingURL=license-tier.d.ts.map
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIER_FEATURES = exports.LicenseTier = void 0;
exports.getActiveTier = getActiveTier;
exports.getActiveTierFeatures = getActiveTierFeatures;
exports.isFeatureAvailable = isFeatureAvailable;
/**
 * License tiers available.
 */
var LicenseTier;
(function (LicenseTier) {
    /** Free tier with basic features */
    LicenseTier["FREE"] = "free";
    /** Pro tier with all features (currently default) */
    LicenseTier["PRO"] = "pro";
})(LicenseTier || (exports.LicenseTier = LicenseTier = {}));
/**
 * Feature set for each tier.
 */
exports.TIER_FEATURES = {
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
};
/**
 * Gets the active license tier.
 * Currently defaults to PRO (all features enabled).
 * Future: Will check license key or environment variable.
 *
 * @returns Active license tier
 */
function getActiveTier() {
    // TODO: Check license key or environment variable
    // For now, always return PRO (all features available)
    return LicenseTier.PRO;
}
/**
 * Gets features for the active tier.
 *
 * @returns Available features
 */
function getActiveTierFeatures() {
    const tier = getActiveTier();
    return exports.TIER_FEATURES[tier];
}
/**
 * Checks if a feature is available in the active tier.
 *
 * @param feature - Feature name to check
 * @returns True if feature is available
 */
function isFeatureAvailable(feature) {
    const features = getActiveTierFeatures();
    if (feature === 'maxRules' || feature === 'maxFiles') {
        return true; // Numeric limits checked separately
    }
    return features[feature];
}
//# sourceMappingURL=license-tier.js.map
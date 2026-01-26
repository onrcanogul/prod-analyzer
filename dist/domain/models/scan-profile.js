"use strict";
/**
 * ============================================================================
 * SCAN PROFILE MODEL
 * ============================================================================
 *
 * Defines scan profiles for scope control in CI/CD environments.
 * Profiles determine which platform rules are loaded and executed.
 *
 * Design Decisions:
 * - Default profile is 'spring' for backward compatibility
 * - Profiles map to platform rule sets
 * - 'all' profile runs all available rules
 * - Profile selection happens at rule registry initialization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_TO_PLATFORMS = exports.ScanProfile = void 0;
exports.getPlatformsForProfile = getPlatformsForProfile;
exports.profileIncludesPlatform = profileIncludesPlatform;
exports.parseProfile = parseProfile;
const platform_1 = require("./platform");
/**
 * Scan profile determines which rules are active.
 */
var ScanProfile;
(function (ScanProfile) {
    ScanProfile["SPRING"] = "spring";
    ScanProfile["NODE"] = "node";
    ScanProfile["DOTNET"] = "dotnet";
    ScanProfile["ALL"] = "all";
})(ScanProfile || (exports.ScanProfile = ScanProfile = {}));
/**
 * Maps scan profiles to platform filters.
 */
exports.PROFILE_TO_PLATFORMS = {
    [ScanProfile.SPRING]: [platform_1.Platform.SPRING_BOOT],
    [ScanProfile.NODE]: [platform_1.Platform.NODEJS],
    [ScanProfile.DOTNET]: [platform_1.Platform.DOTNET],
    [ScanProfile.ALL]: [platform_1.Platform.SPRING_BOOT, platform_1.Platform.NODEJS, platform_1.Platform.DOTNET, platform_1.Platform.GENERIC],
};
/**
 * Get platforms for a given profile.
 */
function getPlatformsForProfile(profile) {
    return exports.PROFILE_TO_PLATFORMS[profile];
}
/**
 * Check if a profile includes a specific platform.
 */
function profileIncludesPlatform(profile, platform) {
    const platforms = getPlatformsForProfile(profile);
    return platforms.includes(platform);
}
/**
 * Parse profile from string input.
 */
function parseProfile(value) {
    const normalized = value.toLowerCase();
    switch (normalized) {
        case 'spring':
            return ScanProfile.SPRING;
        case 'node':
        case 'nodejs':
            return ScanProfile.NODE;
        case 'dotnet':
        case '.net':
            return ScanProfile.DOTNET;
        case 'all':
            return ScanProfile.ALL;
        default:
            throw new Error(`Invalid profile: ${value}. Valid options: spring, node, dotnet, all`);
    }
}
//# sourceMappingURL=scan-profile.js.map
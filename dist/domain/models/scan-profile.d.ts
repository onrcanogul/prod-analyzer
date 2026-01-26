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
import { Platform } from './platform';
/**
 * Scan profile determines which rules are active.
 */
export declare enum ScanProfile {
    SPRING = "spring",
    NODE = "node",
    DOTNET = "dotnet",
    ALL = "all"
}
/**
 * Maps scan profiles to platform filters.
 */
export declare const PROFILE_TO_PLATFORMS: Readonly<Record<ScanProfile, readonly Platform[]>>;
/**
 * Get platforms for a given profile.
 */
export declare function getPlatformsForProfile(profile: ScanProfile): readonly Platform[];
/**
 * Check if a profile includes a specific platform.
 */
export declare function profileIncludesPlatform(profile: ScanProfile, platform: Platform): boolean;
/**
 * Parse profile from string input.
 */
export declare function parseProfile(value: string): ScanProfile;
//# sourceMappingURL=scan-profile.d.ts.map
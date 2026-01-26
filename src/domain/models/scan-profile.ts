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
export enum ScanProfile {
  SPRING = 'spring',
  NODE = 'node',
  DOTNET = 'dotnet',
  ALL = 'all',
}

/**
 * Maps scan profiles to platform filters.
 */
export const PROFILE_TO_PLATFORMS: Readonly<Record<ScanProfile, readonly Platform[]>> = {
  [ScanProfile.SPRING]: [Platform.SPRING_BOOT],
  [ScanProfile.NODE]: [Platform.NODEJS],
  [ScanProfile.DOTNET]: [Platform.DOTNET],
  [ScanProfile.ALL]: [Platform.SPRING_BOOT, Platform.NODEJS, Platform.DOTNET, Platform.GENERIC],
} as const;

/**
 * Get platforms for a given profile.
 */
export function getPlatformsForProfile(profile: ScanProfile): readonly Platform[] {
  return PROFILE_TO_PLATFORMS[profile];
}

/**
 * Check if a profile includes a specific platform.
 */
export function profileIncludesPlatform(profile: ScanProfile, platform: Platform): boolean {
  const platforms = getPlatformsForProfile(profile);
  return platforms.includes(platform);
}

/**
 * Parse profile from string input.
 */
export function parseProfile(value: string): ScanProfile {
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
      throw new Error(
        `Invalid profile: ${value}. Valid options: spring, node, dotnet, all`
      );
  }
}

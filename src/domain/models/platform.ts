/**
 * ============================================================================
 * PLATFORM MODEL
 * ============================================================================
 * 
 * Defines the supported platforms/frameworks for security scanning.
 * Allows the scanner to apply platform-specific rules and parsers.
 * 
 * Design Decisions:
 * - Enum for type safety and autocomplete
 * - Each platform can have multiple rule sets
 * - Platform detection can be automatic or manual via CLI
 * 
 * Extending to New Platforms:
 * 1. Add new platform to the enum
 * 2. Create platform-specific rules in src/domain/rules/implementations/{platform}/
 * 3. Register rules with platform filter in RuleRegistry
 */

/**
 * Supported platforms/frameworks for configuration scanning.
 */
export enum Platform {
  /**
   * Spring Boot (Java/Kotlin)
   * Config files: application.yml, application.properties, bootstrap.yml
   */
  SPRING_BOOT = 'spring-boot',
  
  /**
   * Node.js / Express / NestJS
   * Config files: .env, config.js, config.json
   */
  NODEJS = 'nodejs',
  
  /**
   * .NET / ASP.NET Core
   * Config files: appsettings.json, appsettings.{env}.json, web.config
   */
  DOTNET = 'dotnet',
  
  /**
   * Generic/Unknown platform
   * Applies common security rules across all platforms
   */
  GENERIC = 'generic',
}

/**
 * Platform metadata for detection and display.
 */
export interface PlatformMetadata {
  readonly platform: Platform;
  readonly displayName: string;
  readonly filePatterns: readonly string[];
  readonly description: string;
}

/**
 * Registry of platform metadata for automatic detection.
 */
export const PLATFORM_METADATA: readonly PlatformMetadata[] = [
  {
    platform: Platform.SPRING_BOOT,
    displayName: 'Spring Boot',
    filePatterns: [
      'application.properties',
      'application.yml',
      'application.yaml',
      'bootstrap.properties',
      'bootstrap.yml',
      'bootstrap.yaml',
    ],
    description: 'Java/Kotlin Spring Boot applications',
  },
  {
    platform: Platform.NODEJS,
    displayName: 'Node.js',
    filePatterns: [
      '.env',
      '.env.local',
      '.env.production',
      'config.js',
      'config.json',
      'package.json',
    ],
    description: 'Node.js, Express, NestJS applications',
  },
  {
    platform: Platform.DOTNET,
    displayName: '.NET',
    filePatterns: [
      'appsettings.json',
      'appsettings.Development.json',
      'appsettings.Production.json',
      'web.config',
      'app.config',
    ],
    description: '.NET, ASP.NET Core applications',
  },
  {
    platform: Platform.GENERIC,
    displayName: 'Generic',
    filePatterns: ['*'],
    description: 'Generic configuration files',
  },
] as const;

/**
 * Detect platform based on discovered file names.
 * Returns the most specific platform match.
 * 
 * @param filePaths - Array of discovered file paths
 * @returns Detected platform or GENERIC if no match
 */
export function detectPlatform(filePaths: string[]): Platform {
  const fileNames = filePaths.map(path => {
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  });
  
  // Check Spring Boot first (most specific)
  for (const metadata of PLATFORM_METADATA) {
    if (metadata.platform === Platform.GENERIC) {
      continue; // Skip generic, check last
    }
    
    const hasMatch = fileNames.some(fileName =>
      fileName && metadata.filePatterns.some(pattern => fileName.includes(pattern))
    );
    
    if (hasMatch) {
      return metadata.platform;
    }
  }
  
  return Platform.GENERIC;
}

/**
 * Get metadata for a specific platform.
 */
export function getPlatformMetadata(platform: Platform): PlatformMetadata {
  const metadata = PLATFORM_METADATA.find(m => m.platform === platform);
  if (!metadata) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return metadata;
}

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
export declare enum Platform {
    /**
     * Spring Boot (Java/Kotlin)
     * Config files: application.yml, application.properties, bootstrap.yml
     */
    SPRING_BOOT = "spring-boot",
    /**
     * Node.js / Express / NestJS
     * Config files: .env, config.js, config.json
     */
    NODEJS = "nodejs",
    /**
     * .NET / ASP.NET Core
     * Config files: appsettings.json, appsettings.{env}.json, web.config
     */
    DOTNET = "dotnet",
    /**
     * Generic/Unknown platform
     * Applies common security rules across all platforms
     */
    GENERIC = "generic"
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
export declare const PLATFORM_METADATA: readonly PlatformMetadata[];
/**
 * Detect platform based on discovered file names.
 * Returns the most specific platform match.
 *
 * @param filePaths - Array of discovered file paths
 * @returns Detected platform or GENERIC if no match
 */
export declare function detectPlatform(filePaths: string[]): Platform;
/**
 * Get metadata for a specific platform.
 */
export declare function getPlatformMetadata(platform: Platform): PlatformMetadata;
//# sourceMappingURL=platform.d.ts.map
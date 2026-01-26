/**
 * ============================================================================
 * CONFIG ENTRY MODEL
 * ============================================================================
 *
 * Represents a single configuration entry extracted from a configuration file.
 * This is the fundamental unit that rules evaluate against.
 *
 * Design Decisions:
 * - Flat key-value representation simplifies rule evaluation
 * - Keys use dot notation (e.g., "spring.profiles.active") for consistency
 * - Tracks source file for accurate violation reporting
 * - Values are strings because config files are text-based
 */
/**
 * Represents a single configuration key-value pair from a config file.
 *
 * @example
 * ```typescript
 * const entry: ConfigEntry = {
 *   key: 'spring.profiles.active',
 *   value: 'dev',
 *   sourceFile: '/app/application.yml',
 *   lineNumber: 5,
 * };
 * ```
 */
export interface ConfigEntry {
    /**
     * The configuration key in dot notation.
     * Examples: "spring.profiles.active", "logging.level.root"
     */
    readonly key: string;
    /**
     * The value associated with the key.
     * Always a string - type coercion is the rule's responsibility.
     */
    readonly value: string;
    /**
     * Absolute path to the source file where this entry was found.
     * Used for violation reporting.
     */
    readonly sourceFile: string;
    /**
     * Optional line number where the entry appears.
     * May not always be available depending on the parser.
     */
    readonly lineNumber?: number;
}
/**
 * Represents a parsed configuration file containing multiple entries.
 *
 * Why separate from ConfigEntry?
 * - Allows grouping entries by source file
 * - Enables file-level metadata (format, parse time, etc.)
 * - Simplifies batch processing in the scanner
 */
export interface ParsedConfigFile {
    /** Absolute path to the configuration file */
    readonly filePath: string;
    /** All configuration entries extracted from this file */
    readonly entries: readonly ConfigEntry[];
    /** The format of the source file */
    readonly format: ConfigFileFormat;
}
/**
 * Supported configuration file formats.
 * Used by infrastructure layer to select the appropriate parser.
 */
export declare enum ConfigFileFormat {
    YAML = "yaml",
    PROPERTIES = "properties",
    ENV = "env",
    JSON = "json"
}
/**
 * File patterns associated with each format.
 * Used by file discovery to identify config files.
 */
export declare const CONFIG_FILE_PATTERNS: Readonly<Record<ConfigFileFormat, readonly string[]>>;
//# sourceMappingURL=config-entry.d.ts.map
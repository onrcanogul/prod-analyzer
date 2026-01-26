/**
 * ============================================================================
 * SCAN OPTIONS MODEL
 * ============================================================================
 *
 * Defines the options for a scan operation.
 * These options come from CLI arguments and control scan behavior.
 */
import { Severity, ScanProfile } from '../../domain';
/**
 * Output format options for scan results.
 */
export declare enum OutputFormat {
    /** Human-readable console output */
    CONSOLE = "console",
    /** Machine-readable JSON output */
    JSON = "json",
    /** SARIF format for CI/CD integration (GitHub/GitLab Security tabs) */
    SARIF = "sarif"
}
/**
 * Options for configuring a scan operation.
 */
export interface ScanOptions {
    /**
     * The directory to scan for configuration files.
     * Should be an absolute path.
     */
    readonly targetDirectory: string;
    /**
     * The environment being scanned for.
     * Used for context in reports - e.g., 'prod', 'staging'.
     * Default: 'prod'
     */
    readonly environment: string;
    /**
     * The scan profile determining which rules to execute.
     * Default: SPRING
     */
    readonly profile: ScanProfile;
    /**
     * The minimum severity that should cause a non-zero exit code.
     * Default: HIGH
     */
    readonly failOnSeverity: Severity;
    /**
     * The output format for results.
     * Default: CONSOLE
     */
    readonly outputFormat: OutputFormat;
    /**
     * Whether to show verbose output with full details.
     * Default: false
     */
    readonly verbose: boolean;
}
/**
 * Creates ScanOptions with defaults applied.
 *
 * @param partial - Partial options to apply
 * @returns Complete ScanOptions with defaults
 */
export declare function createScanOptions(partial: Partial<ScanOptions> & Pick<ScanOptions, 'targetDirectory'>): ScanOptions;
/**
 * Parses output format from string.
 *
 * @param value - The string value to parse
 * @returns The corresponding OutputFormat
 * @throws Error if value is invalid
 */
export declare function parseOutputFormat(value: string): OutputFormat;
//# sourceMappingURL=scan-options.d.ts.map
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
export enum OutputFormat {
  /** Human-readable console output */
  CONSOLE = 'console',
  
  /** Machine-readable JSON output */
  JSON = 'json',
  
  /** SARIF format for CI/CD integration (GitHub/GitLab Security tabs) */
  SARIF = 'sarif',
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
export function createScanOptions(
  partial: Partial<ScanOptions> & Pick<ScanOptions, 'targetDirectory'>
): ScanOptions {
  return {
    targetDirectory: partial.targetDirectory,
    environment: partial.environment ?? 'prod',
    profile: partial.profile ?? ScanProfile.SPRING,
    failOnSeverity: partial.failOnSeverity ?? Severity.HIGH,
    outputFormat: partial.outputFormat ?? OutputFormat.CONSOLE,
    verbose: partial.verbose ?? false,
  };
}

/**
 * Parses output format from string.
 * 
 * @param value - The string value to parse
 * @returns The corresponding OutputFormat
 * @throws Error if value is invalid
 */
export function parseOutputFormat(value: string): OutputFormat {
  const normalized = value.toLowerCase().trim();
  
  switch (normalized) {
    case 'console':
      return OutputFormat.CONSOLE;
    case 'json':
      return OutputFormat.JSON;
    case 'sarif':
      return OutputFormat.SARIF;
    default:
      throw new Error(
        `Invalid output format: "${value}". Valid values are: console, json, sarif`
      );
  }
}

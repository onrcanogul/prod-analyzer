/**
 * ============================================================================
 * CONSOLE REPORTER
 * ============================================================================
 *
 * Formats scan results for human-readable console output.
 *
 * Output Format:
 * - Summary section with counts and statistics
 * - Violation details with file paths and suggestions
 * - Color-coded severity (when supported)
 *
 * Design Decisions:
 * - Violations sorted by severity (highest first), then by file path
 * - Clear visual separation between sections
 * - Actionable output with file:line format for editor integration
 */
import { ScanResult } from '../../domain';
/**
 * Formats a scan result for console output.
 *
 * @param result - The scan result to format
 * @param useColors - Whether to use ANSI colors (default: true)
 * @returns Formatted string for console output
 *
 * @example
 * ```typescript
 * const output = formatConsoleReport(scanResult);
 * console.log(output);
 * ```
 */
export declare function formatConsoleReport(result: ScanResult, useColors?: boolean): string;
//# sourceMappingURL=console-reporter.d.ts.map
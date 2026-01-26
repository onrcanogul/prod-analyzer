/**
 * ============================================================================
 * ENHANCED CONSOLE REPORTER
 * ============================================================================
 *
 * Formats scan results for terminal output with clear gate decisions.
 *
 * Design Principles:
 * - Decision-first: STATUS (PASS/FAIL) at the top
 * - Reduced noise: Grouped violations, "Top 5 Blockers"
 * - Verbose mode: Full details behind --verbose flag
 * - Stable ordering: Deterministic for CI/CD
 * - CI-friendly: Clear, scannable, actionable
 *
 * Output Structure:
 * 1. Header (Target, Profile, Env, ScannedAt)
 * 2. Decision (STATUS, threshold, maxSeverity)
 * 3. Summary (files scanned, entries evaluated, rules executed, duration)
 * 4. Top 5 Blockers (grouped violations at/above threshold)
 * 5. Other Findings (counts by severity)
 * 6. Full Details (verbose mode only)
 */
import { ScanResult } from '../../domain';
import { ScanOptions } from '../../application/models/scan-options';
/**
 * Formats scan result for enhanced console output.
 *
 * @param result - Scan result
 * @param options - Scan options (for threshold and verbose flag)
 * @returns Formatted console output string
 */
export declare function formatEnhancedConsoleReport(result: ScanResult, options: ScanOptions): string;
//# sourceMappingURL=enhanced-console-reporter.d.ts.map
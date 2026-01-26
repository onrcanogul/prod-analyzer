/**
 * ============================================================================
 * REPORTER FACTORY
 * ============================================================================
 *
 * Factory for selecting the appropriate reporter based on output format.
 *
 * Design Decisions:
 * - Factory pattern for reporter selection
 * - Reporters return strings (callers handle actual output)
 * - Single entry point for formatting scan results
 * - Enhanced reporters with grouping and gate decisions
 */
import { ScanOptions } from '../../application/models/scan-options';
import { ScanResult } from '../../domain';
/**
 * Formats scan result based on options.
 *
 * @param result - Scan result
 * @param options - Scan options (determines format and verbosity)
 * @returns Formatted output string
 */
export declare function formatScanResult(result: ScanResult, options: ScanOptions): string;
//# sourceMappingURL=reporter-factory.d.ts.map
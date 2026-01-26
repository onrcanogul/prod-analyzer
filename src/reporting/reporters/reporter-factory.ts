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

import { OutputFormat, ScanOptions } from '../../application/models/scan-options';
import { formatEnhancedConsoleReport } from './enhanced-console-reporter';
import { formatEnhancedJsonReport } from './enhanced-json-reporter';
import { formatSarifReport } from './sarif-reporter';

import { ScanResult } from '../../domain';

/**
 * Formats scan result based on options.
 * 
 * @param result - Scan result
 * @param options - Scan options (determines format and verbosity)
 * @returns Formatted output string
 */
export function formatScanResult(result: ScanResult, options: ScanOptions): string {
  switch (options.outputFormat) {
    case OutputFormat.CONSOLE:
      return formatEnhancedConsoleReport(result, options);
    case OutputFormat.JSON:
      return formatEnhancedJsonReport(result, options);
    case OutputFormat.SARIF:
      return formatSarifReport(result, options);
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = options.outputFormat;
      throw new Error(`Unknown output format: ${_exhaustive}`);
  }
}

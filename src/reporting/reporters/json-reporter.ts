/**
 * ============================================================================
 * JSON REPORTER
 * ============================================================================
 * 
 * Formats scan results as JSON for machine consumption.
 * 
 * Use Cases:
 * - CI/CD pipeline integration
 * - Log aggregation systems
 * - Third-party tool integration
 * - Programmatic analysis of results
 * 
 * Schema Stability:
 * The JSON schema is considered a contract. Breaking changes should be
 * versioned and documented. The schema version is included in output.
 */

import { 
  Severity,
  SEVERITY_LABELS,
  ScanResult
} from '../../domain';


/**
 * Current schema version for the JSON output.
 * Increment this when making breaking changes to the schema.
 */
const SCHEMA_VERSION = '1.0.0';

/**
 * JSON output structure.
 * This interface documents the stable output schema.
 */
export interface JsonReportOutput {
  /** Schema version for compatibility checking */
  schemaVersion: string;
  
  /** When the scan was performed (ISO 8601) */
  scannedAt: string;
  
  /** Target directory that was scanned */
  targetDirectory: string;
  
  /** Environment being scanned for */
  environment: string;
  
  /** Summary statistics */
  summary: {
    filesScanned: number;
    entriesEvaluated: number;
    rulesExecuted: number;
    durationMs: number;
    totalViolations: number;
    maxSeverity: string;
    violationsBySeverity: Record<string, number>;
  };
  
  /** Array of violations found */
  violations: Array<{
    ruleId: string;
    severity: string;
    severityLevel: number;
    message: string;
    filePath: string;
    configKey: string;
    configValue: string;
    lineNumber: number | null;
    suggestion: string;
  }>;
}

/**
 * Formats a scan result as a JSON string.
 * 
 * @param result - The scan result to format
 * @param pretty - Whether to pretty-print the JSON (default: true)
 * @returns JSON string representation of the scan result
 * 
 * @example
 * ```typescript
 * const json = formatJsonReport(scanResult);
 * console.log(json);
 * ```
 */
export function formatJsonReport(
  result: ScanResult,
  pretty: boolean = true
): string {
  const output = buildJsonOutput(result);
  
  if (pretty) {
    return JSON.stringify(output, null, 2);
  }
  
  return JSON.stringify(output);
}

/**
 * Builds the JSON output object from a scan result.
 * Separated for testability.
 * 
 * @param result - The scan result to convert
 * @returns The JSON-serializable output object
 */
export function buildJsonOutput(result: ScanResult): JsonReportOutput {
  // Convert severity counts to string keys for JSON
  const violationsBySeverity: Record<string, number> = {};
  for (const severity of Object.values(Severity).filter((v): v is Severity => typeof v === 'number')) {
    const label = SEVERITY_LABELS[severity];
    const count = result.violationsBySeverity[severity];
    if (count > 0) {
      violationsBySeverity[label] = count;
    }
  }
  
  // Sort violations for deterministic output
  const sortedViolations = [...result.violations].sort((a, b) => {
    // Sort by severity (highest first), then by file path, then by config key
    if (a.severity !== b.severity) {
      return b.severity - a.severity;
    }
    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath);
    }
    return a.configKey.localeCompare(b.configKey);
  });
  
  return {
    schemaVersion: SCHEMA_VERSION,
    scannedAt: result.scannedAt,
    targetDirectory: result.targetDirectory,
    environment: result.environment,
    summary: {
      filesScanned: result.statistics.filesScanned,
      entriesEvaluated: result.statistics.entriesEvaluated,
      rulesExecuted: result.statistics.rulesExecuted,
      durationMs: result.statistics.durationMs,
      totalViolations: result.violations.length,
      maxSeverity: SEVERITY_LABELS[result.maxSeverity],
      violationsBySeverity,
    },
    violations: sortedViolations.map(v => ({
      ruleId: v.ruleId,
      severity: SEVERITY_LABELS[v.severity],
      severityLevel: v.severity,
      message: v.message,
      filePath: v.filePath,
      configKey: v.configKey,
      configValue: v.configValue,
      lineNumber: v.lineNumber ?? null,
      suggestion: v.suggestion,
    })),
  };
}

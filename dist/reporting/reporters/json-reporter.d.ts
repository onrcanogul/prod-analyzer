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
import { ScanResult } from '../../domain';
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
export declare function formatJsonReport(result: ScanResult, pretty?: boolean): string;
/**
 * Builds the JSON output object from a scan result.
 * Separated for testability.
 *
 * @param result - The scan result to convert
 * @returns The JSON-serializable output object
 */
export declare function buildJsonOutput(result: ScanResult): JsonReportOutput;
//# sourceMappingURL=json-reporter.d.ts.map
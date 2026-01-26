/**
 * ============================================================================
 * ENHANCED JSON REPORTER
 * ============================================================================
 *
 * Formats scan results as stable JSON for CI/CD integration.
 * Requires Pro tier (CI Mode feature).
 *
 * Design Principles:
 * - Stable contract: toolVersion, schemaVersion, profile, status, groupedViolations
 * - Deterministic ordering: severity desc, then ruleId asc within groups
 * - Machine-readable: Structured for easy parsing by CI tools
 * - Backward compatible: Includes both grouped and legacy violations array
 *
 * JSON Schema v2.0.0:
 * {
 *   toolVersion: "1.0.0"
 *   schemaVersion: "2.0.0"
 *   licenseTier: "pro" | "free"
 *   profile: "spring" | "node" | "dotnet" | "all"
 *   target: string
 *   env: string
 *   scannedAt: string (ISO 8601)
 *   threshold: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
 *   status: "PASS" | "FAIL"
 *   summary: { filesScanned, entriesEvaluated, ... }
 *   groupedViolations: [ { ruleId, severity, count, occurrences: [...] } ]
 *   violations: [ ... ] // legacy array, deprecated, use groupedViolations
 * }
 *
 * Ordering Guarantees:
 * - groupedViolations: Sorted by severity (desc), then ruleId (asc)
 * - occurrences within group: Sorted by file path (asc), then line number (asc)
 * - violations (legacy): Sorted by file path (asc), then line number (asc)
 */
import { ScanResult } from '../../domain';
import { ScanOptions } from '../../application/models/scan-options';
/**
 * Formats scan result as enhanced JSON.
 *
 * @param result - Scan result
 * @param options - Scan options
 * @returns JSON string
 */
export declare function formatEnhancedJsonReport(result: ScanResult, options: ScanOptions): string;
//# sourceMappingURL=enhanced-json-reporter.d.ts.map
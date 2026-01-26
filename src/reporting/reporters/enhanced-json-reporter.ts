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

import { 
  ScanResult, 
  groupViolations, 
  Severity, 
  hasViolationsAboveThreshold,
  getActiveTier,
} from '../../domain';
import { ScanOptions } from '../../application/models/scan-options';

// Tool version - should be synced with package.json
const TOOL_VERSION = '1.0.0';
const SCHEMA_VERSION = '2.0.0'; // v2: Added groupedViolations, licenseTier, stable ordering

/**
 * Formats scan result as enhanced JSON.
 * 
 * @param result - Scan result
 * @param options - Scan options
 * @returns JSON string
 */
export function formatEnhancedJsonReport(
  result: ScanResult,
  options: ScanOptions
): string {
  // Get active license tier
  const activeTier = getActiveTier();
  
  // Group violations with guaranteed stable ordering
  const grouped = groupViolations(result.violations);
  const hasFailures = hasViolationsAboveThreshold(result, options.failOnSeverity);
  
  // Sort violations for legacy array (file path asc, then line asc)
  const sortedViolations = [...result.violations].sort((a, b) => {
    const fileCompare = a.filePath.localeCompare(b.filePath);
    if (fileCompare !== 0) return fileCompare;
    
    const aLine = a.lineNumber ?? 0;
    const bLine = b.lineNumber ?? 0;
    return aLine - bLine;
  });
  
  const output = {
    toolVersion: TOOL_VERSION,
    schemaVersion: SCHEMA_VERSION,
    licenseTier: activeTier,
    profile: result.profile,
    target: result.targetDirectory,
    env: result.environment,
    scannedAt: result.scannedAt,
    threshold: Severity[options.failOnSeverity],
    status: hasFailures ? 'FAIL' : 'PASS',
    
    summary: {
      filesScanned: result.statistics.filesScanned,
      entriesEvaluated: result.statistics.entriesEvaluated,
      rulesExecuted: result.statistics.rulesExecuted,
      durationMs: result.statistics.durationMs,
      totalViolations: result.violations.length,
      maxSeverity: Severity[result.maxSeverity],
      violationsBySeverity: {
        INFO: result.violationsBySeverity[Severity.INFO],
        LOW: result.violationsBySeverity[Severity.LOW],
        MEDIUM: result.violationsBySeverity[Severity.MEDIUM],
        HIGH: result.violationsBySeverity[Severity.HIGH],
        CRITICAL: result.violationsBySeverity[Severity.CRITICAL],
      },
    },
    
    // Grouped violations with stable ordering (severity desc, ruleId asc)
    groupedViolations: grouped.map(group => ({
      ruleId: group.ruleId,
      severity: Severity[group.severity],
      severityLevel: group.severityLevel,
      count: group.count,
      // Occurrences already sorted by file path and line number in groupViolations()
      occurrences: group.occurrences.map(occ => ({
        file: occ.filePath,
        line: occ.lineNumber ?? null,
        key: occ.configKey,
        valueRedacted: occ.configValue.includes('***REDACTED***'),
        value: occ.configValue,
        message: occ.message,
        fix: occ.suggestion,
      })),
    })),
    
    // Legacy format for backward compatibility (sorted by file path, then line)
    violations: sortedViolations.map(v => ({
      ruleId: v.ruleId,
      severity: Severity[v.severity],
      severityLevel: v.severity,
      message: v.message,
      file: v.filePath,
      line: v.lineNumber ?? null,
      key: v.configKey,
      valueRedacted: v.configValue.includes('***REDACTED***'),
      value: v.configValue,
      fix: v.suggestion,
    })),
  };
  
  return JSON.stringify(output, null, 2);
}

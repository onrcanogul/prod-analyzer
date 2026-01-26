/**
 * ============================================================================
 * SCAN RESULT MODEL
 * ============================================================================
 * 
 * Represents the complete result of a configuration scan.
 * This is the primary output of the scanning process.
 * 
 * Design Decisions:
 * - Aggregates all violations with metadata about the scan
 * - Contains computed fields (maxSeverity, hasViolationsAboveThreshold)
 * - Immutable to ensure consistent state during reporting
 * - Includes statistics for reporting layer
 */

import { Severity, maxSeverity as computeMaxSeverity } from './severity';
import { Violation } from './violation';
import { ScanProfile } from './scan-profile';

/**
 * Statistics about the scan for reporting purposes.
 */
export interface ScanStatistics {
  /** Number of configuration files scanned */
  readonly filesScanned: number;
  
  /** Total number of configuration entries evaluated */
  readonly entriesEvaluated: number;
  
  /** Number of rules executed */
  readonly rulesExecuted: number;
  
  /** Total scan duration in milliseconds */
  readonly durationMs: number;
}

/**
 * Complete result of a security scan.
 * Contains all violations and metadata needed for reporting and exit code determination.
 */
export interface ScanResult {
  /** Timestamp when the scan was performed (ISO 8601 format) */
  readonly scannedAt: string;
  
  /** The target directory that was scanned */
  readonly targetDirectory: string;
  
  /** The environment being scanned for (e.g., 'prod', 'staging') */
  readonly environment: string;
  
  /** The scan profile used (determines which rules were active) */
  readonly profile: ScanProfile;
  
  /** All violations found during the scan */
  readonly violations: readonly Violation[];
  
  /** Statistics about the scan */
  readonly statistics: ScanStatistics;
  
  /** The highest severity found among all violations */
  readonly maxSeverity: Severity;
  
  /** Count of violations by severity level */
  readonly violationsBySeverity: Readonly<Record<Severity, number>>;
}

/**
 * Creates a ScanResult with computed fields.
 * 
 * @param params - Parameters for creating the scan result
 * @returns Complete ScanResult with all computed fields
 */
export function createScanResult(params: {
  targetDirectory: string;
  environment: string;
  profile: ScanProfile;
  violations: readonly Violation[];
  statistics: ScanStatistics;
}): ScanResult {
  const violationsBySeverity = computeViolationsBySeverity(params.violations);
  const severities = params.violations.map(v => v.severity);
  
  return Object.freeze({
    scannedAt: new Date().toISOString(),
    targetDirectory: params.targetDirectory,
    environment: params.environment,
    profile: params.profile,
    violations: Object.freeze([...params.violations]),
    statistics: Object.freeze(params.statistics),
    maxSeverity: computeMaxSeverity(severities),
    violationsBySeverity: Object.freeze(violationsBySeverity),
  });
}

/**
 * Counts violations grouped by severity level.
 * 
 * @param violations - Array of violations to count
 * @returns Record mapping severity to count
 */
function computeViolationsBySeverity(
  violations: readonly Violation[]
): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    [Severity.INFO]: 0,
    [Severity.LOW]: 0,
    [Severity.MEDIUM]: 0,
    [Severity.HIGH]: 0,
    [Severity.CRITICAL]: 0,
  };
  
  for (const violation of violations) {
    counts[violation.severity]++;
  }
  
  return counts;
}

/**
 * Determines if the scan result should cause CI failure.
 * 
 * @param result - The scan result to evaluate
 * @param failOnSeverity - The severity threshold for failure
 * @returns True if there are violations at or above the threshold
 */
export function hasViolationsAboveThreshold(
  result: ScanResult,
  failOnSeverity: Severity
): boolean {
  return result.violations.some(v => v.severity >= failOnSeverity);
}

/**
 * ============================================================================
 * GROUPED VIOLATIONS MODEL
 * ============================================================================
 *
 * Groups violations by rule ID for cleaner reporting.
 * Reduces noise by showing "RULE_ID (N occurrences)" instead of repeating
 * the same rule description multiple times.
 *
 * Design Decisions:
 * - Violations grouped by ruleId
 * - Ordered by severity (desc) then ruleId (asc) for stability
 * - Each group shows occurrences sorted by file path and line number
 * - Deterministic output for CI/CD consistency
 */
import { Violation } from './violation';
import { Severity } from './severity';
/**
 * A single occurrence of a violation within a grouped set.
 */
export interface ViolationOccurrence {
    readonly filePath: string;
    readonly lineNumber?: number;
    readonly configKey: string;
    readonly configValue: string;
    readonly message: string;
    readonly suggestion: string;
}
/**
 * Violations grouped by rule ID.
 */
export interface GroupedViolation {
    readonly ruleId: string;
    readonly severity: Severity;
    readonly severityLevel: number;
    readonly count: number;
    readonly occurrences: readonly ViolationOccurrence[];
}
/**
 * Groups violations by rule ID with stable ordering.
 *
 * @param violations - All violations to group
 * @returns Grouped violations sorted by severity (desc) then ruleId (asc)
 */
export declare function groupViolations(violations: readonly Violation[]): readonly GroupedViolation[];
/**
 * Get top N grouped violations at or above threshold.
 *
 * @param grouped - All grouped violations
 * @param threshold - Minimum severity
 * @param limit - Maximum number of groups to return
 * @returns Top N blocker groups
 */
export declare function getTopBlockers(grouped: readonly GroupedViolation[], threshold: Severity, limit?: number): readonly GroupedViolation[];
//# sourceMappingURL=grouped-violations.d.ts.map
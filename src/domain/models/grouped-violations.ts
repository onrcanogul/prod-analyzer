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
export function groupViolations(violations: readonly Violation[]): readonly GroupedViolation[] {
  // Group by ruleId
  const groups = new Map<string, Violation[]>();
  
  for (const violation of violations) {
    const existing = groups.get(violation.ruleId) ?? [];
    existing.push(violation);
    groups.set(violation.ruleId, existing);
  }
  
  // Convert to GroupedViolation array
  const groupedArray: GroupedViolation[] = [];
  
  for (const [ruleId, violationsInGroup] of groups.entries()) {
    if (violationsInGroup.length === 0) continue;
    
    // Sort occurrences by file path, then line number
    const sortedOccurrences = [...violationsInGroup].sort((a, b) => {
      const fileCompare = a.filePath.localeCompare(b.filePath);
      if (fileCompare !== 0) return fileCompare;
      
      const aLine = a.lineNumber ?? 0;
      const bLine = b.lineNumber ?? 0;
      return aLine - bLine;
    });
    
    // Safe to access [0] because we checked length > 0
    const firstViolation = violationsInGroup[0]!;
    
    groupedArray.push({
      ruleId,
      severity: firstViolation.severity,
      severityLevel: firstViolation.severity,
      count: violationsInGroup.length,
      occurrences: sortedOccurrences.map(v => {
        const occ: ViolationOccurrence = {
          filePath: v.filePath,
          configKey: v.configKey,
          configValue: v.configValue,
          message: v.message,
          suggestion: v.suggestion,
        };
        if (v.lineNumber !== undefined) {
          (occ as { lineNumber: number }).lineNumber = v.lineNumber;
        }
        return occ;
      }),
    });
  }
  
  // Sort groups by severity (desc), then ruleId (asc)
  groupedArray.sort((a, b) => {
    const severityCompare = b.severityLevel - a.severityLevel;
    if (severityCompare !== 0) return severityCompare;
    
    return a.ruleId.localeCompare(b.ruleId);
  });
  
  return groupedArray;
}

/**
 * Get top N grouped violations at or above threshold.
 * 
 * @param grouped - All grouped violations
 * @param threshold - Minimum severity
 * @param limit - Maximum number of groups to return
 * @returns Top N blocker groups
 */
export function getTopBlockers(
  grouped: readonly GroupedViolation[],
  threshold: Severity,
  limit: number = 5
): readonly GroupedViolation[] {
  return grouped
    .filter(g => g.severityLevel >= threshold)
    .slice(0, limit);
}

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

import { ScanResult, groupViolations, Severity, hasViolationsAboveThreshold } from '../../domain';
import { ScanOptions } from '../../application/models/scan-options';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Status colors
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  
  // Severity colors
  info: '\x1b[34m',      // Blue
  low: '\x1b[36m',       // Cyan
  medium: '\x1b[33m',    // Yellow
  high: '\x1b[38;5;208m', // Orange
  critical: '\x1b[31m',   // Red
};

/**
 * Formats scan result for enhanced console output.
 * 
 * @param result - Scan result
 * @param options - Scan options (for threshold and verbose flag)
 * @returns Formatted console output string
 */
export function formatEnhancedConsoleReport(
  result: ScanResult,
  options: ScanOptions
): string {
  const lines: string[] = [];
  
  // 1. Header
  lines.push('');
  lines.push(`${colors.bold}━━━ Secure Guard Scan Report ━━━${colors.reset}`);
  lines.push('');
  lines.push(`${colors.dim}Target:${colors.reset}      ${result.targetDirectory}`);
  lines.push(`${colors.dim}Profile:${colors.reset}     ${result.profile}`);
  lines.push(`${colors.dim}Environment:${colors.reset} ${result.environment}`);
  lines.push(`${colors.dim}Scanned at:${colors.reset}  ${result.scannedAt}`);
  lines.push('');
  
  // 2. Decision
  const hasFailures = hasViolationsAboveThreshold(result, options.failOnSeverity);
  const status = hasFailures ? 'FAIL' : 'PASS';
  const statusColor = hasFailures ? colors.red : colors.green;
  
  lines.push(`${colors.bold}${statusColor}STATUS: ${status}${colors.reset}`);
  
  if (hasFailures) {
    const thresholdName = Severity[options.failOnSeverity];
    const maxSeverityName = Severity[result.maxSeverity];
    lines.push(`${colors.red}Deploy blocked due to ${maxSeverityName} violations (threshold: ${thresholdName})${colors.reset}`);
  } else if (result.violations.length > 0) {
    lines.push(`${colors.yellow}Found violations below threshold - review recommended${colors.reset}`);
  } else {
    lines.push(`${colors.green}No configuration issues detected${colors.reset}`);
  }
  
  lines.push('');
  
  // 3. Summary
  lines.push(`${colors.bold}Summary:${colors.reset}`);
  lines.push(`  Files scanned:     ${result.statistics.filesScanned}`);
  lines.push(`  Entries evaluated: ${result.statistics.entriesEvaluated}`);
  lines.push(`  Rules executed:    ${result.statistics.rulesExecuted}`);
  lines.push(`  Scan duration:     ${result.statistics.durationMs}ms`);
  lines.push(`  Total violations:  ${result.violations.length}`);
  lines.push('');
  
  // Early return if no violations
  if (result.violations.length === 0) {
    return lines.join('\n');
  }
  
  // Group violations
  const grouped = groupViolations(result.violations);
  const blockers = grouped.filter(g => g.severityLevel >= options.failOnSeverity);
  const nonBlockers = grouped.filter(g => g.severityLevel < options.failOnSeverity);
  
  // 4. Blocking Violations (at or above threshold)
  if (blockers.length > 0) {
    lines.push(`${colors.bold}${colors.red}Blocking Violations (${blockers.length} rules, ${blockers.reduce((sum, g) => sum + g.count, 0)} total):${colors.reset}`);
    lines.push('');
    
    // Group by severity for clearer visual separation
    const criticalBlockers = blockers.filter(g => g.severity === Severity.CRITICAL);
    const highBlockers = blockers.filter(g => g.severity === Severity.HIGH);
    const otherBlockers = blockers.filter(g => g.severity !== Severity.CRITICAL && g.severity !== Severity.HIGH);
    
    // Show CRITICAL violations first
    if (criticalBlockers.length > 0) {
      for (const group of criticalBlockers) {
        formatViolationGroup(group, lines);
      }
    }
    
    // Then HIGH violations
    if (highBlockers.length > 0) {
      for (const group of highBlockers) {
        formatViolationGroup(group, lines);
      }
    }
    
    // Finally other severity levels
    if (otherBlockers.length > 0) {
      for (const group of otherBlockers) {
        formatViolationGroup(group, lines);
      }
    }
  }
  
  // 5. Non-Blocking Violations (below threshold)
  if (nonBlockers.length > 0) {
    lines.push(`${colors.bold}${colors.yellow}Non-Blocking Violations (${nonBlockers.length} rules, ${nonBlockers.reduce((sum, g) => sum + g.count, 0)} total):${colors.reset}`);
    lines.push('');
    
    for (const group of nonBlockers) {
      formatViolationGroup(group, lines);
    }
  }
  
  // Footer
  lines.push('─────────────────────────────────');
  if (hasFailures) {
    lines.push(`${colors.bold}${colors.red}❌ SCAN FAILED - ${result.violations.length} violation(s) found${colors.reset}`);
  } else if (result.violations.length > 0) {
    lines.push(`${colors.bold}${colors.yellow}⚠️  SCAN PASSED - ${result.violations.length} violation(s) below threshold${colors.reset}`);
  } else {
    lines.push(`${colors.bold}${colors.green}✅ SCAN PASSED - No violations${colors.reset}`);
  }
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Formats a single violation group.
 */
function formatViolationGroup(group: any, lines: string[]): void {
  const severityColor = getSeverityColor(group.severity);
  const severityName = Severity[group.severity];
  
  lines.push(`${colors.bold}${severityColor}[${severityName}] ${group.ruleId}${colors.reset} ${colors.dim}(${group.count} occurrence${group.count > 1 ? 's' : ''})${colors.reset}`);
  
  // Show ALL occurrences
  for (const occ of group.occurrences) {
    const lineInfo = occ.lineNumber ? `:${occ.lineNumber}` : '';
    lines.push(`  ${colors.dim}→${colors.reset} ${occ.filePath}${lineInfo}`);
    lines.push(`    ${occ.configKey} = ${occ.configValue}`);
  }
  
  // Show message and fix from first occurrence
  const first = group.occurrences[0];
  if (first) {
    lines.push(`  ${colors.dim}Issue:${colors.reset} ${first.message}`);
    lines.push(`  ${colors.dim}Fix:${colors.reset}   ${first.suggestion}`);
  }
  
  lines.push('');
}

/**
 * Gets ANSI color code for a severity level.
 */
function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case Severity.CRITICAL:
      return colors.critical;
    case Severity.HIGH:
      return colors.high;
    case Severity.MEDIUM:
      return colors.medium;
    case Severity.LOW:
      return colors.low;
    case Severity.INFO:
      return colors.info;
    default:
      return colors.reset;
  }
}

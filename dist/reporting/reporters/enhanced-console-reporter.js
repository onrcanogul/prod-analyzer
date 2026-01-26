"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEnhancedConsoleReport = formatEnhancedConsoleReport;
const domain_1 = require("../../domain");
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
    info: '\x1b[34m', // Blue
    low: '\x1b[36m', // Cyan
    medium: '\x1b[33m', // Yellow
    high: '\x1b[38;5;208m', // Orange
    critical: '\x1b[31m', // Red
};
/**
 * Formats scan result for enhanced console output.
 *
 * @param result - Scan result
 * @param options - Scan options (for threshold and verbose flag)
 * @returns Formatted console output string
 */
function formatEnhancedConsoleReport(result, options) {
    const lines = [];
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
    const hasFailures = (0, domain_1.hasViolationsAboveThreshold)(result, options.failOnSeverity);
    const status = hasFailures ? 'FAIL' : 'PASS';
    const statusColor = hasFailures ? colors.red : colors.green;
    lines.push(`${colors.bold}${statusColor}STATUS: ${status}${colors.reset}`);
    if (hasFailures) {
        const thresholdName = domain_1.Severity[options.failOnSeverity];
        const maxSeverityName = domain_1.Severity[result.maxSeverity];
        lines.push(`${colors.red}Deploy blocked due to ${maxSeverityName} violations (threshold: ${thresholdName})${colors.reset}`);
    }
    else if (result.violations.length > 0) {
        lines.push(`${colors.yellow}Found violations below threshold - review recommended${colors.reset}`);
    }
    else {
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
    const grouped = (0, domain_1.groupViolations)(result.violations);
    const blockers = (0, domain_1.getTopBlockers)(grouped, options.failOnSeverity, 5);
    // 4. Top Blockers
    if (blockers.length > 0) {
        lines.push(`${colors.bold}${colors.red}Top Blockers (${blockers.length}):${colors.reset}`);
        lines.push('');
        for (const group of blockers) {
            const severityColor = getSeverityColor(group.severity);
            const severityName = domain_1.Severity[group.severity];
            lines.push(`${colors.bold}${severityColor}[${severityName}] ${group.ruleId}${colors.reset} ${colors.dim}(${group.count} occurrence${group.count > 1 ? 's' : ''})${colors.reset}`);
            // Show first 3 occurrences
            const displayCount = Math.min(3, group.occurrences.length);
            for (let i = 0; i < displayCount; i++) {
                const occ = group.occurrences[i];
                if (!occ)
                    continue;
                const lineInfo = occ.lineNumber ? `:${occ.lineNumber}` : '';
                lines.push(`  ${colors.dim}→${colors.reset} ${occ.filePath}${lineInfo}`);
                lines.push(`    ${occ.configKey} = ${occ.configValue}`);
            }
            if (group.count > displayCount) {
                lines.push(`  ${colors.dim}... and ${group.count - displayCount} more${colors.reset}`);
            }
            // Show message and fix from first occurrence
            const first = group.occurrences[0];
            if (first) {
                lines.push(`  ${colors.dim}Issue:${colors.reset} ${first.message}`);
                lines.push(`  ${colors.dim}Fix:${colors.reset}   ${first.suggestion}`);
            }
            lines.push('');
        }
    }
    // 5. Other Findings
    const nonBlockers = grouped.filter(g => g.severityLevel < options.failOnSeverity);
    if (nonBlockers.length > 0) {
        lines.push(`${colors.bold}Other Findings:${colors.reset}`);
        // Count by severity
        const counts = {};
        for (const group of nonBlockers) {
            const severityName = domain_1.Severity[group.severity];
            counts[severityName] = (counts[severityName] ?? 0) + group.count;
        }
        for (const [severityName, count] of Object.entries(counts)) {
            lines.push(`  ${severityName}: ${count}`);
        }
        lines.push('');
    }
    // 6. Verbose Details
    if (options.verbose) {
        lines.push(`${colors.bold}Full Details:${colors.reset}`);
        lines.push('');
        let counter = 1;
        for (const group of grouped) {
            const severityColor = getSeverityColor(group.severity);
            const severityName = domain_1.Severity[group.severity];
            for (const occ of group.occurrences) {
                lines.push(`${counter}. ${colors.bold}${severityColor}[${severityName}] ${group.ruleId}${colors.reset}`);
                const lineInfo = occ.lineNumber ? `:${occ.lineNumber}` : '';
                lines.push(`   ${colors.dim}File:${colors.reset}   ${occ.filePath}${lineInfo}`);
                lines.push(`   ${colors.dim}Key:${colors.reset}    ${occ.configKey}`);
                lines.push(`   ${colors.dim}Value:${colors.reset}  ${occ.configValue}`);
                lines.push(`   ${colors.dim}Issue:${colors.reset}  ${occ.message}`);
                lines.push(`   ${colors.dim}Fix:${colors.reset}    ${occ.suggestion}`);
                lines.push('');
                counter++;
            }
        }
    }
    else {
        lines.push(`${colors.dim}Run with --verbose (-v) to see full violation details${colors.reset}`);
        lines.push('');
    }
    // Footer
    lines.push('─────────────────────────────────');
    if (hasFailures) {
        lines.push(`${colors.bold}${colors.red}❌ SCAN FAILED - ${result.violations.length} violation(s) found${colors.reset}`);
    }
    else if (result.violations.length > 0) {
        lines.push(`${colors.bold}${colors.yellow}⚠️  SCAN PASSED - ${result.violations.length} violation(s) below threshold${colors.reset}`);
    }
    else {
        lines.push(`${colors.bold}${colors.green}✅ SCAN PASSED - No violations${colors.reset}`);
    }
    lines.push('');
    return lines.join('\n');
}
/**
 * Gets ANSI color code for a severity level.
 */
function getSeverityColor(severity) {
    switch (severity) {
        case domain_1.Severity.CRITICAL:
            return colors.critical;
        case domain_1.Severity.HIGH:
            return colors.high;
        case domain_1.Severity.MEDIUM:
            return colors.medium;
        case domain_1.Severity.LOW:
            return colors.low;
        case domain_1.Severity.INFO:
            return colors.info;
        default:
            return colors.reset;
    }
}
//# sourceMappingURL=enhanced-console-reporter.js.map
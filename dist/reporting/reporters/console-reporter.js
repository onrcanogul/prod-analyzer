"use strict";
/**
 * ============================================================================
 * CONSOLE REPORTER
 * ============================================================================
 *
 * Formats scan results for human-readable console output.
 *
 * Output Format:
 * - Summary section with counts and statistics
 * - Violation details with file paths and suggestions
 * - Color-coded severity (when supported)
 *
 * Design Decisions:
 * - Violations sorted by severity (highest first), then by file path
 * - Clear visual separation between sections
 * - Actionable output with file:line format for editor integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConsoleReport = formatConsoleReport;
const domain_1 = require("../../domain");
/**
 * ANSI color codes for terminal output.
 * These work in most modern terminals.
 */
const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    // Severity colors
    critical: '\x1b[35m', // Magenta
    high: '\x1b[31m', // Red
    medium: '\x1b[33m', // Yellow
    low: '\x1b[34m', // Blue
    info: '\x1b[36m', // Cyan
    // Other colors
    green: '\x1b[32m',
    white: '\x1b[37m',
};
/**
 * Maps severity to color code.
 */
const SEVERITY_COLORS = {
    [domain_1.Severity.CRITICAL]: COLORS['critical'] ?? '',
    [domain_1.Severity.HIGH]: COLORS['high'] ?? '',
    [domain_1.Severity.MEDIUM]: COLORS['medium'] ?? '',
    [domain_1.Severity.LOW]: COLORS['low'] ?? '',
    [domain_1.Severity.INFO]: COLORS['info'] ?? '',
};
/**
 * Formats a scan result for console output.
 *
 * @param result - The scan result to format
 * @param useColors - Whether to use ANSI colors (default: true)
 * @returns Formatted string for console output
 *
 * @example
 * ```typescript
 * const output = formatConsoleReport(scanResult);
 * console.log(output);
 * ```
 */
function formatConsoleReport(result, useColors = true) {
    const c = useColors ? COLORS : createNoColors();
    const lines = [];
    // Header
    lines.push('');
    lines.push(`${c['bold'] ?? ''}━━━ Secure Guard Scan Report ━━━${c['reset'] ?? ''}`);
    lines.push('');
    // Summary
    lines.push(`${c['dim'] ?? ''}Target:${c['reset'] ?? ''}      ${result.targetDirectory}`);
    lines.push(`${c['dim'] ?? ''}Environment:${c['reset'] ?? ''} ${result.environment}`);
    lines.push(`${c['dim'] ?? ''}Scanned at:${c['reset'] ?? ''}  ${result.scannedAt}`);
    lines.push('');
    // Statistics
    lines.push(`${c['bold'] ?? ''}Statistics:${c['reset'] ?? ''}`);
    lines.push(`  Files scanned:     ${result.statistics.filesScanned}`);
    lines.push(`  Entries evaluated: ${result.statistics.entriesEvaluated}`);
    lines.push(`  Rules executed:    ${result.statistics.rulesExecuted}`);
    lines.push(`  Scan duration:     ${result.statistics.durationMs}ms`);
    lines.push('');
    // Violation summary
    const totalViolations = result.violations.length;
    if (totalViolations === 0) {
        lines.push(`${c['green'] ?? ''}${c['bold'] ?? ''}✓ No violations found${c['reset'] ?? ''}`);
        lines.push('');
        return lines.join('\n');
    }
    // Violations by severity
    lines.push(`${c['bold'] ?? ''}Violations by Severity:${c['reset'] ?? ''}`);
    for (const severity of [domain_1.Severity.CRITICAL, domain_1.Severity.HIGH, domain_1.Severity.MEDIUM, domain_1.Severity.LOW, domain_1.Severity.INFO]) {
        const count = result.violationsBySeverity[severity];
        if (count > 0) {
            const color = SEVERITY_COLORS[severity];
            const label = domain_1.SEVERITY_LABELS[severity];
            lines.push(`  ${useColors ? color : ''}${label}:${c['reset'] ?? ''} ${count}`);
        }
    }
    lines.push('');
    // Violation details
    lines.push(`${c['bold'] ?? ''}Violation Details:${c['reset'] ?? ''}`);
    lines.push('');
    // Sort violations by severity (highest first), then by file path
    const sortedViolations = [...result.violations].sort((a, b) => {
        if (a.severity !== b.severity) {
            return b.severity - a.severity; // Higher severity first
        }
        return a.filePath.localeCompare(b.filePath);
    });
    for (let i = 0; i < sortedViolations.length; i++) {
        const v = sortedViolations[i];
        if (v) {
            lines.push(formatViolation(v, i + 1, c, useColors));
            lines.push('');
        }
    }
    // Footer
    lines.push(`${c['dim'] ?? ''}─────────────────────────────────${c['reset'] ?? ''}`);
    lines.push(`${c['bold'] ?? ''}Total: ${totalViolations} violation(s)${c['reset'] ?? ''}`);
    lines.push('');
    return lines.join('\n');
}
/**
 * Formats a single violation for console output.
 */
function formatViolation(v, index, c, useColors) {
    const severityColor = useColors ? (SEVERITY_COLORS[v.severity] ?? '') : '';
    const severityLabel = domain_1.SEVERITY_LABELS[v.severity];
    const location = v.lineNumber
        ? `${v.filePath}:${v.lineNumber}`
        : v.filePath;
    const lines = [
        `${c['bold'] ?? ''}${index}. [${severityColor}${severityLabel}${c['reset'] ?? ''}${c['bold'] ?? ''}] ${v.ruleId}${c['reset'] ?? ''}`,
        `   ${c['dim'] ?? ''}File:${c['reset'] ?? ''}   ${location}`,
        `   ${c['dim'] ?? ''}Key:${c['reset'] ?? ''}    ${v.configKey}`,
        `   ${c['dim'] ?? ''}Value:${c['reset'] ?? ''}  ${v.configValue}`,
        `   ${c['dim'] ?? ''}Issue:${c['reset'] ?? ''}  ${v.message}`,
        `   ${c['dim'] ?? ''}Fix:${c['reset'] ?? ''}    ${v.suggestion}`,
    ];
    return lines.join('\n');
}
/**
 * Creates a color object with no actual colors (for non-TTY output).
 */
function createNoColors() {
    return {
        reset: '',
        bold: '',
        dim: '',
        critical: '',
        high: '',
        medium: '',
        low: '',
        info: '',
        green: '',
        white: '',
    };
}
//# sourceMappingURL=console-reporter.js.map
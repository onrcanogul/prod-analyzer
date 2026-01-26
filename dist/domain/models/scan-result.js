"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScanResult = createScanResult;
exports.hasViolationsAboveThreshold = hasViolationsAboveThreshold;
const severity_1 = require("./severity");
/**
 * Creates a ScanResult with computed fields.
 *
 * @param params - Parameters for creating the scan result
 * @returns Complete ScanResult with all computed fields
 */
function createScanResult(params) {
    const violationsBySeverity = computeViolationsBySeverity(params.violations);
    const severities = params.violations.map(v => v.severity);
    return Object.freeze({
        scannedAt: new Date().toISOString(),
        targetDirectory: params.targetDirectory,
        environment: params.environment,
        profile: params.profile,
        violations: Object.freeze([...params.violations]),
        statistics: Object.freeze(params.statistics),
        maxSeverity: (0, severity_1.maxSeverity)(severities),
        violationsBySeverity: Object.freeze(violationsBySeverity),
    });
}
/**
 * Counts violations grouped by severity level.
 *
 * @param violations - Array of violations to count
 * @returns Record mapping severity to count
 */
function computeViolationsBySeverity(violations) {
    const counts = {
        [severity_1.Severity.INFO]: 0,
        [severity_1.Severity.LOW]: 0,
        [severity_1.Severity.MEDIUM]: 0,
        [severity_1.Severity.HIGH]: 0,
        [severity_1.Severity.CRITICAL]: 0,
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
function hasViolationsAboveThreshold(result, failOnSeverity) {
    return result.violations.some(v => v.severity >= failOnSeverity);
}
//# sourceMappingURL=scan-result.js.map
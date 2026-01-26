"use strict";
/**
 * ============================================================================
 * SEVERITY MODEL
 * ============================================================================
 *
 * Defines the severity levels for configuration violations.
 *
 * Design Decisions:
 * - Using numeric enum to enable comparison operations (>=, <=)
 * - Higher numeric value = higher severity
 * - This ordering is crucial for the --fail-on threshold logic
 *
 * Usage Example:
 * ```typescript
 * if (violation.severity >= Severity.HIGH) {
 *   process.exit(1);
 * }
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEVERITY_LABELS = exports.Severity = void 0;
exports.parseSeverity = parseSeverity;
exports.compareSeverity = compareSeverity;
exports.maxSeverity = maxSeverity;
/**
 * Severity levels for configuration violations.
 * Numeric values allow direct comparison for threshold checks.
 */
var Severity;
(function (Severity) {
    /** Informational finding, no immediate action required */
    Severity[Severity["INFO"] = 1] = "INFO";
    /** Low severity - should be reviewed but not blocking */
    Severity[Severity["LOW"] = 2] = "LOW";
    /** Medium severity - potential security concern */
    Severity[Severity["MEDIUM"] = 3] = "MEDIUM";
    /** High severity - definite security issue, should block CI */
    Severity[Severity["HIGH"] = 4] = "HIGH";
    /** Critical severity - severe security vulnerability */
    Severity[Severity["CRITICAL"] = 5] = "CRITICAL";
})(Severity || (exports.Severity = Severity = {}));
/**
 * Maps severity enum values to their string representations.
 * Used for consistent output formatting across reporters.
 *
 * Why a separate map instead of enum names?
 * - Decouples display names from code identifiers
 * - Allows localization in future without code changes
 * - Provides explicit control over output format
 */
exports.SEVERITY_LABELS = {
    [Severity.INFO]: 'INFO',
    [Severity.LOW]: 'LOW',
    [Severity.MEDIUM]: 'MEDIUM',
    [Severity.HIGH]: 'HIGH',
    [Severity.CRITICAL]: 'CRITICAL',
};
/**
 * Parses a string to its corresponding Severity enum value.
 * Case-insensitive to improve CLI usability.
 *
 * @param value - The string representation of severity
 * @returns The corresponding Severity enum value
 * @throws Error if the value doesn't match any known severity
 *
 * @example
 * parseSeverity('high') // Returns Severity.HIGH
 * parseSeverity('HIGH') // Returns Severity.HIGH
 */
function parseSeverity(value) {
    const normalized = value.toUpperCase().trim();
    const severityMap = {
        'INFO': Severity.INFO,
        'LOW': Severity.LOW,
        'MEDIUM': Severity.MEDIUM,
        'HIGH': Severity.HIGH,
        'CRITICAL': Severity.CRITICAL,
    };
    const severity = severityMap[normalized];
    if (severity === undefined) {
        const validValues = Object.keys(severityMap).join(', ');
        throw new Error(`Invalid severity: "${value}". Valid values are: ${validValues}`);
    }
    return severity;
}
/**
 * Compares two severity levels.
 * Returns positive if a > b, negative if a < b, zero if equal.
 *
 * @param a - First severity to compare
 * @param b - Second severity to compare
 * @returns Comparison result suitable for Array.sort()
 */
function compareSeverity(a, b) {
    return a - b;
}
/**
 * Returns the maximum severity from an array of severities.
 * Returns INFO if the array is empty (safe default).
 *
 * @param severities - Array of severity values
 * @returns The highest severity in the array
 */
function maxSeverity(severities) {
    if (severities.length === 0) {
        return Severity.INFO;
    }
    return Math.max(...severities);
}
//# sourceMappingURL=severity.js.map
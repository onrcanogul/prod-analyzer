"use strict";
/**
 * ============================================================================
 * VIOLATION MODEL
 * ============================================================================
 *
 * Represents a single security/configuration violation found during scanning.
 * Violations are immutable value objects created by rules.
 *
 * Design Decisions:
 * - Immutable (readonly) to prevent accidental mutation
 * - Contains all context needed for reporting
 * - Includes both machine-readable (ruleId) and human-readable (message) fields
 * - Suggestion field provides actionable remediation guidance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViolation = createViolation;
/**
 * Factory function to create a Violation.
 * Ensures all required fields are provided and properly typed.
 *
 * @param params - Violation parameters
 * @returns A new immutable Violation object
 */
function createViolation(params) {
    return Object.freeze({
        ruleId: params.ruleId,
        severity: params.severity,
        message: params.message,
        filePath: params.filePath,
        configKey: params.configKey,
        configValue: params.configValue,
        lineNumber: params.lineNumber,
        suggestion: params.suggestion,
    });
}
//# sourceMappingURL=violation.js.map
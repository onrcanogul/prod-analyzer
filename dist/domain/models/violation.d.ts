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
import { Severity } from './severity';
/**
 * Represents a configuration violation detected by a rule.
 *
 * @example
 * ```typescript
 * const violation: Violation = {
 *   ruleId: 'SPRING_PROFILE_DEV_ACTIVE',
 *   severity: Severity.HIGH,
 *   message: 'Development profile is active in production configuration',
 *   filePath: '/app/application.yml',
 *   configKey: 'spring.profiles.active',
 *   configValue: 'dev',
 *   suggestion: 'Remove or change spring.profiles.active to a production profile',
 * };
 * ```
 */
export interface Violation {
    /**
     * Unique identifier for the rule that generated this violation.
     * Format: SCREAMING_SNAKE_CASE
     * Examples: "SPRING_PROFILE_DEV_ACTIVE", "DEBUG_LOGGING_ENABLED"
     *
     * Why?
     * - Enables filtering/suppression by rule ID
     * - Allows tracking violation trends over time
     * - Provides stable reference for documentation
     */
    readonly ruleId: string;
    /**
     * The severity level of this violation.
     * Determines whether the violation causes CI failure based on --fail-on threshold.
     */
    readonly severity: Severity;
    /**
     * Human-readable description of the violation.
     * Should be clear and actionable.
     */
    readonly message: string;
    /**
     * Absolute path to the file containing the violation.
     */
    readonly filePath: string;
    /**
     * The configuration key that triggered the violation.
     * Examples: "spring.profiles.active", "logging.level.root"
     */
    readonly configKey: string;
    /**
     * The actual value that caused the violation.
     */
    readonly configValue: string;
    /**
     * Optional line number where the violation occurs.
     */
    readonly lineNumber?: number | undefined;
    /**
     * Actionable suggestion for fixing the violation.
     * Should tell the user exactly what to do.
     */
    readonly suggestion: string;
}
/**
 * Factory function to create a Violation.
 * Ensures all required fields are provided and properly typed.
 *
 * @param params - Violation parameters
 * @returns A new immutable Violation object
 */
export declare function createViolation(params: {
    ruleId: string;
    severity: Severity;
    message: string;
    filePath: string;
    configKey: string;
    configValue: string;
    lineNumber?: number | undefined;
    suggestion: string;
}): Violation;
//# sourceMappingURL=violation.d.ts.map
/**
 * ============================================================================
 * DETAILED ERRORS ENABLED RULE (.NET)
 * ============================================================================
 *
 * Detects when detailed errors are enabled in web.config or appsettings.json.
 *
 * Security Rationale:
 * - Detailed errors expose:
 *   - Stack traces
 *   - File paths
 *   - Database connection strings
 *   - Internal application structure
 * - Should only be enabled in development
 *
 * This is a HIGH severity issue.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects detailed errors enabled in .NET applications.
 */
export declare const dotnetDetailedErrorsRule: Rule;
//# sourceMappingURL=detailed-errors.rule.d.ts.map
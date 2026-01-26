/**
 * ============================================================================
 * DEVELOPER EXCEPTION PAGE ENABLED RULE (.NET)
 * ============================================================================
 *
 * Detects when developer exception page is enabled in production.
 *
 * Security Rationale:
 * - Developer exception page shows:
 *   - Full stack traces with file paths
 *   - Source code snippets
 *   - Environment variables
 *   - Request headers and cookies
 *   - Database connection strings
 * - This information helps attackers:
 *   - Identify vulnerable code paths
 *   - Find framework/library versions
 *   - Discover internal architecture
 *   - Extract sensitive configuration
 *
 * This is a HIGH severity information disclosure issue.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when developer exception page is enabled.
 */
export declare const developerExceptionPageRule: Rule;
//# sourceMappingURL=developer-exception-page.rule.d.ts.map
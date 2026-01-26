/**
 * ============================================================================
 * ASPNETCORE ENVIRONMENT CHECK RULE
 * ============================================================================
 *
 * Detects when ASPNETCORE_ENVIRONMENT is set to Development.
 *
 * Security Rationale:
 * - Development environment in ASP.NET Core enables:
 *   - Developer exception pages with full stack traces
 *   - Detailed error messages
 *   - Database error pages
 *   - Browser link features
 * - Production environment enables proper error handling and security
 *
 * This is a HIGH severity issue as it exposes debugging information.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects Development environment in ASP.NET Core.
 */
export declare const aspnetcoreEnvironmentRule: Rule;
//# sourceMappingURL=aspnetcore-environment.rule.d.ts.map
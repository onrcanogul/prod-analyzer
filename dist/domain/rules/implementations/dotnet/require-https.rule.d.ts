/**
 * ============================================================================
 * HTTPS REDIRECTION DISABLED RULE (.NET)
 * ============================================================================
 *
 * Detects when HTTPS redirection is disabled in ASP.NET Core.
 *
 * Security Rationale:
 * - HTTPS redirection ensures all traffic uses encryption
 * - Without it:
 *   - Credentials sent in plain text
 *   - Session tokens intercepted
 *   - Man-in-the-middle attacks succeed
 *   - Data tampering possible
 * - Users may accidentally use HTTP instead of HTTPS
 * - Automatic redirection is a critical security control
 *
 * This is a HIGH severity issue for production applications.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when HTTPS redirection is disabled.
 */
export declare const requireHttpsRule: Rule;
//# sourceMappingURL=require-https.rule.d.ts.map
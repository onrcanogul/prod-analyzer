/**
 * ============================================================================
 * HTTP-ONLY COOKIE DISABLED RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when HTTP-only flag is disabled for session cookies.
 *
 * Security Rationale:
 * - HTTP-only cookies cannot be accessed by JavaScript
 * - This prevents XSS attacks from stealing session tokens
 * - Without HTTP-only:
 *   - XSS can steal session cookies
 *   - Session hijacking becomes trivial
 *   - User accounts can be compromised
 *
 * This is a HIGH severity issue as it enables session theft.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when HTTP-only flag is disabled for cookies.
 */
export declare const httpOnlyCookieRule: Rule;
//# sourceMappingURL=http-only-cookie.rule.d.ts.map
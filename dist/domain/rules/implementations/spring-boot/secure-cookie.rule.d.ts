/**
 * ============================================================================
 * SECURE COOKIE DISABLED RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when Secure flag is disabled for session cookies.
 *
 * Security Rationale:
 * - Secure flag ensures cookies are only sent over HTTPS
 * - Without it, cookies can be transmitted over HTTP
 * - Man-in-the-middle attacks can intercept:
 *   - Session tokens
 *   - Authentication credentials
 *   - User data
 * - Essential for production HTTPS deployments
 *
 * This is a HIGH severity issue for applications using HTTPS.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when Secure flag is disabled for cookies.
 */
export declare const secureCookieRule: Rule;
//# sourceMappingURL=secure-cookie.rule.d.ts.map
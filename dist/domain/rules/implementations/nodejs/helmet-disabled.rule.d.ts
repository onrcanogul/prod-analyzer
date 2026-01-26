/**
 * ============================================================================
 * HELMET DISABLED RULE (Node.js/Express)
 * ============================================================================
 *
 * Detects when Helmet.js security middleware is disabled.
 *
 * Security Rationale:
 * - Helmet.js sets crucial HTTP security headers:
 *   - X-Frame-Options (prevents clickjacking)
 *   - X-Content-Type-Options (prevents MIME sniffing)
 *   - Strict-Transport-Security (enforces HTTPS)
 *   - X-XSS-Protection (enables browser XSS filter)
 *   - Content-Security-Policy (prevents XSS/injection)
 * - Without these headers:
 *   - Application is vulnerable to XSS
 *   - Clickjacking attacks possible
 *   - MIME-type attacks possible
 *
 * This is a MEDIUM severity defense-in-depth issue.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when Helmet security middleware is disabled.
 */
export declare const helmetDisabledRule: Rule;
//# sourceMappingURL=helmet-disabled.rule.d.ts.map
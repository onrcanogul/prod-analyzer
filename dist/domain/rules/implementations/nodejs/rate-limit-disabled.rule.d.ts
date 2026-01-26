/**
 * ============================================================================
 * RATE LIMITING DISABLED RULE (Node.js)
 * ============================================================================
 *
 * Detects when rate limiting is explicitly disabled.
 *
 * Security Rationale:
 * - Rate limiting prevents:
 *   - Brute force attacks (password guessing)
 *   - DoS attacks (overwhelming the server)
 *   - API abuse (scraping, data theft)
 *   - Resource exhaustion
 * - Without rate limiting:
 *   - Attackers can make unlimited requests
 *   - Credential stuffing attacks succeed
 *   - Application becomes unstable under load
 *
 * This is a HIGH severity issue for public-facing APIs.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when rate limiting is disabled.
 */
export declare const rateLimitDisabledRule: Rule;
//# sourceMappingURL=rate-limit-disabled.rule.d.ts.map
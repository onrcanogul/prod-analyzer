/**
 * ============================================================================
 * CORS MISCONFIGURATION RULE (Node.js)
 * ============================================================================
 *
 * Detects when CORS is configured to allow all origins (*).
 *
 * Security Rationale:
 * - CORS wildcard (*) allows any website to make requests to your API
 * - This can lead to:
 *   - CSRF attacks
 *   - Data theft
 *   - Unauthorized API access
 * - Credentials cannot be sent with wildcard CORS
 *
 * This is a HIGH severity issue as it directly affects API security.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects CORS wildcard configuration.
 */
export declare const corsWildcardRule: Rule;
//# sourceMappingURL=cors-wildcard.rule.d.ts.map
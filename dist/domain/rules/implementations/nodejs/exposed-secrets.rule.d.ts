/**
 * ============================================================================
 * EXPOSED SECRETS RULE (Node.js)
 * ============================================================================
 *
 * Detects potential secrets or API keys in configuration files.
 *
 * Security Rationale:
 * - .env files should NEVER be committed to version control
 * - Exposed secrets can lead to:
 *   - Unauthorized API access
 *   - Database breaches
 *   - Account takeover
 *   - Financial loss
 *
 * This is a CRITICAL severity issue as it directly exposes credentials.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects potential secrets with weak or placeholder values.
 */
export declare const exposedSecretsRule: Rule;
//# sourceMappingURL=exposed-secrets.rule.d.ts.map
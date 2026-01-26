/**
 * ============================================================================
 * CSRF PROTECTION DISABLED RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when CSRF (Cross-Site Request Forgery) protection is disabled.
 *
 * Security Rationale:
 * - CSRF protection prevents unauthorized actions from malicious websites
 * - Disabling CSRF allows attackers to:
 *   - Execute state-changing operations
 *   - Transfer funds, change passwords, delete data
 *   - Perform actions on behalf of authenticated users
 * - Should ONLY be disabled for stateless APIs (REST with JWT)
 *
 * This is a HIGH severity issue for web applications with sessions.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when CSRF protection is disabled.
 */
export declare const csrfDisabledRule: Rule;
//# sourceMappingURL=csrf-disabled.rule.d.ts.map
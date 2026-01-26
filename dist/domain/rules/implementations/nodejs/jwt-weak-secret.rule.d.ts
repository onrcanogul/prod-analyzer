/**
 * ============================================================================
 * JWT WEAK SECRET RULE (Node.js)
 * ============================================================================
 *
 * Detects weak JWT signing secrets.
 *
 * Security Rationale:
 * - JWT tokens are signed with a secret to prevent tampering
 * - Weak secrets can be brute-forced, allowing:
 *   - Token forgery (create fake authentication tokens)
 *   - Privilege escalation (modify user roles/claims)
 *   - Complete authentication bypass
 * - Minimum secret length should be 256 bits (32 characters)
 * - Should use cryptographically random values
 *
 * This is a CRITICAL severity issue as it breaks authentication.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects weak JWT signing secrets.
 */
export declare const jwtWeakSecretRule: Rule;
//# sourceMappingURL=jwt-weak-secret.rule.d.ts.map
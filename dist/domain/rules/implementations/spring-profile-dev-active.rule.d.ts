/**
 * ============================================================================
 * SPRING PROFILE DEV ACTIVE RULE
 * ============================================================================
 *
 * Detects when development or test profiles are active in production config.
 *
 * Security Rationale:
 * Development profiles often enable:
 * - Debug endpoints
 * - Relaxed security settings
 * - Mock services instead of real ones
 * - Verbose logging that may leak sensitive data
 *
 * This is a HIGH severity issue because it fundamentally changes
 * application behavior in ways that are inappropriate for production.
 */
import { Rule } from '../../models/rule';
/**
 * Rule: Detects development/test profiles active in production.
 *
 * Triggers when spring.profiles.active contains dev, test, or similar values.
 */
export declare const springProfileDevActiveRule: Rule;
//# sourceMappingURL=spring-profile-dev-active.rule.d.ts.map
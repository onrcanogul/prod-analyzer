/**
 * ============================================================================
 * EXPOSED STACK TRACE RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when stack traces are exposed in error responses.
 *
 * Security Rationale:
 * - Stack traces reveal:
 *   - Internal code structure and file paths
 *   - Framework versions (helps identify vulnerabilities)
 *   - Database structure and queries
 *   - Third-party libraries and dependencies
 * - This information aids attackers in:
 *   - Finding vulnerable dependencies
 *   - Understanding application logic
 *   - Crafting targeted attacks
 *
 * This is a MEDIUM severity information disclosure issue.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when stack traces are exposed in error responses.
 */
export declare const exposedStackTraceRule: Rule;
//# sourceMappingURL=exposed-stack-trace.rule.d.ts.map
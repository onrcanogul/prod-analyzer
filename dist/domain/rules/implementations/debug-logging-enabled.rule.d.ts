/**
 * ============================================================================
 * DEBUG LOGGING ENABLED RULE
 * ============================================================================
 *
 * Detects when DEBUG or TRACE logging levels are enabled in production.
 *
 * Security Rationale:
 * Debug logging can expose:
 * - Stack traces with internal implementation details
 * - SQL queries with parameter values
 * - Request/response bodies including credentials
 * - Internal state information useful for attackers
 * - PII and sensitive business data
 *
 * Performance Impact:
 * Debug logging also severely impacts performance and can fill
 * disk space rapidly, potentially causing denial of service.
 */
import { Rule } from '../../models/rule';
/**
 * Rule: Detects DEBUG/TRACE logging levels in production.
 *
 * Triggers when logging.level.root is set to DEBUG, TRACE, or ALL.
 */
export declare const debugLoggingEnabledRule: Rule;
//# sourceMappingURL=debug-logging-enabled.rule.d.ts.map
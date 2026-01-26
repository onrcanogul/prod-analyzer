/**
 * ============================================================================
 * DEBUG MODE ENABLED RULE (Node.js)
 * ============================================================================
 *
 * Detects when DEBUG or similar debug flags are enabled.
 *
 * Security Rationale:
 * - Debug mode in Node.js can expose:
 *   - Internal application structure
 *   - Database queries
 *   - API call details
 *   - Memory dumps
 * - Popular debug libraries (debug, winston, bunyan) use these flags
 *
 * This is a MEDIUM severity issue as it mainly affects logging verbosity.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects debug mode enabled in Node.js applications.
 */
export declare const nodejsDebugEnabledRule: Rule;
//# sourceMappingURL=debug-enabled.rule.d.ts.map
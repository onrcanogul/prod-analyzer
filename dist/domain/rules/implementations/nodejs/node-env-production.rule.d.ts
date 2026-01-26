/**
 * ============================================================================
 * NODE_ENV PRODUCTION CHECK RULE
 * ============================================================================
 *
 * Detects when NODE_ENV is not set to 'production' in production environments.
 *
 * Security Rationale:
 * - Many Node.js frameworks (Express, Next.js, etc.) behave differently based on NODE_ENV
 * - Development mode often enables:
 *   - Detailed error stack traces exposed to clients
 *   - Hot reloading / file watching
 *   - Disabled caching
 *   - Verbose logging
 * - Production mode enables optimizations and security hardening
 *
 * This is a HIGH severity issue because it affects application behavior
 * and may expose sensitive debugging information.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when NODE_ENV is not set to production.
 */
export declare const nodeEnvProductionRule: Rule;
//# sourceMappingURL=node-env-production.rule.d.ts.map
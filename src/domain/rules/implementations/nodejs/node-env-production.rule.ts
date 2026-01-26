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

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const TARGET_KEY = 'node.env'; // Lowercase dot notation (env-parser converts to this)
const PRODUCTION_VALUES = ['production', 'prod'];

/**
 * Rule: Detects when NODE_ENV is not set to production.
 */
export const nodeEnvProductionRule: Rule = {
  id: 'NODE_ENV_NOT_PRODUCTION',
  name: 'NODE_ENV Not Set to Production',
  description:
    'Detects when NODE_ENV is not set to "production". ' +
    'Many Node.js frameworks enable debug features, disable caching, ' +
    'and expose detailed errors when NODE_ENV is not "production".',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.NODEJS],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.key !== TARGET_KEY) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    if (!PRODUCTION_VALUES.includes(normalizedValue)) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            `NODE_ENV is set to "${entry.value}" instead of "production". ` +
            `This may enable debug features and expose sensitive error details.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Set NODE_ENV=production in your production environment. ` +
            `This enables performance optimizations and disables debug features. ` +
            `Never commit .env files - use environment variables or secret management tools.`,
        }),
      ];
    }

    return [];
  },
};

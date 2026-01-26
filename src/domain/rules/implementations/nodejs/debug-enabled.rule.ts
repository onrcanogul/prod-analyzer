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

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

// env-parser converts UPPER_SNAKE_CASE to dot.notation lowercase
const DEBUG_KEYS = ['debug', 'log.level', 'logging.level'];
const DANGEROUS_VALUES = ['debug', 'trace', 'verbose', '*', 'true', '1'];

/**
 * Rule: Detects debug mode enabled in Node.js applications.
 */
export const nodejsDebugEnabledRule: Rule = {
  id: 'NODEJS_DEBUG_ENABLED',
  name: 'Debug Mode Enabled',
  description:
    'Detects when debug logging or debug mode is enabled. ' +
    'This may expose sensitive application internals and performance data.',
  defaultSeverity: Severity.MEDIUM,
  targetKeys: DEBUG_KEYS,
  platforms: [Platform.NODEJS],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (!DEBUG_KEYS.includes(entry.key)) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    if (DANGEROUS_VALUES.includes(normalizedValue)) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            `Debug logging is enabled via ${entry.key}="${entry.value}". ` +
            `This may expose sensitive application details in logs.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Set ${entry.key} to "info", "warn", or "error" in production. ` +
            `Remove DEBUG=* wildcards. If you need debug logs for specific modules, ` +
            `use namespaced debugging (e.g., DEBUG=app:auth) and ensure no sensitive data is logged.`,
        }),
      ];
    }

    return [];
  },
};

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

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'logging.level.root';

/**
 * Logging levels that are too verbose for production.
 */
const DANGEROUS_LEVELS = ['debug', 'trace', 'all'] as const;

/**
 * Rule: Detects DEBUG/TRACE logging levels in production.
 * 
 * Triggers when logging.level.root is set to DEBUG, TRACE, or ALL.
 */
export const debugLoggingEnabledRule: Rule = {
  id: 'DEBUG_LOGGING_ENABLED',
  name: 'Debug Logging Enabled',
  description:
    'Detects when DEBUG or TRACE logging levels are enabled. ' +
    'Verbose logging can expose sensitive data including credentials, ' +
    'PII, and internal implementation details.',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.SPRING_BOOT],
  
  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.key !== TARGET_KEY) {
      return [];
    }
    
    const normalizedValue = entry.value.toLowerCase().trim();
    
    if (DANGEROUS_LEVELS.includes(normalizedValue as typeof DANGEROUS_LEVELS[number])) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message: 
            `Root logging level is set to "${entry.value}". ` +
            `This may expose sensitive data in logs.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Change "${TARGET_KEY}" to INFO, WARN, or ERROR for production. ` +
            `If you need detailed logs for specific packages, configure them ` +
            `individually (e.g., logging.level.com.myapp=DEBUG) and ensure ` +
            `they don't log sensitive data.`,
        }),
      ];
    }
    
    return [];
  },
};

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

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'spring.profiles.active';

/**
 * Profile values that indicate non-production configuration.
 * Case-insensitive matching is applied.
 */
const DANGEROUS_PROFILES = ['dev', 'development', 'test', 'testing', 'local'] as const;

/**
 * Rule: Detects development/test profiles active in production.
 * 
 * Triggers when spring.profiles.active contains dev, test, or similar values.
 */
export const springProfileDevActiveRule: Rule = {
  id: 'SPRING_PROFILE_DEV_ACTIVE',
  name: 'Development Profile Active',
  description: 
    'Detects when development or test Spring profiles are active. ' +
    'These profiles often enable debug features, relaxed security, ' +
    'and mock services that are inappropriate for production.',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.SPRING_BOOT],
  
  evaluate(entry: ConfigEntry): readonly Violation[] {
    // Only process the target key
    if (entry.key !== TARGET_KEY) {
      return [];
    }
    
    const normalizedValue = entry.value.toLowerCase().trim();
    
    // Check if any dangerous profile is present
    // Profiles can be comma-separated, so we split and check each
    const activeProfiles = normalizedValue.split(',').map(p => p.trim());
    
    for (const profile of activeProfiles) {
      if (DANGEROUS_PROFILES.includes(profile as typeof DANGEROUS_PROFILES[number])) {
        return [
          createViolation({
            ruleId: this.id,
            severity: this.defaultSeverity,
            message: `Non-production profile "${profile}" is active. ` +
                     `This may enable debug features and relaxed security settings.`,
            filePath: entry.sourceFile,
            configKey: entry.key,
            configValue: entry.value,
            lineNumber: entry.lineNumber,
            suggestion: 
              `Remove or change "${TARGET_KEY}" to a production profile ` +
              `(e.g., "prod", "production"). If you need environment-specific ` +
              `configuration, use environment variables instead.`,
          }),
        ];
      }
    }
    
    return [];
  },
};

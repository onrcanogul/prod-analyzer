/**
 * ============================================================================
 * CSRF PROTECTION DISABLED RULE (Spring Boot)
 * ============================================================================
 * 
 * Detects when CSRF (Cross-Site Request Forgery) protection is disabled.
 * 
 * Security Rationale:
 * - CSRF protection prevents unauthorized actions from malicious websites
 * - Disabling CSRF allows attackers to:
 *   - Execute state-changing operations
 *   - Transfer funds, change passwords, delete data
 *   - Perform actions on behalf of authenticated users
 * - Should ONLY be disabled for stateless APIs (REST with JWT)
 * 
 * This is a HIGH severity issue for web applications with sessions.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const TARGET_KEY = 'spring.security.csrf.enabled';
const DANGEROUS_VALUE = 'false';

/**
 * Rule: Detects when CSRF protection is disabled.
 */
export const csrfDisabledRule: Rule = {
  id: 'SPRING_CSRF_DISABLED',
  name: 'CSRF Protection Disabled',
  description:
    'Detects when Cross-Site Request Forgery (CSRF) protection is disabled. ' +
    'This leaves the application vulnerable to CSRF attacks.',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.SPRING_BOOT],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.key !== TARGET_KEY) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    if (normalizedValue === DANGEROUS_VALUE) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            'CSRF protection is disabled. This makes the application vulnerable to ' +
            'Cross-Site Request Forgery attacks.',
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            'Enable CSRF protection by removing this configuration or setting it to "true". ' +
            'Only disable CSRF for stateless REST APIs that use token-based authentication ' +
            '(JWT, OAuth2) instead of sessions. For web applications with cookies/sessions, ' +
            'CSRF protection is essential.',
        }),
      ];
    }

    return [];
  },
};

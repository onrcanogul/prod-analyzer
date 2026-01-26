/**
 * ============================================================================
 * SECURE COOKIE DISABLED RULE (Spring Boot)
 * ============================================================================
 * 
 * Detects when Secure flag is disabled for session cookies.
 * 
 * Security Rationale:
 * - Secure flag ensures cookies are only sent over HTTPS
 * - Without it, cookies can be transmitted over HTTP
 * - Man-in-the-middle attacks can intercept:
 *   - Session tokens
 *   - Authentication credentials
 *   - User data
 * - Essential for production HTTPS deployments
 * 
 * This is a HIGH severity issue for applications using HTTPS.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const TARGET_KEYS = [
  'server.servlet.session.cookie.secure',
  'server.session.cookie.secure',
];

/**
 * Rule: Detects when Secure flag is disabled for cookies.
 */
export const secureCookieRule: Rule = {
  id: 'SPRING_SECURE_COOKIE_DISABLED',
  name: 'Secure Cookie Flag Disabled',
  description:
    'Detects when Secure flag is disabled for session cookies, ' +
    'allowing them to be transmitted over unencrypted HTTP connections.',
  defaultSeverity: Severity.HIGH,
  targetKeys: TARGET_KEYS,
  platforms: [Platform.SPRING_BOOT],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (!TARGET_KEYS.includes(entry.key)) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    if (normalizedValue === 'false') {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            'Secure flag is disabled for session cookies. ' +
            'This allows cookies to be transmitted over unencrypted HTTP, ' +
            'exposing them to man-in-the-middle attacks.',
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Set "${entry.key}" to "true" to ensure cookies are only sent over HTTPS. ` +
            'This prevents session tokens from being intercepted in network traffic. ' +
            'If you are deploying to production with HTTPS (which you should be), ' +
            'this flag is essential.',
        }),
      ];
    }

    return [];
  },
};

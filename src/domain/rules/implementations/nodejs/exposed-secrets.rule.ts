/**
 * ============================================================================
 * EXPOSED SECRETS RULE (Node.js)
 * ============================================================================
 * 
 * Detects potential secrets or API keys in configuration files.
 * 
 * Security Rationale:
 * - .env files should NEVER be committed to version control
 * - Exposed secrets can lead to:
 *   - Unauthorized API access
 *   - Database breaches
 *   - Account takeover
 *   - Financial loss
 * 
 * This is a CRITICAL severity issue as it directly exposes credentials.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

// Common secret key patterns (lowercase, env-parser converts to dot.notation)
const SECRET_KEY_PATTERNS = [
  'api.key',
  'secret',
  'password',
  'token',
  'private.key',
  'aws.access.key',
  'aws.secret',
  'database.url',
  'db.password',
  'stripe.secret',
  'jwt.secret',
  'session.secret',
];

/**
 * Rule: Detects potential secrets with weak or placeholder values.
 */
export const exposedSecretsRule: Rule = {
  id: 'EXPOSED_SECRETS',
  name: 'Weak or Placeholder Secrets',
  description:
    'Detects secrets with weak, default, or placeholder values. ' +
    'Secrets should be strong, randomly generated, and stored securely.',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: SECRET_KEY_PATTERNS,
  platforms: [Platform.NODEJS, Platform.DOTNET],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    // Check if key matches any secret pattern (case-insensitive check)
    const isSecretKey = SECRET_KEY_PATTERNS.some(pattern =>
      entry.key.toLowerCase().includes(pattern)
    );

    if (!isSecretKey) {
      return [];
    }

    const value = entry.value.trim();
    
    // Check for weak/placeholder values
    const weakPatterns = [
      /^(test|example|placeholder|changeme|default|admin|password|secret|demo)/i,
      /^(123|abc|xxx|yyy|zzz)/i,
      /^.{1,8}$/, // Too short (< 8 chars)
    ];

    const isWeak = weakPatterns.some(pattern => pattern.test(value));

    if (isWeak) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            `Secret "${entry.key}" has a weak or placeholder value. ` +
            `This is a critical security risk.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: '***REDACTED***', // Don't expose the actual secret
          lineNumber: entry.lineNumber,
          suggestion:
            `Generate a strong, random secret (at least 32 characters). ` +
            `Use a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.) ` +
            `or environment variables. NEVER commit secrets to version control. ` +
            `Add .env* to your .gitignore file.`,
        }),
      ];
    }

    return [];
  },
};

/**
 * ============================================================================
 * CONNECTION STRING EXPOSURE RULE (.NET)
 * ============================================================================
 * 
 * Detects when connection strings contain sensitive information in plain text.
 * 
 * Security Rationale:
 * - Connection strings often contain:
 *   - Database credentials
 *   - Server addresses
 *   - Encryption keys
 * - Should use secure configuration providers (Azure Key Vault, AWS Secrets Manager)
 * - Should not be committed to source control
 * 
 * This is a CRITICAL severity issue.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const CONNECTION_STRING_PATTERNS = [
  'ConnectionStrings',
  'connectionString',
  'Data Source',
  'Server=',
  'Database=',
];

/**
 * Rule: Detects exposed connection strings in .NET configuration.
 */
export const connectionStringExposureRule: Rule = {
  id: 'DOTNET_CONNECTION_STRING_EXPOSED',
  name: 'Connection String Exposed',
  description:
    'Detects plain text connection strings in configuration files. ' +
    'Connection strings should be stored in secure configuration providers.',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: ['*'], // Check all keys for connection string patterns
  platforms: [Platform.DOTNET],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    // Check if key or value contains connection string patterns
    const keyContainsPattern = CONNECTION_STRING_PATTERNS.some(pattern =>
      entry.key.includes(pattern)
    );
    
    const valueContainsPattern = CONNECTION_STRING_PATTERNS.some(pattern =>
      entry.value.includes(pattern)
    );

    if (!keyContainsPattern && !valueContainsPattern) {
      return [];
    }

    // Check for weak password patterns in connection string
    const weakPasswordPatterns = [
      /password=.*;/i,
      /pwd=.*;/i,
      /password=(admin|root|sa|password|123)/i,
      /Integrated Security=false/i,
    ];

    const hasWeakPassword = weakPasswordPatterns.some(pattern =>
      pattern.test(entry.value)
    );

    if (hasWeakPassword || keyContainsPattern) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            `Connection string detected in plain text configuration. ` +
            `This is a critical security risk.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: '***REDACTED***', // Don't expose the connection string
          lineNumber: entry.lineNumber,
          suggestion:
            `Move connection strings to secure configuration providers: ` +
            `1. Azure Key Vault for Azure deployments ` +
            `2. AWS Secrets Manager for AWS deployments ` +
            `3. User Secrets for local development (dotnet user-secrets) ` +
            `4. Environment variables with encryption ` +
            `Never commit connection strings to source control. ` +
            `Use Integrated Security or Managed Identity when possible.`,
        }),
      ];
    }

    return [];
  },
};

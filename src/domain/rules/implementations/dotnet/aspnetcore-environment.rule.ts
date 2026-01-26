/**
 * ============================================================================
 * ASPNETCORE ENVIRONMENT CHECK RULE
 * ============================================================================
 * 
 * Detects when ASPNETCORE_ENVIRONMENT is set to Development.
 * 
 * Security Rationale:
 * - Development environment in ASP.NET Core enables:
 *   - Developer exception pages with full stack traces
 *   - Detailed error messages
 *   - Database error pages
 *   - Browser link features
 * - Production environment enables proper error handling and security
 * 
 * This is a HIGH severity issue as it exposes debugging information.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const TARGET_KEY = 'ASPNETCORE_ENVIRONMENT';
const DANGEROUS_VALUES = ['development', 'dev', 'local', 'test'];

/**
 * Rule: Detects Development environment in ASP.NET Core.
 */
export const aspnetcoreEnvironmentRule: Rule = {
  id: 'ASPNETCORE_ENVIRONMENT_DEVELOPMENT',
  name: 'ASP.NET Core Development Environment',
  description:
    'Detects when ASPNETCORE_ENVIRONMENT is set to Development. ' +
    'This enables developer exception pages and detailed error messages.',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.DOTNET],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.key !== TARGET_KEY) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    if (DANGEROUS_VALUES.includes(normalizedValue)) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            `ASPNETCORE_ENVIRONMENT is set to "${entry.value}". ` +
            `This enables developer exception pages and exposes sensitive error details.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Set ASPNETCORE_ENVIRONMENT to "Production" in production environments. ` +
            `This disables developer exception pages and enables proper error handling. ` +
            `Use structured logging and error tracking services (Serilog, Application Insights) instead.`,
        }),
      ];
    }

    return [];
  },
};

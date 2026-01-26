/**
 * ============================================================================
 * DEVELOPER EXCEPTION PAGE ENABLED RULE (.NET)
 * ============================================================================
 * 
 * Detects when developer exception page is enabled in production.
 * 
 * Security Rationale:
 * - Developer exception page shows:
 *   - Full stack traces with file paths
 *   - Source code snippets
 *   - Environment variables
 *   - Request headers and cookies
 *   - Database connection strings
 * - This information helps attackers:
 *   - Identify vulnerable code paths
 *   - Find framework/library versions
 *   - Discover internal architecture
 *   - Extract sensitive configuration
 * 
 * This is a HIGH severity information disclosure issue.
 */

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

const TARGET_KEYS = [
  'UseDeveloperExceptionPage',
  'DeveloperExceptionPage',
];

/**
 * Rule: Detects when developer exception page is enabled.
 */
export const developerExceptionPageRule: Rule = {
  id: 'DOTNET_DEVELOPER_EXCEPTION_PAGE',
  name: 'Developer Exception Page Enabled',
  description:
    'Detects when ASP.NET Core developer exception page is enabled, ' +
    'exposing detailed error information including source code and environment variables.',
  defaultSeverity: Severity.HIGH,
  targetKeys: TARGET_KEYS,
  platforms: [Platform.DOTNET],

  evaluate(entry: ConfigEntry): readonly Violation[] {
    const isDeveloperExceptionKey = TARGET_KEYS.some(key =>
      entry.key.toLowerCase().includes(key.toLowerCase())
    );

    if (!isDeveloperExceptionKey) {
      return [];
    }

    const normalizedValue = entry.value.toLowerCase().trim();

    // Check for "true" or "1" (enabled)
    if (normalizedValue === 'true' || normalizedValue === '1') {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            'Developer exception page is enabled. ' +
            'This exposes detailed error information including stack traces, source code, and environment variables.',
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            'Disable developer exception page in production. ' +
            'Use app.UseExceptionHandler("/Error") instead of app.UseDeveloperExceptionPage(). ' +
            'Only enable developer exception page in Development environment: ' +
            'if (env.IsDevelopment()) { app.UseDeveloperExceptionPage(); }. ' +
            'Log detailed errors server-side but show generic error pages to users.',
        }),
      ];
    }

    return [];
  },
};

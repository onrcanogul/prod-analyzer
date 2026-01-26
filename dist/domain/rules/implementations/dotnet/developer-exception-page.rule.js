"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.developerExceptionPageRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEYS = [
    'UseDeveloperExceptionPage',
    'DeveloperExceptionPage',
];
/**
 * Rule: Detects when developer exception page is enabled.
 */
exports.developerExceptionPageRule = {
    id: 'DOTNET_DEVELOPER_EXCEPTION_PAGE',
    name: 'Developer Exception Page Enabled',
    description: 'Detects when ASP.NET Core developer exception page is enabled, ' +
        'exposing detailed error information including source code and environment variables.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: TARGET_KEYS,
    platforms: [platform_1.Platform.DOTNET],
    evaluate(entry) {
        const isDeveloperExceptionKey = TARGET_KEYS.some(key => entry.key.toLowerCase().includes(key.toLowerCase()));
        if (!isDeveloperExceptionKey) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        // Check for "true" or "1" (enabled)
        if (normalizedValue === 'true' || normalizedValue === '1') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'Developer exception page is enabled. ' +
                        'This exposes detailed error information including stack traces, source code, and environment variables.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: 'Disable developer exception page in production. ' +
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
//# sourceMappingURL=developer-exception-page.rule.js.map
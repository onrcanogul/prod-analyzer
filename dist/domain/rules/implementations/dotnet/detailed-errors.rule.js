"use strict";
/**
 * ============================================================================
 * DETAILED ERRORS ENABLED RULE (.NET)
 * ============================================================================
 *
 * Detects when detailed errors are enabled in web.config or appsettings.json.
 *
 * Security Rationale:
 * - Detailed errors expose:
 *   - Stack traces
 *   - File paths
 *   - Database connection strings
 *   - Internal application structure
 * - Should only be enabled in development
 *
 * This is a HIGH severity issue.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotnetDetailedErrorsRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const DETAILED_ERROR_KEYS = [
    'customErrors',
    'Logging.LogLevel.Default',
    'Logging.LogLevel.Microsoft',
    'DetailedErrors',
];
/**
 * Rule: Detects detailed errors enabled in .NET applications.
 */
exports.dotnetDetailedErrorsRule = {
    id: 'DOTNET_DETAILED_ERRORS_ENABLED',
    name: 'Detailed Errors Enabled',
    description: 'Detects when detailed error messages are enabled. ' +
        'This exposes sensitive application internals including stack traces and file paths.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: DETAILED_ERROR_KEYS,
    platforms: [platform_1.Platform.DOTNET],
    evaluate(entry) {
        if (!DETAILED_ERROR_KEYS.includes(entry.key)) {
            return [];
        }
        const value = entry.value.toLowerCase().trim();
        // customErrors mode="Off" is dangerous
        if (entry.key === 'customErrors' && value === 'off') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: `customErrors is set to "Off". This exposes detailed error pages to users.`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set customErrors mode="On" or mode="RemoteOnly" in web.config. ` +
                        `Use a custom error page and log detailed errors server-side instead.`,
                }),
            ];
        }
        // Logging level set to Debug or Trace
        if (entry.key.includes('LogLevel') && (value === 'debug' || value === 'trace')) {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: severity_1.Severity.MEDIUM,
                    message: `Logging level is set to "${entry.value}". This may expose sensitive data in logs.`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set logging level to "Information", "Warning", or "Error" in production. ` +
                        `Configure specific namespaces if you need detailed logs for certain components.`,
                }),
            ];
        }
        // DetailedErrors = true
        if (entry.key === 'DetailedErrors' && (value === 'true' || value === '1')) {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: `DetailedErrors is enabled. This exposes sensitive error information.`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set DetailedErrors to false in production. ` +
                        `Use structured logging and error tracking instead.`,
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=detailed-errors.rule.js.map
"use strict";
/**
 * ============================================================================
 * HTTPS REDIRECTION DISABLED RULE (.NET)
 * ============================================================================
 *
 * Detects when HTTPS redirection is disabled in ASP.NET Core.
 *
 * Security Rationale:
 * - HTTPS redirection ensures all traffic uses encryption
 * - Without it:
 *   - Credentials sent in plain text
 *   - Session tokens intercepted
 *   - Man-in-the-middle attacks succeed
 *   - Data tampering possible
 * - Users may accidentally use HTTP instead of HTTPS
 * - Automatic redirection is a critical security control
 *
 * This is a HIGH severity issue for production applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHttpsRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEYS = [
    'UseHttpsRedirection',
    'RequireHttps',
    'HttpsRedirection',
];
/**
 * Rule: Detects when HTTPS redirection is disabled.
 */
exports.requireHttpsRule = {
    id: 'DOTNET_HTTPS_REDIRECTION_DISABLED',
    name: 'HTTPS Redirection Disabled',
    description: 'Detects when automatic HTTPS redirection is disabled, ' +
        'allowing unencrypted HTTP connections that expose sensitive data.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: TARGET_KEYS,
    platforms: [platform_1.Platform.DOTNET],
    evaluate(entry) {
        const isHttpsKey = TARGET_KEYS.some(key => entry.key.toLowerCase().includes(key.toLowerCase()));
        if (!isHttpsKey) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        // Check for "false" or "0" (disabled)
        if (normalizedValue === 'false' || normalizedValue === '0') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'HTTPS redirection is disabled. ' +
                        'This allows unencrypted HTTP connections, exposing sensitive data to interception.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: 'Enable HTTPS redirection in production using app.UseHttpsRedirection() in Startup.cs. ' +
                        'This automatically redirects all HTTP requests to HTTPS, ensuring data is encrypted in transit. ' +
                        'Also configure HSTS (HTTP Strict Transport Security) with app.UseHsts() to enforce HTTPS at the browser level. ' +
                        'For production deployments, always use HTTPS certificates (Let\'s Encrypt for free certificates).',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=require-https.rule.js.map
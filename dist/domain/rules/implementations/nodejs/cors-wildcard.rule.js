"use strict";
/**
 * ============================================================================
 * CORS MISCONFIGURATION RULE (Node.js)
 * ============================================================================
 *
 * Detects when CORS is configured to allow all origins (*).
 *
 * Security Rationale:
 * - CORS wildcard (*) allows any website to make requests to your API
 * - This can lead to:
 *   - CSRF attacks
 *   - Data theft
 *   - Unauthorized API access
 * - Credentials cannot be sent with wildcard CORS
 *
 * This is a HIGH severity issue as it directly affects API security.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsWildcardRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
// env-parser converts to lowercase dot.notation
const CORS_KEYS = [
    'cors.origin',
    'cors.allowed.origins',
    'allowed.origins',
    'access.control.allow.origin',
];
/**
 * Rule: Detects CORS wildcard configuration.
 */
exports.corsWildcardRule = {
    id: 'CORS_WILDCARD_ORIGIN',
    name: 'CORS Wildcard Origin',
    description: 'Detects when CORS is configured to allow all origins (*). ' +
        'This allows any website to make requests to your API, ' +
        'potentially leading to CSRF attacks and data theft.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: CORS_KEYS,
    platforms: [platform_1.Platform.NODEJS, platform_1.Platform.DOTNET],
    evaluate(entry) {
        if (!CORS_KEYS.includes(entry.key)) {
            return [];
        }
        const value = entry.value.trim();
        if (value === '*') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: `CORS is configured to allow all origins (*). ` +
                        `This allows any website to make requests to your API.`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Replace "*" with specific allowed origins (e.g., "https://yourdomain.com"). ` +
                        `For multiple origins, use an array or comma-separated list. ` +
                        `If you need dynamic CORS, validate the origin in your application code. ` +
                        `Consider using a CORS middleware with proper configuration.`,
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=cors-wildcard.rule.js.map
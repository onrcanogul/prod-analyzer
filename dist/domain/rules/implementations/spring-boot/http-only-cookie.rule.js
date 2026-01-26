"use strict";
/**
 * ============================================================================
 * HTTP-ONLY COOKIE DISABLED RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when HTTP-only flag is disabled for session cookies.
 *
 * Security Rationale:
 * - HTTP-only cookies cannot be accessed by JavaScript
 * - This prevents XSS attacks from stealing session tokens
 * - Without HTTP-only:
 *   - XSS can steal session cookies
 *   - Session hijacking becomes trivial
 *   - User accounts can be compromised
 *
 * This is a HIGH severity issue as it enables session theft.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpOnlyCookieRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEYS = [
    'server.servlet.session.cookie.http-only',
    'server.session.cookie.http-only',
];
/**
 * Rule: Detects when HTTP-only flag is disabled for cookies.
 */
exports.httpOnlyCookieRule = {
    id: 'SPRING_HTTP_ONLY_COOKIE_DISABLED',
    name: 'HTTP-Only Cookie Disabled',
    description: 'Detects when HTTP-only flag is disabled for session cookies, ' +
        'making them accessible to JavaScript and vulnerable to XSS theft.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: TARGET_KEYS,
    platforms: [platform_1.Platform.SPRING_BOOT],
    evaluate(entry) {
        if (!TARGET_KEYS.includes(entry.key)) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (normalizedValue === 'false') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'HTTP-only flag is disabled for session cookies. ' +
                        'This allows JavaScript to access session tokens, enabling XSS-based session theft.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set "${entry.key}" to "true" (or remove the configuration to use the secure default). ` +
                        'HTTP-only cookies cannot be accessed by JavaScript, preventing XSS attacks from ' +
                        'stealing session tokens. This is a critical security control for session-based authentication.',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=http-only-cookie.rule.js.map
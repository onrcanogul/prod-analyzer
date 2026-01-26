"use strict";
/**
 * ============================================================================
 * CSRF PROTECTION DISABLED RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when CSRF (Cross-Site Request Forgery) protection is disabled.
 *
 * Security Rationale:
 * - CSRF protection prevents unauthorized actions from malicious websites
 * - Disabling CSRF allows attackers to:
 *   - Execute state-changing operations
 *   - Transfer funds, change passwords, delete data
 *   - Perform actions on behalf of authenticated users
 * - Should ONLY be disabled for stateless APIs (REST with JWT)
 *
 * This is a HIGH severity issue for web applications with sessions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfDisabledRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEY = 'spring.security.csrf.enabled';
const DANGEROUS_VALUE = 'false';
/**
 * Rule: Detects when CSRF protection is disabled.
 */
exports.csrfDisabledRule = {
    id: 'SPRING_CSRF_DISABLED',
    name: 'CSRF Protection Disabled',
    description: 'Detects when Cross-Site Request Forgery (CSRF) protection is disabled. ' +
        'This leaves the application vulnerable to CSRF attacks.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: [TARGET_KEY],
    platforms: [platform_1.Platform.SPRING_BOOT],
    evaluate(entry) {
        if (entry.key !== TARGET_KEY) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (normalizedValue === DANGEROUS_VALUE) {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'CSRF protection is disabled. This makes the application vulnerable to ' +
                        'Cross-Site Request Forgery attacks.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: 'Enable CSRF protection by removing this configuration or setting it to "true". ' +
                        'Only disable CSRF for stateless REST APIs that use token-based authentication ' +
                        '(JWT, OAuth2) instead of sessions. For web applications with cookies/sessions, ' +
                        'CSRF protection is essential.',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=csrf-disabled.rule.js.map
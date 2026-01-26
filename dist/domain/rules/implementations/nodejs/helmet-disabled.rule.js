"use strict";
/**
 * ============================================================================
 * HELMET DISABLED RULE (Node.js/Express)
 * ============================================================================
 *
 * Detects when Helmet.js security middleware is disabled.
 *
 * Security Rationale:
 * - Helmet.js sets crucial HTTP security headers:
 *   - X-Frame-Options (prevents clickjacking)
 *   - X-Content-Type-Options (prevents MIME sniffing)
 *   - Strict-Transport-Security (enforces HTTPS)
 *   - X-XSS-Protection (enables browser XSS filter)
 *   - Content-Security-Policy (prevents XSS/injection)
 * - Without these headers:
 *   - Application is vulnerable to XSS
 *   - Clickjacking attacks possible
 *   - MIME-type attacks possible
 *
 * This is a MEDIUM severity defense-in-depth issue.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmetDisabledRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const HELMET_KEYS = [
    'helmet.enabled',
    'security.headers.enabled',
    'use.helmet',
];
/**
 * Rule: Detects when Helmet security middleware is disabled.
 */
exports.helmetDisabledRule = {
    id: 'HELMET_DISABLED',
    name: 'Helmet Security Middleware Disabled',
    description: 'Detects when Helmet.js security middleware is disabled, ' +
        'removing important HTTP security headers that protect against XSS and clickjacking.',
    defaultSeverity: severity_1.Severity.MEDIUM,
    targetKeys: HELMET_KEYS,
    platforms: [platform_1.Platform.NODEJS],
    evaluate(entry) {
        const isHelmetKey = HELMET_KEYS.some(key => entry.key.toLowerCase().includes(key));
        if (!isHelmetKey) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (normalizedValue === 'false') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'Helmet security middleware is disabled. ' +
                        'This removes critical HTTP security headers, increasing vulnerability to XSS and clickjacking.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Enable Helmet by setting "${entry.key}" to "true" or removing this configuration. ` +
                        'Helmet sets essential security headers like X-Frame-Options, X-Content-Type-Options, ' +
                        'and Strict-Transport-Security. Install with: npm install helmet. ' +
                        'Use in Express: app.use(helmet()). These headers provide defense-in-depth against common web attacks.',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=helmet-disabled.rule.js.map
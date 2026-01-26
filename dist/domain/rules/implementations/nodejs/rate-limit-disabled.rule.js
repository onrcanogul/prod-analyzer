"use strict";
/**
 * ============================================================================
 * RATE LIMITING DISABLED RULE (Node.js)
 * ============================================================================
 *
 * Detects when rate limiting is explicitly disabled.
 *
 * Security Rationale:
 * - Rate limiting prevents:
 *   - Brute force attacks (password guessing)
 *   - DoS attacks (overwhelming the server)
 *   - API abuse (scraping, data theft)
 *   - Resource exhaustion
 * - Without rate limiting:
 *   - Attackers can make unlimited requests
 *   - Credential stuffing attacks succeed
 *   - Application becomes unstable under load
 *
 * This is a HIGH severity issue for public-facing APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitDisabledRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const RATE_LIMIT_KEYS = [
    'rate.limit.enabled',
    'rate.limiting.enabled',
    'ratelimit.enabled',
    'throttle.enabled',
];
/**
 * Rule: Detects when rate limiting is disabled.
 */
exports.rateLimitDisabledRule = {
    id: 'RATE_LIMIT_DISABLED',
    name: 'Rate Limiting Disabled',
    description: 'Detects when rate limiting is explicitly disabled, ' +
        'leaving the API vulnerable to brute force and DoS attacks.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: RATE_LIMIT_KEYS,
    platforms: [platform_1.Platform.NODEJS],
    evaluate(entry) {
        const isRateLimitKey = RATE_LIMIT_KEYS.some(key => entry.key.toLowerCase().includes(key));
        if (!isRateLimitKey) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (normalizedValue === 'false' || normalizedValue === '0') {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: 'Rate limiting is disabled. This allows unlimited requests, ' +
                        'enabling brute force attacks, DoS, and API abuse.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Enable rate limiting by setting "${entry.key}" to "true". ` +
                        'Configure appropriate limits based on your use case (e.g., 100 requests per minute). ' +
                        'Use libraries like express-rate-limit or rate-limiter-flexible. ' +
                        'Implement different limits for authenticated vs anonymous users.',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=rate-limit-disabled.rule.js.map
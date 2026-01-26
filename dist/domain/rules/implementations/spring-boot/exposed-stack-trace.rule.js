"use strict";
/**
 * ============================================================================
 * EXPOSED STACK TRACE RULE (Spring Boot)
 * ============================================================================
 *
 * Detects when stack traces are exposed in error responses.
 *
 * Security Rationale:
 * - Stack traces reveal:
 *   - Internal code structure and file paths
 *   - Framework versions (helps identify vulnerabilities)
 *   - Database structure and queries
 *   - Third-party libraries and dependencies
 * - This information aids attackers in:
 *   - Finding vulnerable dependencies
 *   - Understanding application logic
 *   - Crafting targeted attacks
 *
 * This is a MEDIUM severity information disclosure issue.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exposedStackTraceRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEYS = [
    'server.error.include-stacktrace',
    'server.error.include-exception',
    'server.error.include-message',
];
const DANGEROUS_VALUES = ['always', 'on-param', 'true'];
/**
 * Rule: Detects when stack traces are exposed in error responses.
 */
exports.exposedStackTraceRule = {
    id: 'SPRING_STACK_TRACE_EXPOSED',
    name: 'Stack Trace Exposed in Errors',
    description: 'Detects when detailed error information (stack traces, exceptions) ' +
        'is exposed to end users, revealing internal application structure.',
    defaultSeverity: severity_1.Severity.MEDIUM,
    targetKeys: TARGET_KEYS,
    platforms: [platform_1.Platform.SPRING_BOOT],
    evaluate(entry) {
        if (!TARGET_KEYS.includes(entry.key)) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (DANGEROUS_VALUES.includes(normalizedValue)) {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: `Error details are exposed via "${entry.key}=${entry.value}". ` +
                        'This reveals internal application structure and framework details to attackers.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set "${entry.key}" to "never" for production. ` +
                        'Error details should only be visible in logs, not in HTTP responses. ' +
                        'Use a generic error page for end users and log detailed errors server-side ' +
                        'for debugging. This prevents information leakage that aids attackers.',
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=exposed-stack-trace.rule.js.map
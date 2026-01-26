"use strict";
/**
 * ============================================================================
 * HEALTH ENDPOINT DETAILS EXPOSED RULE
 * ============================================================================
 *
 * Detects when health endpoint shows full details to all users.
 *
 * Security Rationale:
 * When show-details=always, the health endpoint reveals:
 * - Database connection details and status
 * - Disk space information
 * - External service connectivity
 * - Custom health indicators with internal state
 *
 * This information helps attackers understand the system architecture
 * and identify potential targets (databases, caches, message queues).
 *
 * Recommended Settings:
 * - "never": Only shows UP/DOWN (safest)
 * - "when-authorized": Shows details only to authenticated users
 * - "always": Shows details to everyone (avoid in production)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthDetailsExposedRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'management.endpoint.health.show-details';
/**
 * The dangerous value that exposes details to everyone.
 */
const DANGEROUS_VALUE = 'always';
/**
 * Rule: Detects when health endpoint details are always shown.
 *
 * This is MEDIUM severity because the information disclosed is
 * less sensitive than full actuator exposure, but still valuable
 * for reconnaissance.
 */
exports.healthDetailsExposedRule = {
    id: 'HEALTH_DETAILS_EXPOSED',
    name: 'Health Endpoint Details Always Shown',
    description: 'Detects when health endpoint details are exposed to all users. ' +
        'This reveals internal system architecture including database ' +
        'connections and external service dependencies.',
    defaultSeverity: severity_1.Severity.MEDIUM,
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
                    message: 'Health endpoint details are visible to all users. ' +
                        'This reveals internal system architecture.',
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Change "${TARGET_KEY}" to "never" or "when-authorized". ` +
                        `If you need health details for monitoring, use ` +
                        `"when-authorized" with proper authentication, or expose ` +
                        `a separate internal endpoint for monitoring systems.`,
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=health-details-exposed.rule.js.map
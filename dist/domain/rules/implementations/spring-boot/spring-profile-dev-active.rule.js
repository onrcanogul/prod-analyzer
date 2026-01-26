"use strict";
/**
 * ============================================================================
 * SPRING PROFILE DEV ACTIVE RULE
 * ============================================================================
 *
 * Detects when development or test profiles are active in production config.
 *
 * Security Rationale:
 * Development profiles often enable:
 * - Debug endpoints
 * - Relaxed security settings
 * - Mock services instead of real ones
 * - Verbose logging that may leak sensitive data
 *
 * This is a HIGH severity issue because it fundamentally changes
 * application behavior in ways that are inappropriate for production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.springProfileDevActiveRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'spring.profiles.active';
/**
 * Profile values that indicate non-production configuration.
 * Case-insensitive matching is applied.
 */
const DANGEROUS_PROFILES = ['dev', 'development', 'test', 'testing', 'local'];
/**
 * Rule: Detects development/test profiles active in production.
 *
 * Triggers when spring.profiles.active contains dev, test, or similar values.
 */
exports.springProfileDevActiveRule = {
    id: 'SPRING_PROFILE_DEV_ACTIVE',
    name: 'Development Profile Active',
    description: 'Detects when development or test Spring profiles are active. ' +
        'These profiles often enable debug features, relaxed security, ' +
        'and mock services that are inappropriate for production.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: [TARGET_KEY],
    platforms: [platform_1.Platform.SPRING_BOOT],
    evaluate(entry) {
        // Only process the target key
        if (entry.key !== TARGET_KEY) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        // Check if any dangerous profile is present
        // Profiles can be comma-separated, so we split and check each
        const activeProfiles = normalizedValue.split(',').map(p => p.trim());
        for (const profile of activeProfiles) {
            if (DANGEROUS_PROFILES.includes(profile)) {
                return [
                    (0, violation_1.createViolation)({
                        ruleId: this.id,
                        severity: this.defaultSeverity,
                        message: `Non-production profile "${profile}" is active. ` +
                            `This may enable debug features and relaxed security settings.`,
                        filePath: entry.sourceFile,
                        configKey: entry.key,
                        configValue: entry.value,
                        lineNumber: entry.lineNumber,
                        suggestion: `Remove or change "${TARGET_KEY}" to a production profile ` +
                            `(e.g., "prod", "production"). If you need environment-specific ` +
                            `configuration, use environment variables instead.`,
                    }),
                ];
            }
        }
        return [];
    },
};
//# sourceMappingURL=spring-profile-dev-active.rule.js.map
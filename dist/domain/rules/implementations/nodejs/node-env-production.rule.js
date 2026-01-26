"use strict";
/**
 * ============================================================================
 * NODE_ENV PRODUCTION CHECK RULE
 * ============================================================================
 *
 * Detects when NODE_ENV is not set to 'production' in production environments.
 *
 * Security Rationale:
 * - Many Node.js frameworks (Express, Next.js, etc.) behave differently based on NODE_ENV
 * - Development mode often enables:
 *   - Detailed error stack traces exposed to clients
 *   - Hot reloading / file watching
 *   - Disabled caching
 *   - Verbose logging
 * - Production mode enables optimizations and security hardening
 *
 * This is a HIGH severity issue because it affects application behavior
 * and may expose sensitive debugging information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeEnvProductionRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const TARGET_KEY = 'node.env'; // Lowercase dot notation (env-parser converts to this)
const PRODUCTION_VALUES = ['production', 'prod'];
/**
 * Rule: Detects when NODE_ENV is not set to production.
 */
exports.nodeEnvProductionRule = {
    id: 'NODE_ENV_NOT_PRODUCTION',
    name: 'NODE_ENV Not Set to Production',
    description: 'Detects when NODE_ENV is not set to "production". ' +
        'Many Node.js frameworks enable debug features, disable caching, ' +
        'and expose detailed errors when NODE_ENV is not "production".',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: [TARGET_KEY],
    platforms: [platform_1.Platform.NODEJS],
    evaluate(entry) {
        if (entry.key !== TARGET_KEY) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (!PRODUCTION_VALUES.includes(normalizedValue)) {
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity: this.defaultSeverity,
                    message: `NODE_ENV is set to "${entry.value}" instead of "production". ` +
                        `This may enable debug features and expose sensitive error details.`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set NODE_ENV=production in your production environment. ` +
                        `This enables performance optimizations and disables debug features. ` +
                        `Never commit .env files - use environment variables or secret management tools.`,
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=node-env-production.rule.js.map
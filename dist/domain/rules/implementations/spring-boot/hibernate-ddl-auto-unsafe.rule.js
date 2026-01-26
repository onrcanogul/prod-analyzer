"use strict";
/**
 * ============================================================================
 * HIBERNATE DDL AUTO UNSAFE RULE
 * ============================================================================
 *
 * Detects when Hibernate is configured to auto-modify database schema.
 *
 * Security Rationale:
 * In production, the database schema should be managed by:
 * - Migration tools (Flyway, Liquibase)
 * - DBA-reviewed scripts
 * - Proper change management processes
 *
 * Dangerous ddl-auto values:
 * - "create": Drops and recreates schema on startup (DATA LOSS)
 * - "create-drop": Creates on start, drops on shutdown (DATA LOSS)
 * - "update": Attempts to update schema (may fail, incomplete changes)
 *
 * Safe values:
 * - "none": No DDL changes (recommended)
 * - "validate": Only validates schema matches entities
 *
 * This is HIGH severity because:
 * - "create" and "create-drop" WILL cause data loss
 * - "update" can leave the database in an inconsistent state
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hibernateDdlAutoUnsafeRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'spring.jpa.hibernate.ddl-auto';
/**
 * DDL-auto values that are dangerous in production.
 */
const DANGEROUS_VALUES = ['create', 'create-drop', 'update'];
/**
 * Rule: Detects unsafe Hibernate DDL auto configuration.
 *
 * Triggers when ddl-auto is set to create, create-drop, or update.
 */
exports.hibernateDdlAutoUnsafeRule = {
    id: 'HIBERNATE_DDL_AUTO_UNSAFE',
    name: 'Unsafe Hibernate DDL Auto',
    description: 'Detects when Hibernate is configured to automatically modify the database schema. ' +
        'Values like "create" and "create-drop" cause data loss. ' +
        '"update" can leave the database in an inconsistent state.',
    defaultSeverity: severity_1.Severity.HIGH,
    targetKeys: [TARGET_KEY],
    platforms: [platform_1.Platform.SPRING_BOOT],
    evaluate(entry) {
        if (entry.key !== TARGET_KEY) {
            return [];
        }
        const normalizedValue = entry.value.toLowerCase().trim();
        if (DANGEROUS_VALUES.includes(normalizedValue)) {
            const isDestructive = normalizedValue === 'create' || normalizedValue === 'create-drop';
            const severity = isDestructive ? severity_1.Severity.CRITICAL : this.defaultSeverity;
            const consequence = isDestructive
                ? 'This WILL cause data loss on application restart.'
                : 'This may leave the database in an inconsistent state.';
            return [
                (0, violation_1.createViolation)({
                    ruleId: this.id,
                    severity,
                    message: `Hibernate ddl-auto is set to "${entry.value}". ${consequence}`,
                    filePath: entry.sourceFile,
                    configKey: entry.key,
                    configValue: entry.value,
                    lineNumber: entry.lineNumber,
                    suggestion: `Set "${TARGET_KEY}" to "none" or "validate" in production. ` +
                        `Use database migration tools (Flyway, Liquibase) for schema changes. ` +
                        `This ensures changes are reviewed, versioned, and reversible.`,
                }),
            ];
        }
        return [];
    },
};
//# sourceMappingURL=hibernate-ddl-auto-unsafe.rule.js.map
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
import { Rule } from '../../models/rule';
/**
 * Rule: Detects unsafe Hibernate DDL auto configuration.
 *
 * Triggers when ddl-auto is set to create, create-drop, or update.
 */
export declare const hibernateDdlAutoUnsafeRule: Rule;
//# sourceMappingURL=hibernate-ddl-auto-unsafe.rule.d.ts.map
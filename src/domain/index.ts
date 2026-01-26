/**
 * ============================================================================
 * DOMAIN LAYER
 * ============================================================================
 * 
 * This layer contains the core business logic of the secure-guard application.
 * It is framework-agnostic and has ZERO external dependencies.
 * 
 * Responsibilities:
 * - Define domain models (Violation, Severity, Rule)
 * - Define rule evaluation logic
 * - Provide rule registry for pluggable rule management
 * 
 * Design Decisions:
 * - Rules are pure functions wrapped in a Rule interface for testability
 * - Severity is an enum with numeric weights for comparison operations
 * - Violations are immutable value objects
 * 
 * This layer should NEVER import from:
 * - Infrastructure layer
 * - CLI layer
 * - Reporting layer
 * 
 * It MAY be imported by:
 * - Application layer
 * - All other layers (read-only access to models)
 */

export * from './models/severity';
export * from './models/violation';
export * from './models/rule';
export * from './models/config-entry';
export * from './models/scan-result';
export * from './models/platform';
export * from './models/scan-profile';
export * from './models/grouped-violations';
export * from './models/license-tier';
export * from './rules/rule-registry';
export * from './rules/implementations';

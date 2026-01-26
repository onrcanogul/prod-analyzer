/**
 * ============================================================================
 * REPORTING LAYER
 * ============================================================================
 *
 * This layer handles all output formatting and presentation.
 *
 * Responsibilities:
 * - Format scan results for console output
 * - Format scan results as JSON
 * - Ensure deterministic, stable output
 *
 * Design Decisions:
 * - Reporters are pure functions (input -> string)
 * - No side effects (callers handle actual output)
 * - Consistent ordering for deterministic output
 * - Separate reporter per format
 *
 * This layer:
 * - Imports from: Domain layer (for models)
 * - Is called by: CLI layer
 * - NEVER modifies data, only formats it
 */
export * from './reporters/console-reporter';
export * from './reporters/json-reporter';
export * from './reporters/sarif-reporter';
export * from './reporters/reporter-factory';
//# sourceMappingURL=index.d.ts.map
/**
 * ============================================================================
 * INFRASTRUCTURE LAYER
 * ============================================================================
 * 
 * This layer handles all external concerns: file system access, file parsing,
 * and other I/O operations.
 * 
 * Responsibilities:
 * - File discovery (finding configuration files)
 * - File parsing (YAML, properties, env files)
 * - Converting raw file content to domain models
 * 
 * Design Decisions:
 * - Parsers are implemented as pure functions for testability
 * - File system operations are isolated for easy mocking
 * - Each file format has its own parser module
 * 
 * This layer:
 * - Depends on: Domain layer (for models)
 * - Is called by: Application layer
 * - NEVER contains business logic
 */

export * from './file-system/file-discovery';
export * from './parsers/yaml-parser';
export * from './parsers/properties-parser';
export * from './parsers/env-parser';
export * from './parsers/config-parser-factory';

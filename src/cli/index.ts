/**
 * ============================================================================
 * CLI LAYER
 * ============================================================================
 * 
 * This layer handles all command-line interface concerns.
 * 
 * Responsibilities:
 * - Parse command-line arguments
 * - Validate user input
 * - Call application services
 * - Handle exit codes
 * - Route to appropriate reporters
 * 
 * Design Decisions:
 * - Uses Commander.js for argument parsing
 * - Zero business logic - only orchestration
 * - Exit codes are determined by application layer results
 * - All output goes through reporting layer
 * 
 * This layer:
 * - Imports from: Application layer, Reporting layer, Domain layer
 * - Is the entry point of the application
 * - NEVER imports from: Infrastructure layer directly
 */

export * from './commands/scan-command';

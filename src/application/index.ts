/**
 * ============================================================================
 * APPLICATION LAYER
 * ============================================================================
 * 
 * This layer orchestrates the scanning process and coordinates between
 * domain and infrastructure layers.
 * 
 * Responsibilities:
 * - Orchestrate the complete scanning workflow
 * - Coordinate rule execution against configuration entries
 * - Aggregate violations into scan results
 * - Provide the main entry point for the CLI
 * 
 * Design Decisions:
 * - ScanService is the primary use case entry point
 * - ScanOptions encapsulate all scanning parameters
 * - No direct file system access - delegates to infrastructure
 * 
 * This layer:
 * - Imports from: Domain layer, Infrastructure layer
 * - Is called by: CLI layer
 * - NEVER contains presentation logic
 */

export * from './services/scan-service';
export * from './services/rule-engine';
export * from './models/scan-options';

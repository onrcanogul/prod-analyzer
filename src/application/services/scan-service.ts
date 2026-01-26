import { ScanResult } from './../../domain/models/scan-result';
/**
 * ============================================================================
 * SCAN SERVICE
 * ============================================================================
 * 
 * Main application service that orchestrates the complete scanning workflow.
 * This is the primary entry point for the CLI layer.
 * 
 * Workflow:
 * 1. Discover configuration files in the target directory
 * 2. Parse each file based on its format
 * 3. Extract configuration entries
 * 4. Execute rules against entries
 * 5. Aggregate results into a ScanResult
 * 
 * Design Decisions:
 * - Single responsibility: orchestration only
 * - Delegates parsing to infrastructure layer
 * - Delegates rule execution to rule engine
 * - Returns immutable ScanResult
 */


import { ConfigEntry, ALL_RULES } from '../../domain';
import { createScanResult } from './../../domain/models/scan-result'; 

import { 
  discoverConfigFiles, 
  readFileContent,
  DiscoveredFile,
} from '../../infrastructure';
import { parseConfigFile } from '../../infrastructure/parsers/config-parser-factory';
import { ScanOptions } from '../models/scan-options';
import { executeRules, createRuleRegistry } from './rule-engine';

/**
 * Performs a complete scan of the target directory.
 * 
 * @param options - Scanning options
 * @returns Complete scan result with all violations
 * 
 * @example
 * ```typescript
 * const result = await scan({
 *   targetDirectory: '/app',
 *   environment: 'prod',
 *   failOnSeverity: Severity.HIGH,
 *   outputFormat: OutputFormat.CONSOLE,
 * });
 * 
 * if (result.violations.length > 0) {
 *   console.log('Found violations!');
 * }
 * ```
 */
export async function scan(options: ScanOptions): Promise<ScanResult> {
  const startTime = Date.now();
  
  // Step 1: Discover configuration files
  const discoveredFiles = await discoverConfigFiles(options.targetDirectory);
  
  // Step 2 & 3: Parse files and extract entries
  const allEntries = await parseAllFiles(discoveredFiles);
  
  // Step 4: Create profile-filtered rule registry and execute rules
  const registry = createRuleRegistry(ALL_RULES, options.profile);
  const executionResult = executeRules(allEntries, registry);
  
  // Step 5: Create scan result
  const endTime = Date.now();
  
  return createScanResult({
    targetDirectory: options.targetDirectory,
    environment: options.environment,
    profile: options.profile,
    violations: executionResult.violations,
    statistics: {
      filesScanned: discoveredFiles.length,
      entriesEvaluated: executionResult.entriesEvaluated,
      rulesExecuted: executionResult.rulesExecuted,
      durationMs: endTime - startTime,
    },
  });
}

/**
 * Parses all discovered files and extracts configuration entries.
 * 
 * @param files - Discovered configuration files
 * @returns Array of all configuration entries from all files
 */
async function parseAllFiles(
  files: readonly DiscoveredFile[]
): Promise<ConfigEntry[]> {
  const allEntries: ConfigEntry[] = [];
  
  for (const file of files) {
    try {
      const content = await readFileContent(file.filePath);
      const parsed = parseConfigFile(content, file.filePath, file.format);
      allEntries.push(...parsed.entries);
    } catch (error) {
      // Log warning but continue with other files
      console.warn(`Warning: Failed to parse ${file.filePath}:`, error);
    }
  }
  
  return allEntries;
}

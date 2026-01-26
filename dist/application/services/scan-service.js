"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = scan;
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
const domain_1 = require("../../domain");
const scan_result_1 = require("./../../domain/models/scan-result");
const infrastructure_1 = require("../../infrastructure");
const config_parser_factory_1 = require("../../infrastructure/parsers/config-parser-factory");
const rule_engine_1 = require("./rule-engine");
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
async function scan(options) {
    const startTime = Date.now();
    // Step 1: Discover configuration files
    const discoveredFiles = await (0, infrastructure_1.discoverConfigFiles)(options.targetDirectory);
    // Step 2 & 3: Parse files and extract entries
    const allEntries = await parseAllFiles(discoveredFiles);
    // Step 4: Create profile-filtered rule registry and execute rules
    const registry = (0, rule_engine_1.createRuleRegistry)(domain_1.ALL_RULES, options.profile);
    const executionResult = (0, rule_engine_1.executeRules)(allEntries, registry);
    // Step 5: Create scan result
    const endTime = Date.now();
    return (0, scan_result_1.createScanResult)({
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
async function parseAllFiles(files) {
    const allEntries = [];
    for (const file of files) {
        try {
            const content = await (0, infrastructure_1.readFileContent)(file.filePath);
            const parsed = (0, config_parser_factory_1.parseConfigFile)(content, file.filePath, file.format);
            allEntries.push(...parsed.entries);
        }
        catch (error) {
            // Log warning but continue with other files
            console.warn(`Warning: Failed to parse ${file.filePath}:`, error);
        }
    }
    return allEntries;
}
//# sourceMappingURL=scan-service.js.map
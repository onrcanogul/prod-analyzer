"use strict";
/**
 * ============================================================================
 * SCAN OPTIONS MODEL
 * ============================================================================
 *
 * Defines the options for a scan operation.
 * These options come from CLI arguments and control scan behavior.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormat = void 0;
exports.createScanOptions = createScanOptions;
exports.parseOutputFormat = parseOutputFormat;
const domain_1 = require("../../domain");
/**
 * Output format options for scan results.
 */
var OutputFormat;
(function (OutputFormat) {
    /** Human-readable console output */
    OutputFormat["CONSOLE"] = "console";
    /** Machine-readable JSON output */
    OutputFormat["JSON"] = "json";
    /** SARIF format for CI/CD integration (GitHub/GitLab Security tabs) */
    OutputFormat["SARIF"] = "sarif";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
/**
 * Creates ScanOptions with defaults applied.
 *
 * @param partial - Partial options to apply
 * @returns Complete ScanOptions with defaults
 */
function createScanOptions(partial) {
    return {
        targetDirectory: partial.targetDirectory,
        environment: partial.environment ?? 'prod',
        profile: partial.profile ?? domain_1.ScanProfile.SPRING,
        failOnSeverity: partial.failOnSeverity ?? domain_1.Severity.HIGH,
        outputFormat: partial.outputFormat ?? OutputFormat.CONSOLE,
        verbose: partial.verbose ?? false,
    };
}
/**
 * Parses output format from string.
 *
 * @param value - The string value to parse
 * @returns The corresponding OutputFormat
 * @throws Error if value is invalid
 */
function parseOutputFormat(value) {
    const normalized = value.toLowerCase().trim();
    switch (normalized) {
        case 'console':
            return OutputFormat.CONSOLE;
        case 'json':
            return OutputFormat.JSON;
        case 'sarif':
            return OutputFormat.SARIF;
        default:
            throw new Error(`Invalid output format: "${value}". Valid values are: console, json, sarif`);
    }
}
//# sourceMappingURL=scan-options.js.map
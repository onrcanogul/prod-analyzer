"use strict";
/**
 * ============================================================================
 * REPORTER FACTORY
 * ============================================================================
 *
 * Factory for selecting the appropriate reporter based on output format.
 *
 * Design Decisions:
 * - Factory pattern for reporter selection
 * - Reporters return strings (callers handle actual output)
 * - Single entry point for formatting scan results
 * - Enhanced reporters with grouping and gate decisions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatScanResult = formatScanResult;
const scan_options_1 = require("../../application/models/scan-options");
const enhanced_console_reporter_1 = require("./enhanced-console-reporter");
const enhanced_json_reporter_1 = require("./enhanced-json-reporter");
const sarif_reporter_1 = require("./sarif-reporter");
/**
 * Formats scan result based on options.
 *
 * @param result - Scan result
 * @param options - Scan options (determines format and verbosity)
 * @returns Formatted output string
 */
function formatScanResult(result, options) {
    switch (options.outputFormat) {
        case scan_options_1.OutputFormat.CONSOLE:
            return (0, enhanced_console_reporter_1.formatEnhancedConsoleReport)(result, options);
        case scan_options_1.OutputFormat.JSON:
            return (0, enhanced_json_reporter_1.formatEnhancedJsonReport)(result, options);
        case scan_options_1.OutputFormat.SARIF:
            return (0, sarif_reporter_1.formatSarifReport)(result, options);
        default:
            // TypeScript exhaustiveness check
            const _exhaustive = options.outputFormat;
            throw new Error(`Unknown output format: ${_exhaustive}`);
    }
}
//# sourceMappingURL=reporter-factory.js.map
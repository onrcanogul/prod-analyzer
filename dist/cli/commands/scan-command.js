"use strict";
/**
 * ============================================================================
 * SCAN COMMAND
 * ============================================================================
 *
 * Implements the `secure-guard scan` command.
 * This is the main (and currently only) command of the CLI.
 *
 * Responsibilities:
 * - Define command arguments and options
 * - Validate inputs
 * - Call scan service
 * - Format and output results
 * - Determine exit code
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXIT_CODES = void 0;
exports.createScanCommand = createScanCommand;
exports.executeScanCommand = executeScanCommand;
const commander_1 = require("commander");
const path = __importStar(require("node:path"));
const domain_1 = require("../../domain");
const application_1 = require("../../application");
const reporting_1 = require("../../reporting");
/**
 * Exit codes used by the CLI.
 * Documented for CI/CD integration.
 */
exports.EXIT_CODES = {
    /** Scan completed successfully with no violations above threshold */
    SUCCESS: 0,
    /** Scan found violations at or above the fail-on threshold */
    VIOLATIONS_FOUND: 1,
    /** Invalid arguments or configuration */
    INVALID_ARGUMENTS: 2,
    /** Unexpected error during execution */
    ERROR: 3,
};
/**
 * Creates and configures the scan command.
 *
 * @returns Configured Commander command
 */
function createScanCommand() {
    const command = new commander_1.Command('scan')
        .description('Scan configuration files for production misconfigurations')
        .option('-d, --directory <path>', 'Directory to scan (defaults to current directory)', process.cwd())
        .option('-e, --env <environment>', 'Target environment (for context in reports)', 'prod')
        .option('-p, --profile <profile>', 'Scan profile: spring, node, dotnet, or all (default: spring)', 'spring')
        .option('-f, --fail-on <severity>', 'Minimum severity to trigger non-zero exit (INFO, LOW, MEDIUM, HIGH, CRITICAL)', 'HIGH')
        .option('--format <format>', 'Output format (console, json, sarif)', 'console')
        .option('-v, --verbose', 'Show verbose output with full violation details', false)
        .action(async (options) => {
        await executeScanCommand(options);
    });
    return command;
}
/**
 * Executes the scan command with the given options.
 * Separated from command definition for testability.
 *
 * @param rawOptions - Raw options from Commander
 */
async function executeScanCommand(rawOptions) {
    try {
        // Validate and parse options
        const validatedOptions = validateOptions(rawOptions);
        // Create scan options
        const scanOptions = (0, application_1.createScanOptions)({
            targetDirectory: validatedOptions.directory,
            environment: validatedOptions.env,
            profile: validatedOptions.profile,
            failOnSeverity: validatedOptions.failOnSeverity,
            outputFormat: validatedOptions.outputFormat,
            verbose: validatedOptions.verbose,
        });
        // Execute scan
        const result = await (0, application_1.scan)(scanOptions);
        // Format and output results
        const output = (0, reporting_1.formatScanResult)(result, scanOptions);
        console.log(output);
        // Determine exit code
        const hasFailingViolations = (0, domain_1.hasViolationsAboveThreshold)(result, scanOptions.failOnSeverity);
        if (hasFailingViolations) {
            process.exit(exports.EXIT_CODES.VIOLATIONS_FOUND);
        }
        else {
            process.exit(exports.EXIT_CODES.SUCCESS);
        }
    }
    catch (error) {
        handleError(error);
    }
}
/**
 * Validates raw command options and converts to typed values.
 *
 * @param raw - Raw options from Commander
 * @returns Validated options with proper types
 * @throws Error if validation fails
 */
function validateOptions(raw) {
    // Resolve directory to absolute path
    const directory = path.resolve(raw.directory);
    // Parse profile (will throw on invalid value)
    const profile = (0, domain_1.parseProfile)(raw.profile);
    // Parse severity (will throw on invalid value)
    const failOnSeverity = (0, domain_1.parseSeverity)(raw.failOn);
    // Parse output format (will throw on invalid value)
    const outputFormat = (0, application_1.parseOutputFormat)(raw.format);
    return {
        directory,
        env: raw.env,
        profile,
        failOnSeverity,
        outputFormat,
        verbose: raw.verbose,
    };
}
/**
 * Handles errors during command execution.
 * Outputs appropriate error messages and sets exit code.
 *
 * @param error - The error that occurred
 */
function handleError(error) {
    if (error instanceof Error) {
        // Check if it's a validation error
        if (error.message.includes('Invalid severity') ||
            error.message.includes('Invalid output format') ||
            error.message.includes('Invalid profile')) {
            console.error(`Error: ${error.message}`);
            process.exit(exports.EXIT_CODES.INVALID_ARGUMENTS);
        }
        // Generic error
        console.error(`Error: ${error.message}`);
        // Show stack trace in debug mode
        if (process.env['DEBUG']) {
            console.error(error.stack);
        }
    }
    else {
        console.error('An unexpected error occurred');
    }
    process.exit(exports.EXIT_CODES.ERROR);
}
//# sourceMappingURL=scan-command.js.map
#!/usr/bin/env node
"use strict";
/**
 * ============================================================================
 * SECURE-GUARD CLI ENTRY POINT
 * ============================================================================
 *
 * This is the main entry point for the secure-guard CLI tool.
 * It sets up the Commander program and registers all available commands.
 *
 * Usage:
 *   secure-guard scan [options]
 *
 * Run with --help for full usage information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const scan_command_1 = require("./commands/scan-command");
/**
 * Application version (should match package.json).
 */
const VERSION = '1.0.0';
/**
 * Creates and configures the main CLI program.
 *
 * @returns Configured Commander program
 */
function createProgram() {
    const program = new commander_1.Command()
        .name('secure-guard')
        .description('Scan Spring Boot configuration files for production misconfigurations.\n\n' +
        'This tool analyzes application.yml, application.properties, and .env files\n' +
        'to detect security issues and configuration problems that could affect\n' +
        'production environments.')
        .version(VERSION, '-v, --version', 'Display version number');
    // Register commands
    program.addCommand((0, scan_command_1.createScanCommand)());
    // Add examples to help text
    program.addHelpText('after', `
Examples:
  $ secure-guard scan                          # Scan current directory
  $ secure-guard scan -d ./my-project          # Scan specific directory
  $ secure-guard scan --format json            # Output as JSON
  $ secure-guard scan --fail-on MEDIUM         # Fail on MEDIUM or higher
  $ secure-guard scan -e staging               # Set environment context

Exit Codes:
  0  - Success (no violations above threshold)
  1  - Violations found at or above threshold
  2  - Invalid arguments
  3  - Unexpected error
`);
    return program;
}
/**
 * Main entry point.
 * Parses command-line arguments and executes the appropriate command.
 */
async function main() {
    const program = createProgram();
    try {
        await program.parseAsync(process.argv);
    }
    catch (error) {
        // Commander handles most errors, but just in case
        console.error('Fatal error:', error);
        process.exit(3);
    }
}
// Execute main function
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(3);
});
//# sourceMappingURL=main.js.map
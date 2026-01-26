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
import { Command } from 'commander';
/**
 * Exit codes used by the CLI.
 * Documented for CI/CD integration.
 */
export declare const EXIT_CODES: {
    /** Scan completed successfully with no violations above threshold */
    readonly SUCCESS: 0;
    /** Scan found violations at or above the fail-on threshold */
    readonly VIOLATIONS_FOUND: 1;
    /** Invalid arguments or configuration */
    readonly INVALID_ARGUMENTS: 2;
    /** Unexpected error during execution */
    readonly ERROR: 3;
};
/**
 * Creates and configures the scan command.
 *
 * @returns Configured Commander command
 */
export declare function createScanCommand(): Command;
/**
 * Raw options from Commander before validation.
 */
interface RawCommandOptions {
    directory: string;
    env: string;
    profile: string;
    failOn: string;
    format: string;
    verbose: boolean;
}
/**
 * Executes the scan command with the given options.
 * Separated from command definition for testability.
 *
 * @param rawOptions - Raw options from Commander
 */
export declare function executeScanCommand(rawOptions: RawCommandOptions): Promise<void>;
export {};
//# sourceMappingURL=scan-command.d.ts.map
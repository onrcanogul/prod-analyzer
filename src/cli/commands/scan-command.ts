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
import * as path from 'node:path';
import { 
  parseSeverity, 
  hasViolationsAboveThreshold,
  Severity,
  parseProfile,
  ScanProfile,
} from '../../domain';
import { 
  scan, 
  createScanOptions, 
  parseOutputFormat,
  OutputFormat,
} from '../../application';
import { formatScanResult } from '../../reporting';

/**
 * Exit codes used by the CLI.
 * Documented for CI/CD integration.
 */
export const EXIT_CODES = {
  /** Scan completed successfully with no violations above threshold */
  SUCCESS: 0,
  
  /** Scan found violations at or above the fail-on threshold */
  VIOLATIONS_FOUND: 1,
  
  /** Invalid arguments or configuration */
  INVALID_ARGUMENTS: 2,
  
  /** Unexpected error during execution */
  ERROR: 3,
} as const;

/**
 * Creates and configures the scan command.
 * 
 * @returns Configured Commander command
 */
export function createScanCommand(): Command {
  const command = new Command('scan')
    .description('Scan configuration files for production misconfigurations')
    .option(
      '-d, --directory <path>',
      'Directory to scan (defaults to current directory)',
      process.cwd()
    )
    .option(
      '-e, --env <environment>',
      'Target environment (for context in reports)',
      'prod'
    )
    .option(
      '-p, --profile <profile>',
      'Scan profile: spring, node, dotnet, or all (default: spring)',
      'spring'
    )
    .option(
      '-f, --fail-on <severity>',
      'Minimum severity to trigger non-zero exit (INFO, LOW, MEDIUM, HIGH, CRITICAL)',
      'HIGH'
    )
    .option(
      '--format <format>',
      'Output format (console, json, sarif)',
      'console'
    )
    .option(
      '-v, --verbose',
      'Show verbose output with full violation details',
      false
    )
    .action(async (options: RawCommandOptions) => {
      await executeScanCommand(options);
    });
  
  return command;
}

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
export async function executeScanCommand(rawOptions: RawCommandOptions): Promise<void> {
  try {
    // Validate and parse options
    const validatedOptions = validateOptions(rawOptions);
    
    // Create scan options
    const scanOptions = createScanOptions({
      targetDirectory: validatedOptions.directory,
      environment: validatedOptions.env,
      profile: validatedOptions.profile,
      failOnSeverity: validatedOptions.failOnSeverity,
      outputFormat: validatedOptions.outputFormat,
      verbose: validatedOptions.verbose,
    });
    
    // Execute scan
    const result = await scan(scanOptions);
    
    // Format and output results
    const output = formatScanResult(result, scanOptions);
    console.log(output);
    
    // Determine exit code
    const hasFailingViolations = hasViolationsAboveThreshold(
      result,
      scanOptions.failOnSeverity
    );
    
    if (hasFailingViolations) {
      process.exit(EXIT_CODES.VIOLATIONS_FOUND);
    } else {
      process.exit(EXIT_CODES.SUCCESS);
    }
  } catch (error) {
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
function validateOptions(raw: RawCommandOptions): {
  directory: string;
  env: string;
  profile: ScanProfile;
  failOnSeverity: Severity;
  outputFormat: OutputFormat;
  verbose: boolean;
} {
  // Resolve directory to absolute path
  const directory = path.resolve(raw.directory);
  
  // Parse profile (will throw on invalid value)
  const profile = parseProfile(raw.profile);
  
  // Parse severity (will throw on invalid value)
  const failOnSeverity = parseSeverity(raw.failOn);
  
  // Parse output format (will throw on invalid value)
  const outputFormat = parseOutputFormat(raw.format);
  
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
function handleError(error: unknown): never {
  if (error instanceof Error) {
    // Check if it's a validation error
    if (error.message.includes('Invalid severity') ||
        error.message.includes('Invalid output format') ||
        error.message.includes('Invalid profile')) {
      console.error(`Error: ${error.message}`);
      process.exit(EXIT_CODES.INVALID_ARGUMENTS);
    }
    
    // Generic error
    console.error(`Error: ${error.message}`);
    
    // Show stack trace in debug mode
    if (process.env['DEBUG']) {
      console.error(error.stack);
    }
  } else {
    console.error('An unexpected error occurred');
  }
  
  process.exit(EXIT_CODES.ERROR);
}

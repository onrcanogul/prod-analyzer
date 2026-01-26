import { ScanResult } from './../../domain/models/scan-result';
import { ScanOptions } from '../models/scan-options';
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
export declare function scan(options: ScanOptions): Promise<ScanResult>;
//# sourceMappingURL=scan-service.d.ts.map
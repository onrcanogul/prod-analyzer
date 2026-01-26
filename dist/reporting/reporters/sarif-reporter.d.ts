/**
 * ============================================================================
 * SARIF REPORTER
 * ============================================================================
 *
 * Formats scan results in SARIF (Static Analysis Results Interchange Format).
 *
 * Why SARIF?
 * - Standard format for static analysis tools (Microsoft, GitHub, GitLab)
 * - Native GitHub Security tab integration
 * - GitLab Security Dashboard support
 * - VSCode/IDE integration for inline warnings
 * - Industry standard (OASIS specification)
 *
 * Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 *
 * Usage in CI:
 * ```yaml
 * - name: Security Scan
 *   run: secure-guard scan --format sarif > results.sarif
 * - uses: github/codeql-action/upload-sarif@v2
 *   with:
 *     sarif_file: results.sarif
 * ```
 */
import { ScanResult } from '../../domain/models/scan-result';
import { ScanOptions } from '../../application/models/scan-options';
/**
 * Formats scan result as SARIF JSON.
 *
 * @param result - Scan result
 * @param options - Scan options
 * @returns SARIF JSON string
 */
export declare function formatSarifReport(result: ScanResult, options: ScanOptions): string;
//# sourceMappingURL=sarif-reporter.d.ts.map
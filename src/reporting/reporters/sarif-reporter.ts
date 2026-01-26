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
import { Severity } from '../../domain/models/severity';
import { Violation } from '../../domain/models/violation';

const TOOL_VERSION = '1.0.0';
const SARIF_VERSION = '2.1.0';

/**
 * SARIF severity mapping.
 * Maps our severity levels to SARIF's result.level.
 */
const SARIF_LEVELS = {
  [Severity.INFO]: 'note',
  [Severity.LOW]: 'note',
  [Severity.MEDIUM]: 'warning',
  [Severity.HIGH]: 'error',
  [Severity.CRITICAL]: 'error',
} as const;

/**
 * Formats scan result as SARIF JSON.
 * 
 * @param result - Scan result
 * @param options - Scan options
 * @returns SARIF JSON string
 */
export function formatSarifReport(
  result: ScanResult,
  options: ScanOptions
): string {
  const sarifOutput = {
    version: SARIF_VERSION,
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    
    runs: [
      {
        tool: {
          driver: {
            name: 'Secure Guard',
            version: TOOL_VERSION,
            informationUri: 'https://github.com/your-org/secure-guard',
            rules: generateRules(result),
          },
        },
        
        results: result.violations.map(v => formatSarifResult(v)),
        
        invocations: [
          {
            executionSuccessful: true,
            endTimeUtc: result.scannedAt,
            workingDirectory: {
              uri: `file://${result.targetDirectory}`,
            },
            properties: {
              environment: result.environment,
              profile: result.profile,
              threshold: Severity[options.failOnSeverity],
              filesScanned: result.statistics.filesScanned,
              rulesExecuted: result.statistics.rulesExecuted,
              durationMs: result.statistics.durationMs,
            },
          },
        ],
      },
    ],
  };
  
  return JSON.stringify(sarifOutput, null, 2);
}

/**
 * Generates SARIF rule definitions from violations.
 */
function generateRules(result: ScanResult): Array<{
  id: string;
  shortDescription: { text: string };
  fullDescription?: { text: string };
  help?: { text: string };
  properties?: {
    severity: string;
    tags: string[];
  };
}> {
  // Extract unique rules from violations
  const ruleMap = new Map<string, Violation>();
  
  for (const violation of result.violations) {
    if (!ruleMap.has(violation.ruleId)) {
      ruleMap.set(violation.ruleId, violation);
    }
  }
  
  return Array.from(ruleMap.values()).map(v => {
    const firstSentence = v.message.split('.')[0];
    return {
      id: v.ruleId,
      shortDescription: {
        text: firstSentence || v.message, // Fallback to full message if split fails
      },
      fullDescription: {
        text: v.message,
      },
      help: {
        text: v.suggestion,
      },
      properties: {
        severity: Severity[v.severity],
        tags: ['security', 'configuration'],
      },
    };
  });
}

/**
 * Formats a single violation as a SARIF result.
 */
function formatSarifResult(violation: Violation): {
  ruleId: string;
  level: string;
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: { startLine: number };
    };
  }>;
  properties?: {
    configKey: string;
    configValue: string;
    suggestion: string;
  };
} {
  return {
    ruleId: violation.ruleId,
    level: SARIF_LEVELS[violation.severity],
    message: {
      text: violation.message,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: `file://${violation.filePath}`,
          },
          ...(violation.lineNumber && {
            region: {
              startLine: violation.lineNumber,
            },
          }),
        },
      },
    ],
    properties: {
      configKey: violation.configKey,
      configValue: violation.configValue,
      suggestion: violation.suggestion,
    },
  };
}

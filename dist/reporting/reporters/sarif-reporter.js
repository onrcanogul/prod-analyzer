"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSarifReport = formatSarifReport;
const severity_1 = require("../../domain/models/severity");
const TOOL_VERSION = '1.0.0';
const SARIF_VERSION = '2.1.0';
/**
 * SARIF severity mapping.
 * Maps our severity levels to SARIF's result.level.
 */
const SARIF_LEVELS = {
    [severity_1.Severity.INFO]: 'note',
    [severity_1.Severity.LOW]: 'note',
    [severity_1.Severity.MEDIUM]: 'warning',
    [severity_1.Severity.HIGH]: 'error',
    [severity_1.Severity.CRITICAL]: 'error',
};
/**
 * Formats scan result as SARIF JSON.
 *
 * @param result - Scan result
 * @param options - Scan options
 * @returns SARIF JSON string
 */
function formatSarifReport(result, options) {
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
                            threshold: severity_1.Severity[options.failOnSeverity],
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
function generateRules(result) {
    // Extract unique rules from violations
    const ruleMap = new Map();
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
                severity: severity_1.Severity[v.severity],
                tags: ['security', 'configuration'],
            },
        };
    });
}
/**
 * Formats a single violation as a SARIF result.
 */
function formatSarifResult(violation) {
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
//# sourceMappingURL=sarif-reporter.js.map
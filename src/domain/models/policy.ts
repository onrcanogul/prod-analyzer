/**
 * ============================================================================
 * POLICY MODEL
 * ============================================================================
 * 
 * Company-specific security policies that can be defined in YAML.
 * This allows organizations to enforce their own configuration rules
 * beyond the built-in security rules.
 * 
 * Key Differences from Rules:
 * - Policies are user-defined, rules are built-in
 * - Policies are simpler (key/value matching)
 * - Policies override default severity
 * - Policies can be shared across teams/projects
 */

import { Severity } from './severity';

/**
 * A single policy rule defined by the organization.
 */
export interface PolicyRule {
  /** Unique identifier for this policy */
  readonly id: string;
  
  /** Human-readable description */
  readonly description: string;
  
  /** Configuration key to check (supports wildcards like "logging.level.*") */
  readonly key: string;
  
  /** Values that are forbidden for this key */
  readonly forbiddenValues?: readonly string[];
  
  /** Required value (if specified, any other value is a violation) */
  readonly requiredValue?: string;
  
  /** Pattern to forbid (regex) */
  readonly forbiddenPattern?: string;
  
  /** Severity level for violations */
  readonly severity: Severity;
  
  /** Custom message for violations */
  readonly message: string;
  
  /** Optional suggestion for remediation */
  readonly suggestion?: string;
  
  /** Whether to treat the key as case-insensitive */
  readonly caseInsensitive?: boolean;
}

/**
 * Complete policy configuration.
 */
export interface Policy {
  /** Policy name */
  readonly name: string;
  
  /** Policy version */
  readonly version: string;
  
  /** Description of this policy */
  readonly description?: string;
  
  /** List of policy rules */
  readonly rules: readonly PolicyRule[];
  
  /** Optional metadata */
  readonly metadata?: {
    readonly author?: string;
    readonly organization?: string;
    readonly createdAt?: string;
    readonly tags?: readonly string[];
  };
}

/**
 * Result of evaluating a policy rule.
 */
export interface PolicyViolation {
  readonly policyId: string;
  readonly ruleId: string;
  readonly severity: Severity;
  readonly message: string;
  readonly suggestion?: string;
  readonly filePath: string;
  readonly configKey: string;
  readonly configValue: string;
  readonly lineNumber?: number;
}

/**
 * Creates a policy violation.
 */
export function createPolicyViolation(params: {
  policyId: string;
  ruleId: string;
  severity: Severity;
  message: string;
  suggestion?: string;
  filePath: string;
  configKey: string;
  configValue: string;
  lineNumber?: number;
}): PolicyViolation {
  const violation: PolicyViolation = {
    policyId: params.policyId,
    ruleId: params.ruleId,
    severity: params.severity,
    message: params.message,
    filePath: params.filePath,
    configKey: params.configKey,
    configValue: params.configValue,
  };
  
  if (params.suggestion !== undefined) {
    (violation as { suggestion: string }).suggestion = params.suggestion;
  }
  
  if (params.lineNumber !== undefined) {
    (violation as { lineNumber: number }).lineNumber = params.lineNumber;
  }
  
  return violation;
}

/**
 * Checks if a key matches a pattern (supports wildcards).
 * 
 * @example
 * matchesKeyPattern("logging.level.root", "logging.level.*") // true
 * matchesKeyPattern("server.port", "logging.level.*") // false
 */
export function matchesKeyPattern(key: string, pattern: string): boolean {
  // Normalize keys (lowercase, dots)
  const normalizedKey = key.toLowerCase().replace(/[_-]/g, '.');
  const normalizedPattern = pattern.toLowerCase().replace(/[_-]/g, '.');
  
  // Convert wildcard pattern to regex
  const regexPattern = normalizedPattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*/g, '.*'); // Convert * to .*
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(normalizedKey);
}

/**
 * Normalizes a configuration value for comparison.
 */
export function normalizeValue(value: string, caseInsensitive: boolean = true): string {
  let normalized = String(value).trim();
  if (caseInsensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

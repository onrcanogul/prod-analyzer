/**
 * ============================================================================
 * POLICY ENGINE
 * ============================================================================
 * 
 * Evaluates configuration entries against user-defined policies.
 * This allows organizations to enforce custom security rules beyond
 * the built-in detection rules.
 */

import { ConfigEntry } from './models/config-entry';
import {
  Policy,
  PolicyRule,
  PolicyViolation,
  createPolicyViolation,
  matchesKeyPattern,
  normalizeValue,
} from './models/policy';

/**
 * Evaluates a single policy rule against a configuration entry.
 * 
 * @param rule - Policy rule to evaluate
 * @param entry - Configuration entry to check
 * @param policyName - Name of the parent policy (for violation context)
 * @returns PolicyViolation if rule is violated, undefined otherwise
 */
export function evaluatePolicyRule(
  rule: PolicyRule,
  entry: ConfigEntry,
  policyName: string
): PolicyViolation | undefined {
  // Check if key matches
  if (!matchesKeyPattern(entry.key, rule.key)) {
    return undefined;
  }
  
  const entryValue = normalizeValue(
    String(entry.value),
    rule.caseInsensitive ?? true
  );
  
  // Check forbidden values
  if (rule.forbiddenValues && rule.forbiddenValues.length > 0) {
    const normalizedForbidden = rule.forbiddenValues.map((v: string) =>
      normalizeValue(v, rule.caseInsensitive ?? true)
    );
    
    if (normalizedForbidden.includes(entryValue)) {
      const params: any = {
        policyId: policyName,
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: entry.value,
      };
      if (rule.suggestion) params.suggestion = rule.suggestion;
      if (entry.lineNumber !== undefined) params.lineNumber = entry.lineNumber;
      
      return createPolicyViolation(params);
    }
  }
  
  // Check required value
  if (rule.requiredValue !== undefined) {
    const normalizedRequired = normalizeValue(
      rule.requiredValue,
      rule.caseInsensitive ?? true
    );
    
    if (entryValue !== normalizedRequired) {
      const params: any = {
        policyId: policyName,
        ruleId: rule.id,
        severity: rule.severity,
        message: `${rule.message} (expected: ${rule.requiredValue}, found: ${entry.value})`,
        suggestion: rule.suggestion || `Set ${entry.key} to ${rule.requiredValue}`,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: entry.value,
      };
      if (entry.lineNumber !== undefined) params.lineNumber = entry.lineNumber;
      
      return createPolicyViolation(params);
    }
  }
  
  // Check forbidden pattern
  if (rule.forbiddenPattern) {
    try {
      const regex = new RegExp(rule.forbiddenPattern, 'i');
      if (regex.test(entryValue)) {
        const params: any = {
          policyId: policyName,
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
        };
        if (rule.suggestion) params.suggestion = rule.suggestion;
        if (entry.lineNumber !== undefined) params.lineNumber = entry.lineNumber;
        
        return createPolicyViolation(params);
      }
    } catch (error) {
      // Invalid regex pattern - skip this rule
      console.warn(`Invalid regex pattern in policy rule ${rule.id}: ${rule.forbiddenPattern}`);
    }
  }
  
  return undefined;
}

/**
 * Evaluates all policy rules against configuration entries.
 * 
 * @param policy - Policy to evaluate
 * @param entries - Configuration entries to check
 * @returns Array of policy violations
 */
export function evaluatePolicy(
  policy: Policy,
  entries: readonly ConfigEntry[]
): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  
  for (const entry of entries) {
    for (const rule of policy.rules) {
      const violation = evaluatePolicyRule(rule, entry, policy.name);
      if (violation) {
        violations.push(violation);
      }
    }
  }
  
  return violations;
}

/**
 * Merges policy violations with regular rule violations.
 * Policy violations are treated as first-class violations.
 */
export function mergePolicyViolations(
  policyViolations: readonly PolicyViolation[]
): any[] {
  // Convert policy violations to regular violation format
  return policyViolations.map(pv => ({
    ruleId: `POLICY:${pv.ruleId}`,
    severity: pv.severity,
    message: `[${pv.policyId}] ${pv.message}`,
    filePath: pv.filePath,
    configKey: pv.configKey,
    configValue: pv.configValue,
    lineNumber: pv.lineNumber,
    suggestion: pv.suggestion || 'Review company security policy',
  }));
}

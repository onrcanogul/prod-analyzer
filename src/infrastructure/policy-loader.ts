/**
 * ============================================================================
 * POLICY LOADER
 * ============================================================================
 * 
 * Loads and parses company security policies from YAML files.
 */

import * as fs from 'node:fs/promises';
import * as yaml from 'js-yaml';
import { Policy, PolicyRule } from '../domain/models/policy';
import { Severity, parseSeverity } from '../domain/models/severity';

/**
 * Default policy file names to look for.
 */
export const POLICY_FILE_NAMES = [
  '.prod-analyzer-policy.yml',
  '.prod-analyzer-policy.yaml',
  'prod-analyzer-policy.yml',
  'prod-analyzer-policy.yaml',
] as const;

/**
 * Loads a policy from a YAML file.
 * 
 * @param filePath - Path to the policy YAML file
 * @returns Parsed policy
 * @throws Error if file cannot be read or parsed
 */
export async function loadPolicyFromFile(filePath: string): Promise<Policy> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parsePolicyYaml(content, filePath);
}

/**
 * Attempts to find and load a policy file from a directory.
 * 
 * @param directory - Directory to search for policy files
 * @returns Policy if found, undefined otherwise
 */
export async function findAndLoadPolicy(directory: string): Promise<Policy | undefined> {
  for (const fileName of POLICY_FILE_NAMES) {
    const filePath = `${directory}/${fileName}`;
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        console.log(`📋 Loading custom policy from ${fileName}`);
        return await loadPolicyFromFile(filePath);
      }
    } catch {
      // File doesn't exist, continue
    }
  }
  
  return undefined;
}

/**
 * Parses policy YAML content.
 * 
 * @param content - YAML content
 * @param filePath - Source file path (for error messages)
 * @returns Parsed policy
 * @throws Error if YAML is invalid or missing required fields
 */
export function parsePolicyYaml(content: string, filePath: string): Policy {
  let parsed: any;
  
  try {
    parsed = yaml.load(content);
  } catch (error) {
    throw new Error(`Failed to parse policy YAML from ${filePath}: ${error}`);
  }
  
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid policy file ${filePath}: must be a YAML object`);
  }
  
  // Validate required fields
  if (!parsed.policies || typeof parsed.policies !== 'object') {
    throw new Error(`Invalid policy file ${filePath}: missing 'policies' section`);
  }
  
  const policies = parsed.policies;
  
  if (!policies.name || typeof policies.name !== 'string') {
    throw new Error(`Invalid policy file ${filePath}: missing 'policies.name'`);
  }
  
  if (!policies.version || typeof policies.version !== 'string') {
    throw new Error(`Invalid policy file ${filePath}: missing 'policies.version'`);
  }
  
  if (!Array.isArray(policies.rules)) {
    throw new Error(`Invalid policy file ${filePath}: 'policies.rules' must be an array`);
  }
  
  // Parse rules
  const rules: PolicyRule[] = policies.rules.map((rule: any, index: number) => {
    return parsePolicyRule(rule, filePath, index);
  });
  
  return {
    name: policies.name,
    version: policies.version,
    description: policies.description,
    rules,
    metadata: policies.metadata,
  };
}

/**
 * Parses a single policy rule from YAML.
 */
function parsePolicyRule(rule: any, filePath: string, index: number): PolicyRule {
  if (!rule || typeof rule !== 'object') {
    throw new Error(`Invalid policy rule at index ${index} in ${filePath}: must be an object`);
  }
  
  // Validate required fields
  if (!rule.id || typeof rule.id !== 'string') {
    throw new Error(`Invalid policy rule at index ${index} in ${filePath}: missing 'id'`);
  }
  
  if (!rule.description || typeof rule.description !== 'string') {
    throw new Error(`Invalid policy rule ${rule.id} in ${filePath}: missing 'description'`);
  }
  
  if (!rule.key || typeof rule.key !== 'string') {
    throw new Error(`Invalid policy rule ${rule.id} in ${filePath}: missing 'key'`);
  }
  
  if (!rule.message || typeof rule.message !== 'string') {
    throw new Error(`Invalid policy rule ${rule.id} in ${filePath}: missing 'message'`);
  }
  
  // Parse severity
  let severity: Severity;
  if (rule.severity) {
    try {
      severity = parseSeverity(String(rule.severity));
    } catch {
      throw new Error(`Invalid policy rule ${rule.id} in ${filePath}: invalid severity '${rule.severity}'`);
    }
  } else {
    severity = Severity.HIGH; // Default
  }
  
  // Validate that at least one check type is specified
  if (!rule.forbiddenValues && !rule.requiredValue && !rule.forbiddenPattern) {
    throw new Error(
      `Invalid policy rule ${rule.id} in ${filePath}: must specify at least one of: forbiddenValues, requiredValue, forbiddenPattern`
    );
  }
  
  return {
    id: rule.id,
    description: rule.description,
    key: rule.key,
    forbiddenValues: rule.forbiddenValues,
    requiredValue: rule.requiredValue,
    forbiddenPattern: rule.forbiddenPattern,
    severity,
    message: rule.message,
    suggestion: rule.suggestion,
    caseInsensitive: rule.caseInsensitive ?? true,
  };
}

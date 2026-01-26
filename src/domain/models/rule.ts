/**
 * ============================================================================
 * RULE MODEL
 * ============================================================================
 * 
 * Defines the contract for security rules that evaluate configuration entries.
 * Rules are the core business logic units - each rule checks for one specific
 * misconfiguration pattern.
 * 
 * Design Decisions:
 * - Rules are interfaces, not classes, for maximum flexibility
 * - Each rule has a single evaluate() method (Single Responsibility)
 * - Rules return an array to allow multiple violations per entry
 * - Metadata (id, description, severity) is part of the rule for self-documentation
 * - Rules are stateless and pure - no side effects
 * 
 * Adding a New Rule:
 * 1. Create a new file in src/domain/rules/implementations/
 * 2. Implement the Rule interface
 * 3. Register it in the RuleRegistry
 * 
 * @example
 * ```typescript
 * const myRule: Rule = {
 *   id: 'MY_CUSTOM_RULE',
 *   name: 'My Custom Rule',
 *   description: 'Checks for custom misconfiguration',
 *   defaultSeverity: Severity.HIGH,
 *   evaluate: (entry) => {
 *     if (entry.key === 'my.key' && entry.value === 'bad') {
 *       return [createViolation({ ... })];
 *     }
 *     return [];
 *   },
 * };
 * ```
 */

import { ConfigEntry } from './config-entry';
import { Platform } from './platform';
import { Severity } from './severity';
import { Violation } from './violation';

/**
 * Interface for all security/configuration rules.
 * 
 * Each rule is responsible for detecting ONE type of misconfiguration.
 * Rules are evaluated against every configuration entry.
 */
export interface Rule {
  /**
   * Unique identifier for the rule.
   * Format: SCREAMING_SNAKE_CASE
   * Must be unique across all rules.
   */
  readonly id: string;
  
  /**
   * Human-readable name of the rule.
   * Displayed in reports and documentation.
   */
  readonly name: string;
  
  /**
   * Detailed description of what the rule checks.
   * Should explain the security implications.
   */
  readonly description: string;
  
  /**
   * The default severity for violations from this rule.
   * Can potentially be overridden by configuration in the future.
   */
  readonly defaultSeverity: Severity;
  
  /**
   * The configuration keys this rule applies to.
   * Used for optimization - rules only run against relevant entries.
   * Use '*' to match all keys (not recommended for performance).
   */
  readonly targetKeys: readonly string[];
  
  /**
   * The platforms this rule applies to.
   * If empty, the rule applies to all platforms.
   * Used to filter platform-specific rules.
   * 
   * @example ['spring-boot'] - Only Spring Boot
   * @example ['nodejs', 'dotnet'] - Both Node.js and .NET
   * @example [] - All platforms (generic rule)
   */
  readonly platforms?: readonly Platform[];
  
  /**
   * Evaluates a configuration entry and returns any violations found.
   * 
   * @param entry - The configuration entry to evaluate
   * @returns Array of violations (empty if no violation)
   * 
   * Contract:
   * - MUST be a pure function (no side effects)
   * - MUST be deterministic (same input = same output)
   * - MUST return empty array if no violation (not null/undefined)
   * - MAY return multiple violations for a single entry
   */
  evaluate(entry: ConfigEntry): readonly Violation[];
}

/**
 * Type guard to check if an object is a valid Rule.
 * Useful for runtime validation of dynamically loaded rules.
 * 
 * @param obj - Object to check
 * @returns True if the object implements the Rule interface
 */
export function isRule(obj: unknown): obj is Rule {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const candidate = obj as Record<string, unknown>;
  
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['name'] === 'string' &&
    typeof candidate['description'] === 'string' &&
    typeof candidate['defaultSeverity'] === 'number' &&
    Array.isArray(candidate['targetKeys']) &&
    typeof candidate['evaluate'] === 'function'
  );
}

"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRule = isRule;
/**
 * Type guard to check if an object is a valid Rule.
 * Useful for runtime validation of dynamically loaded rules.
 *
 * @param obj - Object to check
 * @returns True if the object implements the Rule interface
 */
function isRule(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const candidate = obj;
    return (typeof candidate['id'] === 'string' &&
        typeof candidate['name'] === 'string' &&
        typeof candidate['description'] === 'string' &&
        typeof candidate['defaultSeverity'] === 'number' &&
        Array.isArray(candidate['targetKeys']) &&
        typeof candidate['evaluate'] === 'function');
}
//# sourceMappingURL=rule.js.map
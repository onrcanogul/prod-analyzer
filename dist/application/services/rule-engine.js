"use strict";
/**
 * ============================================================================
 * RULE ENGINE
 * ============================================================================
 *
 * Executes rules against configuration entries and collects violations.
 *
 * Design Decisions:
 * - Separates rule execution logic from orchestration
 * - Uses RuleRegistry for pluggable rule management
 * - Optimizes by only running rules that match entry keys
 *
 * Performance Considerations:
 * - Rules are indexed by target key for O(1) lookup
 * - Only applicable rules are executed for each entry
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRules = executeRules;
exports.createRuleRegistry = createRuleRegistry;
const domain_1 = require("../../domain");
/**
 * Executes registered rules against a set of configuration entries.
 *
 * @param entries - Configuration entries to evaluate
 * @param registry - Registry containing rules to execute
 * @returns Execution result with violations and statistics
 *
 * @example
 * ```typescript
 * const registry = new RuleRegistry();
 * registry.register(myRule);
 *
 * const result = executeRules(configEntries, registry);
 * console.log(`Found ${result.violations.length} violations`);
 * ```
 */
function executeRules(entries, registry) {
    const violations = [];
    const executedRules = new Set();
    for (const entry of entries) {
        // Get rules that apply to this entry's key
        const applicableRules = registry.getRulesForKey(entry.key);
        for (const rule of applicableRules) {
            executedRules.add(rule.id);
            // Execute the rule and collect violations
            const ruleViolations = rule.evaluate(entry);
            violations.push(...ruleViolations);
        }
    }
    return {
        violations,
        rulesExecuted: executedRules.size,
        entriesEvaluated: entries.length,
    };
}
/**
 * Creates a new RuleRegistry populated with rules filtered by profile.
 *
 * @param rules - Rules to register
 * @param profile - Scan profile determining which rules to load
 * @returns A configured RuleRegistry with profile-filtered rules
 */
function createRuleRegistry(rules, profile = domain_1.ScanProfile.SPRING) {
    const registry = new domain_1.RuleRegistry(profile);
    for (const rule of rules) {
        registry.register(rule); // Registry will filter based on profile
    }
    return registry;
}
//# sourceMappingURL=rule-engine.js.map
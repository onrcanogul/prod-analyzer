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
import { ConfigEntry, Rule, RuleRegistry, Violation, ScanProfile } from '../../domain';
/**
 * Result of rule execution containing all violations and statistics.
 */
export interface RuleExecutionResult {
    /** All violations found during execution */
    readonly violations: readonly Violation[];
    /** Number of rules that were executed */
    readonly rulesExecuted: number;
    /** Number of configuration entries evaluated */
    readonly entriesEvaluated: number;
}
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
export declare function executeRules(entries: readonly ConfigEntry[], registry: RuleRegistry): RuleExecutionResult;
/**
 * Creates a new RuleRegistry populated with rules filtered by profile.
 *
 * @param rules - Rules to register
 * @param profile - Scan profile determining which rules to load
 * @returns A configured RuleRegistry with profile-filtered rules
 */
export declare function createRuleRegistry(rules: readonly Rule[], profile?: ScanProfile): RuleRegistry;
//# sourceMappingURL=rule-engine.d.ts.map
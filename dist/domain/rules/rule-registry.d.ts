/**
 * ============================================================================
 * RULE REGISTRY
 * ============================================================================
 *
 * Central registry for all security rules with profile-based filtering.
 * Provides a pluggable architecture for adding new rules.
 *
 * Design Decisions:
 * - Registry pattern for easy rule management
 * - Rules are filtered by scan profile at initialization
 * - Supports filtering rules by target keys for optimization
 * - Profile-aware: only loads rules matching the active profile
 *
 * Adding New Rules:
 * 1. Implement the Rule interface with platform specification
 * 2. Add to ALL_RULES array
 * 3. The rule will be loaded when its platform matches the active profile
 *
 * @example
 * ```typescript
 * const registry = new RuleRegistry(ScanProfile.SPRING);
 * // Only Spring Boot rules are loaded
 *
 * const applicableRules = registry.getRulesForKey('spring.profiles.active');
 * ```
 */
import { Rule } from '../models/rule';
import { ScanProfile } from '../models/scan-profile';
/**
 * Registry for managing security rules with profile-based filtering.
 * Provides registration, retrieval, and filtering of rules.
 */
export declare class RuleRegistry {
    private readonly rules;
    private readonly profile;
    /**
     * Index for fast lookup of rules by target key.
     * Maps config keys to rule IDs that apply to them.
     */
    private readonly keyToRuleIds;
    /**
     * Set of rule IDs that match all keys (wildcard rules).
     */
    private readonly wildcardRuleIds;
    /**
     * Creates a new RuleRegistry filtered by profile.
     *
     * @param profile - The scan profile determining which rules to load
     */
    constructor(profile?: ScanProfile);
    /**
     * Registers a rule in the registry if it matches the active profile.
     *
     * @param rule - The rule to register
     * @throws Error if a rule with the same ID is already registered
     *
     * @example
     * ```typescript
     * registry.register({
     *   id: 'MY_RULE',
     *   name: 'My Rule',
     *   platforms: [Platform.SPRING_BOOT],
     *   // ... other fields
     * });
     * ```
     */
    register(rule: Rule): void;
    /**
     * Checks if a rule matches the active profile.
     */
    private ruleMatchesProfile;
    /**
     * Gets the active profile.
     */
    getProfile(): ScanProfile;
    /**
     * Indexes a rule by its target keys for fast lookup.
     */
    private indexRuleByTargetKeys;
    /**
     * Gets all registered rules.
     *
     * @returns Array of all registered rules
     */
    getAllRules(): readonly Rule[];
    /**
     * Gets a specific rule by ID.
     *
     * @param id - The rule ID to look up
     * @returns The rule, or undefined if not found
     */
    getRule(id: string): Rule | undefined;
    /**
     * Gets all rules that apply to a specific configuration key.
     * Includes both exact matches and wildcard rules.
     *
     * @param key - The configuration key to match
     * @returns Array of applicable rules
     *
     * @example
     * ```typescript
     * // Returns rules targeting 'spring.profiles.active' and '*'
     * const rules = registry.getRulesForKey('spring.profiles.active');
     * ```
     */
    getRulesForKey(key: string): readonly Rule[];
    /**
     * Returns the total number of registered rules.
     */
    get size(): number;
    /**
     * Clears all registered rules.
     * Primarily useful for testing.
     */
    clear(): void;
}
/**
 * Default global rule registry instance.
 * Use this for production; create new instances for testing.
 */
export declare const defaultRuleRegistry: RuleRegistry;
//# sourceMappingURL=rule-registry.d.ts.map
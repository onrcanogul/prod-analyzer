"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRuleRegistry = exports.RuleRegistry = void 0;
const scan_profile_1 = require("../models/scan-profile");
/**
 * Registry for managing security rules with profile-based filtering.
 * Provides registration, retrieval, and filtering of rules.
 */
class RuleRegistry {
    rules = new Map();
    profile;
    /**
     * Index for fast lookup of rules by target key.
     * Maps config keys to rule IDs that apply to them.
     */
    keyToRuleIds = new Map();
    /**
     * Set of rule IDs that match all keys (wildcard rules).
     */
    wildcardRuleIds = new Set();
    /**
     * Creates a new RuleRegistry filtered by profile.
     *
     * @param profile - The scan profile determining which rules to load
     */
    constructor(profile = scan_profile_1.ScanProfile.SPRING) {
        this.profile = profile;
    }
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
    register(rule) {
        // Filter by profile - only register rules matching active platforms
        if (!this.ruleMatchesProfile(rule)) {
            return; // Skip this rule silently
        }
        if (this.rules.has(rule.id)) {
            throw new Error(`Rule with ID "${rule.id}" is already registered. ` +
                `Rule IDs must be unique.`);
        }
        this.rules.set(rule.id, rule);
        this.indexRuleByTargetKeys(rule);
    }
    /**
     * Checks if a rule matches the active profile.
     */
    ruleMatchesProfile(rule) {
        // If rule has no platform specification, it applies to all profiles
        if (!rule.platforms || rule.platforms.length === 0) {
            return true;
        }
        const activePlatforms = (0, scan_profile_1.getPlatformsForProfile)(this.profile);
        // Rule matches if any of its platforms are in the active profile
        return rule.platforms.some(platform => activePlatforms.includes(platform));
    }
    /**
     * Gets the active profile.
     */
    getProfile() {
        return this.profile;
    }
    /**
     * Indexes a rule by its target keys for fast lookup.
     */
    indexRuleByTargetKeys(rule) {
        for (const key of rule.targetKeys) {
            if (key === '*') {
                this.wildcardRuleIds.add(rule.id);
            }
            else {
                const existingIds = this.keyToRuleIds.get(key);
                if (existingIds) {
                    existingIds.add(rule.id);
                }
                else {
                    this.keyToRuleIds.set(key, new Set([rule.id]));
                }
            }
        }
    }
    /**
     * Gets all registered rules.
     *
     * @returns Array of all registered rules
     */
    getAllRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Gets a specific rule by ID.
     *
     * @param id - The rule ID to look up
     * @returns The rule, or undefined if not found
     */
    getRule(id) {
        return this.rules.get(id);
    }
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
    getRulesForKey(key) {
        const ruleIds = new Set();
        // Add exact matches
        const exactMatches = this.keyToRuleIds.get(key);
        if (exactMatches) {
            for (const id of exactMatches) {
                ruleIds.add(id);
            }
        }
        // Add wildcard rules
        for (const id of this.wildcardRuleIds) {
            ruleIds.add(id);
        }
        // Convert IDs to rules
        const applicableRules = [];
        for (const id of ruleIds) {
            const rule = this.rules.get(id);
            if (rule) {
                applicableRules.push(rule);
            }
        }
        return applicableRules;
    }
    /**
     * Returns the total number of registered rules.
     */
    get size() {
        return this.rules.size;
    }
    /**
     * Clears all registered rules.
     * Primarily useful for testing.
     */
    clear() {
        this.rules.clear();
        this.keyToRuleIds.clear();
        this.wildcardRuleIds.clear();
    }
}
exports.RuleRegistry = RuleRegistry;
/**
 * Default global rule registry instance.
 * Use this for production; create new instances for testing.
 */
exports.defaultRuleRegistry = new RuleRegistry();
//# sourceMappingURL=rule-registry.js.map
/**
 * ============================================================================
 * RULE REGISTRY - TESTS
 * ============================================================================
 */

import { RuleRegistry } from './rule-registry';
import { Rule } from '../models/rule';
import { Severity } from '../models/severity';

describe('RuleRegistry', () => {
  let registry: RuleRegistry;
  
  const createMockRule = (id: string, targetKeys: string[]): Rule => ({
    id,
    name: `Mock Rule ${id}`,
    description: 'A mock rule for testing',
    defaultSeverity: Severity.HIGH,
    targetKeys,
    evaluate: () => [],
  });
  
  beforeEach(() => {
    registry = new RuleRegistry();
  });
  
  describe('register', () => {
    it('should register a rule successfully', () => {
      const rule = createMockRule('TEST_RULE', ['some.key']);
      
      registry.register(rule);
      
      expect(registry.size).toBe(1);
      expect(registry.getRule('TEST_RULE')).toBe(rule);
    });
    
    it('should throw on duplicate rule ID', () => {
      const rule1 = createMockRule('DUPLICATE', ['key1']);
      const rule2 = createMockRule('DUPLICATE', ['key2']);
      
      registry.register(rule1);
      
      expect(() => registry.register(rule2)).toThrow('already registered');
    });
  });
  
  describe('getAllRules', () => {
    it('should return all registered rules', () => {
      const rule1 = createMockRule('RULE1', ['key1']);
      const rule2 = createMockRule('RULE2', ['key2']);
      
      registry.register(rule1);
      registry.register(rule2);
      
      const allRules = registry.getAllRules();
      
      expect(allRules).toHaveLength(2);
      expect(allRules).toContain(rule1);
      expect(allRules).toContain(rule2);
    });
    
    it('should return empty array when no rules registered', () => {
      expect(registry.getAllRules()).toHaveLength(0);
    });
  });
  
  describe('getRulesForKey', () => {
    it('should return rules matching exact key', () => {
      const rule1 = createMockRule('RULE1', ['spring.profiles.active']);
      const rule2 = createMockRule('RULE2', ['logging.level.root']);
      
      registry.register(rule1);
      registry.register(rule2);
      
      const matchingRules = registry.getRulesForKey('spring.profiles.active');
      
      expect(matchingRules).toHaveLength(1);
      expect(matchingRules[0]?.id).toBe('RULE1');
    });
    
    it('should return wildcard rules for any key', () => {
      const wildcardRule = createMockRule('WILDCARD', ['*']);
      const specificRule = createMockRule('SPECIFIC', ['some.key']);
      
      registry.register(wildcardRule);
      registry.register(specificRule);
      
      const matchingRules = registry.getRulesForKey('any.random.key');
      
      expect(matchingRules).toHaveLength(1);
      expect(matchingRules[0]?.id).toBe('WILDCARD');
    });
    
    it('should return both exact and wildcard matches', () => {
      const wildcardRule = createMockRule('WILDCARD', ['*']);
      const specificRule = createMockRule('SPECIFIC', ['target.key']);
      
      registry.register(wildcardRule);
      registry.register(specificRule);
      
      const matchingRules = registry.getRulesForKey('target.key');
      
      expect(matchingRules).toHaveLength(2);
    });
    
    it('should return empty array for non-matching key', () => {
      const rule = createMockRule('RULE', ['some.key']);
      registry.register(rule);
      
      const matchingRules = registry.getRulesForKey('other.key');
      
      expect(matchingRules).toHaveLength(0);
    });
  });
  
  describe('clear', () => {
    it('should remove all registered rules', () => {
      registry.register(createMockRule('RULE1', ['key1']));
      registry.register(createMockRule('RULE2', ['key2']));
      
      registry.clear();
      
      expect(registry.size).toBe(0);
      expect(registry.getAllRules()).toHaveLength(0);
    });
  });
});

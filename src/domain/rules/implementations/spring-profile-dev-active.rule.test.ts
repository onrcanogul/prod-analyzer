/**
 * ============================================================================
 * SPRING PROFILE DEV ACTIVE RULE - TESTS
 * ============================================================================
 */

import { springProfileDevActiveRule } from './spring-profile-dev-active.rule';
import { Severity } from '../../models/severity';
import { ConfigEntry } from '../../models/config-entry';

describe('SpringProfileDevActiveRule', () => {
  const rule = springProfileDevActiveRule;
  
  const createEntry = (value: string, key: string = 'spring.profiles.active'): ConfigEntry => ({
    key,
    value,
    sourceFile: '/app/application.yml',
    lineNumber: 5,
  });
  
  describe('rule metadata', () => {
    it('should have correct id', () => {
      expect(rule.id).toBe('SPRING_PROFILE_DEV_ACTIVE');
    });
    
    it('should have HIGH default severity', () => {
      expect(rule.defaultSeverity).toBe(Severity.HIGH);
    });
    
    it('should target spring.profiles.active key', () => {
      expect(rule.targetKeys).toContain('spring.profiles.active');
    });
  });
  
  describe('evaluate', () => {
    it('should return violation for dev profile', () => {
      const entry = createEntry('dev');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
      expect(violations[0]?.ruleId).toBe('SPRING_PROFILE_DEV_ACTIVE');
      expect(violations[0]?.severity).toBe(Severity.HIGH);
    });
    
    it('should return violation for test profile', () => {
      const entry = createEntry('test');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
    });
    
    it('should return violation for development profile', () => {
      const entry = createEntry('development');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
    });
    
    it('should return violation for local profile', () => {
      const entry = createEntry('local');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
    });
    
    it('should return no violation for prod profile', () => {
      const entry = createEntry('prod');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(0);
    });
    
    it('should return no violation for production profile', () => {
      const entry = createEntry('production');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(0);
    });
    
    it('should detect dev in comma-separated profiles', () => {
      const entry = createEntry('cloud,dev,oauth');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
    });
    
    it('should be case-insensitive', () => {
      const entry = createEntry('DEV');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(1);
    });
    
    it('should ignore non-target keys', () => {
      const entry = createEntry('dev', 'some.other.key');
      const violations = rule.evaluate(entry);
      
      expect(violations).toHaveLength(0);
    });
    
    it('should include correct violation details', () => {
      const entry = createEntry('dev');
      const violations = rule.evaluate(entry);
      
      expect(violations[0]).toMatchObject({
        filePath: '/app/application.yml',
        configKey: 'spring.profiles.active',
        configValue: 'dev',
        lineNumber: 5,
      });
      expect(violations[0]?.suggestion).toBeTruthy();
    });
  });
});

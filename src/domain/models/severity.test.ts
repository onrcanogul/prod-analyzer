/**
 * ============================================================================
 * SEVERITY MODEL - TESTS
 * ============================================================================
 */

import { 
  Severity, 
  parseSeverity, 
  compareSeverity, 
  maxSeverity,
  SEVERITY_LABELS,
} from './severity';

describe('Severity', () => {
  describe('enum values', () => {
    it('should have correct numeric ordering', () => {
      expect(Severity.INFO).toBeLessThan(Severity.LOW);
      expect(Severity.LOW).toBeLessThan(Severity.MEDIUM);
      expect(Severity.MEDIUM).toBeLessThan(Severity.HIGH);
      expect(Severity.HIGH).toBeLessThan(Severity.CRITICAL);
    });
  });
  
  describe('SEVERITY_LABELS', () => {
    it('should have labels for all severity levels', () => {
      expect(SEVERITY_LABELS[Severity.INFO]).toBe('INFO');
      expect(SEVERITY_LABELS[Severity.LOW]).toBe('LOW');
      expect(SEVERITY_LABELS[Severity.MEDIUM]).toBe('MEDIUM');
      expect(SEVERITY_LABELS[Severity.HIGH]).toBe('HIGH');
      expect(SEVERITY_LABELS[Severity.CRITICAL]).toBe('CRITICAL');
    });
  });
  
  describe('parseSeverity', () => {
    it('should parse uppercase values', () => {
      expect(parseSeverity('HIGH')).toBe(Severity.HIGH);
      expect(parseSeverity('MEDIUM')).toBe(Severity.MEDIUM);
    });
    
    it('should parse lowercase values', () => {
      expect(parseSeverity('high')).toBe(Severity.HIGH);
      expect(parseSeverity('low')).toBe(Severity.LOW);
    });
    
    it('should parse mixed case values', () => {
      expect(parseSeverity('High')).toBe(Severity.HIGH);
      expect(parseSeverity('MeDiUm')).toBe(Severity.MEDIUM);
    });
    
    it('should trim whitespace', () => {
      expect(parseSeverity('  HIGH  ')).toBe(Severity.HIGH);
    });
    
    it('should throw on invalid value', () => {
      expect(() => parseSeverity('INVALID')).toThrow('Invalid severity');
      expect(() => parseSeverity('')).toThrow('Invalid severity');
    });
  });
  
  describe('compareSeverity', () => {
    it('should return positive when a > b', () => {
      expect(compareSeverity(Severity.HIGH, Severity.LOW)).toBeGreaterThan(0);
    });
    
    it('should return negative when a < b', () => {
      expect(compareSeverity(Severity.LOW, Severity.HIGH)).toBeLessThan(0);
    });
    
    it('should return zero when equal', () => {
      expect(compareSeverity(Severity.MEDIUM, Severity.MEDIUM)).toBe(0);
    });
  });
  
  describe('maxSeverity', () => {
    it('should return highest severity', () => {
      const severities = [Severity.LOW, Severity.HIGH, Severity.MEDIUM];
      expect(maxSeverity(severities)).toBe(Severity.HIGH);
    });
    
    it('should return INFO for empty array', () => {
      expect(maxSeverity([])).toBe(Severity.INFO);
    });
    
    it('should handle single element', () => {
      expect(maxSeverity([Severity.CRITICAL])).toBe(Severity.CRITICAL);
    });
  });
});

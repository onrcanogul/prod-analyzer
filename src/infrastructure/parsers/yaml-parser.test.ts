/**
 * ============================================================================
 * YAML PARSER - TESTS
 * ============================================================================
 */

import { parseYamlContent } from './yaml-parser';
import { ConfigFileFormat } from '../../domain/models/config-entry';

describe('YamlParser', () => {
  describe('parseYamlContent', () => {
    it('should parse simple key-value pairs', () => {
      const yaml = `
server:
  port: 8080
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toEqual({
        key: 'server.port',
        value: '8080',
        sourceFile: '/app/application.yml',
      });
    });
    
    it('should parse deeply nested structures', () => {
      const yaml = `
spring:
  profiles:
    active: dev
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]?.key).toBe('spring.profiles.active');
      expect(result.entries[0]?.value).toBe('dev');
    });
    
    it('should parse multiple entries', () => {
      const yaml = `
server:
  port: 8080
  host: localhost
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      
      expect(result.entries).toHaveLength(2);
      expect(result.entries.map(e => e.key)).toContain('server.port');
      expect(result.entries.map(e => e.key)).toContain('server.host');
    });
    
    it('should handle arrays with indexed notation', () => {
      const yaml = `
servers:
  - host: server1
    port: 8080
  - host: server2
    port: 8081
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      
      expect(result.entries.map(e => e.key)).toContain('servers[0].host');
      expect(result.entries.map(e => e.key)).toContain('servers[0].port');
      expect(result.entries.map(e => e.key)).toContain('servers[1].host');
      expect(result.entries.map(e => e.key)).toContain('servers[1].port');
    });
    
    it('should convert all values to strings', () => {
      const yaml = `
enabled: true
count: 42
ratio: 3.14
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      
      const enabledEntry = result.entries.find(e => e.key === 'enabled');
      const countEntry = result.entries.find(e => e.key === 'count');
      const ratioEntry = result.entries.find(e => e.key === 'ratio');
      
      expect(enabledEntry?.value).toBe('true');
      expect(countEntry?.value).toBe('42');
      expect(ratioEntry?.value).toBe('3.14');
    });
    
    it('should return correct file format', () => {
      const result = parseYamlContent('key: value', '/app/application.yml');
      expect(result.format).toBe(ConfigFileFormat.YAML);
    });
    
    it('should handle empty content', () => {
      const result = parseYamlContent('', '/app/application.yml');
      expect(result.entries).toHaveLength(0);
    });
    
    it('should handle invalid YAML gracefully', () => {
      const invalidYaml = `
key: value
  invalid: indentation
`;
      // Should not throw, but return empty or partial results
      const result = parseYamlContent(invalidYaml, '/app/application.yml');
      expect(result.filePath).toBe('/app/application.yml');
    });
    
    it('should skip null values', () => {
      const yaml = `
key1: value1
key2: ~
key3: value3
`;
      const result = parseYamlContent(yaml, '/app/application.yml');
      const keys = result.entries.map(e => e.key);
      
      expect(keys).toContain('key1');
      expect(keys).not.toContain('key2');
      expect(keys).toContain('key3');
    });
  });
});

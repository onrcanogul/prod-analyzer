import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * Configuration patterns that indicate insecure HTTP is allowed.
 */
const INSECURE_HTTP_PATTERNS = [
  // Generic
  { key: 'allow_http', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'allowhttp', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'insecure', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'secure', dangerousValue: 'false', severity: Severity.HIGH },
  { key: 'force_https', dangerousValue: 'false', severity: Severity.HIGH },
  { key: 'require_https', dangerousValue: 'false', severity: Severity.HIGH },
  { key: 'enforce_https', dangerousValue: 'false', severity: Severity.HIGH },
  
  // Protocol specific
  { key: 'protocol', dangerousValue: 'http', severity: Severity.MEDIUM },
  { key: 'scheme', dangerousValue: 'http', severity: Severity.MEDIUM },
  
  // URL patterns
  { key: 'url', dangerousPattern: /^http:\/\//, severity: Severity.MEDIUM },
  { key: 'endpoint', dangerousPattern: /^http:\/\//, severity: Severity.MEDIUM },
  { key: 'api_url', dangerousPattern: /^http:\/\//, severity: Severity.MEDIUM },
  { key: 'base_url', dangerousPattern: /^http:\/\//, severity: Severity.MEDIUM },
  { key: 'webhook_url', dangerousPattern: /^http:\/\//, severity: Severity.HIGH },
];

export const allowInsecureHttpRule: Rule = {
  id: 'ALLOW_INSECURE_HTTP',
  name: 'Insecure HTTP Protocol Allowed',
  description: 'Detects configuration that allows or enforces insecure HTTP instead of HTTPS',
  defaultSeverity: Severity.HIGH,
  targetKeys: ['*'], // Check all keys
  
  evaluate(entry) {
    const key = entry.key.toLowerCase().replace(/[._-]/g, '_');
    const value = String(entry.value).toLowerCase();
    
    for (const pattern of INSECURE_HTTP_PATTERNS) {
      const normalizedPatternKey = pattern.key.replace(/[._-]/g, '_');
      
      // Check exact value match
      if ('dangerousValue' in pattern) {
        if (key.includes(normalizedPatternKey) && value === pattern.dangerousValue) {
          return [createViolation({
            ruleId: this.id,
            severity: pattern.severity,
            message: `Insecure HTTP is allowed via "${entry.key}=${entry.value}". All traffic should use HTTPS to prevent data interception.`,
            filePath: entry.sourceFile,
            configKey: entry.key,
            configValue: entry.value,
            lineNumber: entry.lineNumber,
            suggestion: [
              'Use HTTPS for all external communications',
              'Enable HTTPS enforcement/redirection in your application',
              'Configure SSL/TLS certificates properly',
              'HTTP traffic can be intercepted and modified by attackers',
              'For local development, use separate configuration profiles',
              'Consider using Let\'s Encrypt for free SSL certificates',
            ].join(' '),
          })];
        }
      }
      
      // Check regex pattern match
      if ('dangerousPattern' in pattern) {
        if (key.includes(normalizedPatternKey) && pattern.dangerousPattern.test(value)) {
          return [createViolation({
            ruleId: this.id,
            severity: pattern.severity,
            message: `Insecure HTTP URL detected in "${entry.key}". URLs should use HTTPS protocol.`,
            filePath: entry.sourceFile,
            configKey: entry.key,
            configValue: entry.value,
            lineNumber: entry.lineNumber,
            suggestion: [
              `Change URL to use HTTPS protocol: ${value.replace('http://', 'https://')}`,
              'Ensure the target server supports HTTPS',
              'HTTP URLs expose data in transit to interception',
              'Use environment variables for different environments',
            ].join(' '),
          })];
        }
      }
    }
    
    return [];
  },
};

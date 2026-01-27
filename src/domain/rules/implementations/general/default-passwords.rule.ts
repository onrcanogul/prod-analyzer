import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * Common weak/default passwords that should never be used in production.
 * This list covers various types of placeholder values.
 */
const WEAK_PASSWORDS = [
  // Common defaults
  'admin', 'password', 'root', 'test', 'demo', 'guest', 'user',
  
  // Placeholder values
  'changeme', 'change_me', 'change-me', 'replaceme', 'placeholder',
  'example', 'sample', 'default', 'temp', 'temporary',
  
  // Weak patterns
  '123456', '12345678', 'qwerty', 'abc123', 'password123',
  '111111', '000000', 'letmein', 'welcome', 'monkey',
  
  // Framework defaults
  'secret', 'secretkey', 'supersecret', 'mysecret',
  'trustno1', 'dragon', 'master', 'sunshine',
];

/**
 * Keys that typically contain passwords or sensitive credentials.
 * Case-insensitive matching.
 */
const PASSWORD_KEY_PATTERNS = [
  'password', 'passwd', 'pwd', 'pass',
  'secret', 'token', 'key', 'credential',
  'auth', 'api_key', 'apikey', 'api-key',
  'private_key', 'privatekey',
];

export const defaultPasswordsRule: Rule = {
  id: 'DEFAULT_PASSWORDS',
  name: 'Default/Weak Passwords Detected',
  description: 'Detects common default passwords, placeholder values, and weak credentials in configuration',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: ['*'], // Check all keys
  
  evaluate(entry) {
    const key = entry.key.toLowerCase();
    const value = String(entry.value).toLowerCase();
    
    // Check if this key looks like it contains a password/secret
    const isPasswordKey = PASSWORD_KEY_PATTERNS.some(pattern => 
      key.includes(pattern)
    );
    
    if (!isPasswordKey) {
      return [];
    }
    
    // Check if the value is a known weak password
    const isWeakPassword = WEAK_PASSWORDS.some(weak => 
      value === weak.toLowerCase()
    );
    
    if (isWeakPassword) {
      return [createViolation({
        ruleId: this.id,
        severity: this.defaultSeverity,
        message: `Weak or default password detected in "${entry.key}". This is a critical security risk that can lead to unauthorized access.`,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: '***REDACTED***', // Never expose the actual password
        lineNumber: entry.lineNumber,
        suggestion: [
          'Generate a strong, random password (minimum 16 characters)',
          'Use a password manager or secrets management service',
          'Never commit credentials to version control',
          'Rotate credentials immediately if this was exposed',
          'Use environment variables or encrypted secrets storage',
        ].join(' '),
      })];
    }
    
    return [];
  },
};

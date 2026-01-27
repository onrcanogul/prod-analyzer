import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * Regex patterns for detecting private keys in various formats.
 */
const PRIVATE_KEY_PATTERNS = [
  /-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----/i,
  /-----BEGIN OPENSSH PRIVATE KEY-----/i,
  /-----BEGIN PGP PRIVATE KEY BLOCK-----/i,
  /-----BEGIN ENCRYPTED PRIVATE KEY-----/i,
];

/**
 * Keys that might contain private key content.
 */
const PRIVATE_KEY_NAMES = [
  'private_key', 'privatekey', 'private-key',
  'ssh_key', 'sshkey', 'ssh-key',
  'rsa_key', 'rsakey', 'rsa-key',
  'ssl_key', 'sslkey', 'ssl-key',
  'tls_key', 'tlskey', 'tls-key',
  'key', 'pem', 'cert_key',
];

export const privateKeyInRepoRule: Rule = {
  id: 'PRIVATE_KEY_IN_REPO',
  name: 'Private Key in Configuration',
  description: 'Detects private keys stored directly in configuration files instead of secure key management',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: ['*'], // Check all keys
  
  evaluate(entry) {
    const key = entry.key.toLowerCase();
    const value = String(entry.value);
    
    // Check if key name suggests it might contain a private key
    const isPrivateKeyName = PRIVATE_KEY_NAMES.some(pattern => 
      key.includes(pattern)
    );
    
    // Check if value contains a private key header
    const containsPrivateKey = PRIVATE_KEY_PATTERNS.some(pattern => 
      pattern.test(value)
    );
    
    if (isPrivateKeyName || containsPrivateKey) {
      return [createViolation({
        ruleId: this.id,
        severity: this.defaultSeverity,
        message: `Private key detected in configuration "${entry.key}". Storing private keys in configuration files is extremely dangerous.`,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: '***PRIVATE_KEY_REDACTED***',
        lineNumber: entry.lineNumber,
        suggestion: [
          'IMMEDIATELY rotate this key - it is now compromised',
          'Use a secrets management service (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)',
          'Store keys in secure file systems with proper permissions (0600)',
          'Never commit private keys to version control',
          'Use certificate management tools for SSL/TLS certificates',
          'Consider using cloud provider managed certificates',
        ].join(' '),
      })];
    }
    
    return [];
  },
};

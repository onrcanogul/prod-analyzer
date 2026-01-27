import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * Common configuration keys that enable TLS certificate verification bypass.
 */
const TLS_VERIFY_KEYS = [
  // Node.js
  { key: 'node_tls_reject_unauthorized', dangerousValue: '0' },
  { key: 'node_tls_reject_unauthorized', dangerousValue: 'false' },
  
  // Generic
  { key: 'ssl_verify', dangerousValue: 'false' },
  { key: 'ssl_verify', dangerousValue: '0' },
  { key: 'tls_verify', dangerousValue: 'false' },
  { key: 'tls_verify', dangerousValue: '0' },
  { key: 'verify_ssl', dangerousValue: 'false' },
  { key: 'verify_tls', dangerousValue: 'false' },
  { key: 'strict_ssl', dangerousValue: 'false' },
  { key: 'reject_unauthorized', dangerousValue: 'false' },
  
  // HTTP client libraries
  { key: 'verify', dangerousValue: 'false' },
  { key: 'insecure', dangerousValue: 'true' },
  { key: 'allow_insecure', dangerousValue: 'true' },
  { key: 'skip_verify', dangerousValue: 'true' },
  { key: 'disable_ssl_verification', dangerousValue: 'true' },
];

export const tlsVerifyDisabledRule: Rule = {
  id: 'TLS_VERIFY_DISABLED',
  name: 'TLS Certificate Verification Disabled',
  description: 'Detects disabled TLS/SSL certificate verification which allows man-in-the-middle attacks',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: ['*'], // Check all keys
  
  evaluate(entry) {
    const key = entry.key.toLowerCase().replace(/[._-]/g, '_');
    const value = String(entry.value).toLowerCase();
    
    const isDangerous = TLS_VERIFY_KEYS.some(({ key: dangerousKey, dangerousValue }) => {
      const normalizedDangerousKey = dangerousKey.replace(/[._-]/g, '_');
      return key.includes(normalizedDangerousKey) && value === dangerousValue;
    });
    
    if (isDangerous) {
      return [createViolation({
        ruleId: this.id,
        severity: this.defaultSeverity,
        message: `TLS certificate verification is disabled in "${entry.key}". This allows man-in-the-middle attacks and data interception.`,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: entry.value,
        lineNumber: entry.lineNumber,
        suggestion: [
          'NEVER disable TLS verification in production',
          'Remove or set to true/1 to enable certificate verification',
          'If using self-signed certificates, add them to your trust store instead',
          'For development, use separate configuration profiles',
          'This vulnerability allows attackers to intercept and modify encrypted traffic',
          'Consider this a critical security issue requiring immediate remediation',
        ].join(' '),
      })];
    }
    
    return [];
  },
};

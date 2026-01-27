import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * Cloud provider API key/token patterns.
 * These regex patterns detect various cloud service credentials.
 */
const CLOUD_TOKEN_PATTERNS = [
  // AWS
  {
    name: 'AWS Access Key ID',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: Severity.CRITICAL,
  },
  {
    name: 'AWS Secret Access Key',
    pattern: /aws.{0,20}['\"][0-9a-zA-Z/+=]{40}['\"]/i,
    severity: Severity.CRITICAL,
  },
  
  // GitHub
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[0-9a-zA-Z]{36}/,
    severity: Severity.CRITICAL,
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /gho_[0-9a-zA-Z]{36}/,
    severity: Severity.CRITICAL,
  },
  {
    name: 'GitHub App Token',
    pattern: /ghu_[0-9a-zA-Z]{36}/,
    severity: Severity.CRITICAL,
  },
  
  // Stripe
  {
    name: 'Stripe Live Secret Key',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/,
    severity: Severity.CRITICAL,
  },
  {
    name: 'Stripe Live Publishable Key',
    pattern: /pk_live_[0-9a-zA-Z]{24,}/,
    severity: Severity.HIGH,
  },
  
  // Google Cloud
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z\\-_]{35}/,
    severity: Severity.CRITICAL,
  },
  {
    name: 'Google OAuth Token',
    pattern: /ya29\.[0-9A-Za-z\\-_]+/,
    severity: Severity.CRITICAL,
  },
  
  // Azure
  {
    name: 'Azure Storage Account Key',
    pattern: /AccountKey=[0-9a-zA-Z/+=]{88}/,
    severity: Severity.CRITICAL,
  },
  
  // Slack
  {
    name: 'Slack Webhook',
    pattern: /hooks\.slack\.com\/services\/T[0-9A-Z]{8,}\/B[0-9A-Z]{8,}\/[0-9a-zA-Z]{24,}/,
    severity: Severity.HIGH,
  },
  {
    name: 'Slack Bot Token',
    pattern: /xoxb-[0-9]{11,}-[0-9]{11,}-[0-9a-zA-Z]{24,}/,
    severity: Severity.CRITICAL,
  },
  
  // Twilio
  {
    name: 'Twilio API Key',
    pattern: /SK[0-9a-f]{32}/,
    severity: Severity.CRITICAL,
  },
  
  // SendGrid
  {
    name: 'SendGrid API Key',
    pattern: /SG\.[0-9A-Za-z\\-_]{22}\.[0-9A-Za-z\\-_]{43}/,
    severity: Severity.CRITICAL,
  },
  
  // Generic private key pattern
  {
    name: 'Generic Private Key',
    pattern: /-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----/,
    severity: Severity.CRITICAL,
  },
];

export const cloudTokenExposureRule: Rule = {
  id: 'CLOUD_TOKEN_EXPOSURE',
  name: 'Cloud Provider Token/Key Exposure',
  description: 'Detects exposed cloud provider API keys, tokens, and credentials (AWS, GCP, Azure, Stripe, GitHub, etc.)',
  defaultSeverity: Severity.CRITICAL,
  targetKeys: ['*'], // Check all values
  
  evaluate(entry) {
    const value = String(entry.value);
    const violations = [];
    
    for (const { name, pattern, severity } of CLOUD_TOKEN_PATTERNS) {
      if (pattern.test(value)) {
        violations.push(createViolation({
          ruleId: this.id,
          severity,
          message: `${name} detected in configuration "${entry.key}". This credential must be rotated immediately.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: '***CLOUD_TOKEN_REDACTED***',
          lineNumber: entry.lineNumber,
          suggestion: [
            `IMMEDIATE ACTION REQUIRED: Rotate this ${name} now - it is compromised`,
            'Use environment variables or secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)',
            'Enable credential scanning in your CI/CD pipeline',
            'Review access logs for unauthorized usage',
            'Implement credential rotation policies',
            'Use short-lived tokens where possible',
            'Never commit credentials to version control',
          ].join(' '),
        }));
      }
    }
    
    return violations;
  },
};

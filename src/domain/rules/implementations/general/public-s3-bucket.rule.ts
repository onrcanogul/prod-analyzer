import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

/**
 * S3 bucket ACL configurations that indicate public access.
 */
const PUBLIC_S3_PATTERNS = [
  // ACL patterns
  { key: 'acl', dangerousValue: 'public-read', severity: Severity.HIGH },
  { key: 'acl', dangerousValue: 'public-read-write', severity: Severity.CRITICAL },
  { key: 'acl', dangerousValue: 'authenticated-read', severity: Severity.MEDIUM },
  
  // Explicit public settings
  { key: 'public', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'is_public', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'publicread', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'public_read', dangerousValue: 'true', severity: Severity.HIGH },
  { key: 'public_access', dangerousValue: 'true', severity: Severity.HIGH },
  
  // Block public access settings (should be true, dangerous if false)
  { key: 'block_public_acls', dangerousValue: 'false', severity: Severity.HIGH },
  { key: 'block_public_policy', dangerousValue: 'false', severity: Severity.HIGH },
  { key: 'ignore_public_acls', dangerousValue: 'false', severity: Severity.MEDIUM },
  { key: 'restrict_public_buckets', dangerousValue: 'false', severity: Severity.MEDIUM },
];

export const publicS3BucketRule: Rule = {
  id: 'PUBLIC_S3_BUCKET',
  name: 'Public S3 Bucket Configuration',
  description: 'Detects S3 bucket configurations that may expose data publicly',
  defaultSeverity: Severity.HIGH,
  targetKeys: ['*'], // Check all keys
  
  evaluate(entry) {
    const key = entry.key.toLowerCase().replace(/[._-]/g, '_');
    const value = String(entry.value).toLowerCase();
    
    // Check if this is likely an S3/storage related key
    const isStorageRelated = 
      key.includes('s3') || 
      key.includes('bucket') || 
      key.includes('storage') ||
      key.includes('acl');
    
    if (!isStorageRelated) {
      return [];
    }
    
    for (const pattern of PUBLIC_S3_PATTERNS) {
      const normalizedPatternKey = pattern.key.replace(/[._-]/g, '_');
      
      if (key.includes(normalizedPatternKey) && value === pattern.dangerousValue) {
        const isBlockSetting = normalizedPatternKey.includes('block') || 
                               normalizedPatternKey.includes('restrict') ||
                               normalizedPatternKey.includes('ignore');
        
        return [createViolation({
          ruleId: this.id,
          severity: pattern.severity,
          message: isBlockSetting 
            ? `S3 public access protection is disabled in "${entry.key}". This may expose bucket data publicly.`
            : `S3 bucket is configured for public access in "${entry.key}". This may expose sensitive data.`,
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion: isBlockSetting
            ? [
                'Enable S3 Block Public Access settings',
                'Set block_public_acls=true, block_public_policy=true',
                'Review bucket policies for unintended public access',
                'Use CloudFront or signed URLs for controlled public access',
                'Audit existing bucket permissions',
              ].join(' ')
            : [
                'Remove public ACL settings from S3 buckets',
                'Use private ACLs and bucket policies for access control',
                'Enable S3 Block Public Access at account level',
                'Use CloudFront with Origin Access Identity for public content',
                'Implement signed URLs for temporary access',
                'Regularly audit S3 bucket permissions',
              ].join(' '),
        })];
      }
    }
    
    return [];
  },
};

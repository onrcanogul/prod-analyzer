/**
 * ============================================================================
 * CONNECTION STRING EXPOSURE RULE (.NET)
 * ============================================================================
 *
 * Detects when connection strings contain sensitive information in plain text.
 *
 * Security Rationale:
 * - Connection strings often contain:
 *   - Database credentials
 *   - Server addresses
 *   - Encryption keys
 * - Should use secure configuration providers (Azure Key Vault, AWS Secrets Manager)
 * - Should not be committed to source control
 *
 * This is a CRITICAL severity issue.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects exposed connection strings in .NET configuration.
 */
export declare const connectionStringExposureRule: Rule;
//# sourceMappingURL=connection-string-exposure.rule.d.ts.map
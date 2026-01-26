"use strict";
/**
 * ============================================================================
 * JWT WEAK SECRET RULE (Node.js)
 * ============================================================================
 *
 * Detects weak JWT signing secrets.
 *
 * Security Rationale:
 * - JWT tokens are signed with a secret to prevent tampering
 * - Weak secrets can be brute-forced, allowing:
 *   - Token forgery (create fake authentication tokens)
 *   - Privilege escalation (modify user roles/claims)
 *   - Complete authentication bypass
 * - Minimum secret length should be 256 bits (32 characters)
 * - Should use cryptographically random values
 *
 * This is a CRITICAL severity issue as it breaks authentication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtWeakSecretRule = void 0;
const platform_1 = require("../../../models/platform");
const severity_1 = require("../../../models/severity");
const violation_1 = require("../../../models/violation");
const JWT_SECRET_KEYS = [
    'jwt.secret',
    'jwt.key',
    'jwt.signing.key',
    'jwt.token.secret',
    'access.token.secret',
    'refresh.token.secret',
];
const MIN_SECRET_LENGTH = 32; // 256 bits
const WEAK_PATTERNS = [
    /^(secret|password|key|token|jwt|changeme|admin|test|demo|example)/i,
    /^[0-9]{1,10}$/, // Only digits, too short
    /^[a-z]{1,15}$/i, // Only letters, too short
    /^(.)\1+$/, // Repeating characters (aaaa, 1111)
];
/**
 * Rule: Detects weak JWT signing secrets.
 */
exports.jwtWeakSecretRule = {
    id: 'JWT_WEAK_SECRET',
    name: 'Weak JWT Secret',
    description: 'Detects weak JWT signing secrets that can be brute-forced, ' +
        'allowing attackers to forge authentication tokens.',
    defaultSeverity: severity_1.Severity.CRITICAL,
    targetKeys: JWT_SECRET_KEYS,
    platforms: [platform_1.Platform.NODEJS],
    evaluate(entry) {
        // Check if key matches JWT secret pattern
        const isJwtSecret = JWT_SECRET_KEYS.some(key => entry.key.toLowerCase().includes(key));
        if (!isJwtSecret) {
            return [];
        }
        const value = entry.value.trim();
        const violations = [];
        // Check length
        if (value.length < MIN_SECRET_LENGTH) {
            violations.push((0, violation_1.createViolation)({
                ruleId: this.id,
                severity: this.defaultSeverity,
                message: `JWT secret "${entry.key}" is too short (${value.length} characters). ` +
                    `Minimum recommended length is ${MIN_SECRET_LENGTH} characters (256 bits).`,
                filePath: entry.sourceFile,
                configKey: entry.key,
                configValue: entry.value,
                lineNumber: entry.lineNumber,
                suggestion: `Generate a strong JWT secret with at least ${MIN_SECRET_LENGTH} characters using: ` +
                    `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" ` +
                    'Store it securely in environment variables or a secrets manager (not in source code).',
            }));
        }
        // Check for weak patterns
        const matchedPattern = WEAK_PATTERNS.find(pattern => pattern.test(value));
        if (matchedPattern) {
            violations.push((0, violation_1.createViolation)({
                ruleId: this.id,
                severity: this.defaultSeverity,
                message: `JWT secret "${entry.key}" uses a weak or predictable pattern. ` +
                    'This can be easily brute-forced, compromising all authentication.',
                filePath: entry.sourceFile,
                configKey: entry.key,
                configValue: entry.value,
                lineNumber: entry.lineNumber,
                suggestion: 'Use a cryptographically random secret generated with: ' +
                    `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" ` +
                    'Never use dictionary words, common phrases, or predictable patterns. ' +
                    'Store the secret in environment variables or a secrets manager.',
            }));
        }
        return violations;
    },
};
//# sourceMappingURL=jwt-weak-secret.rule.js.map
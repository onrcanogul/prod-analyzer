"use strict";
/**
 * ============================================================================
 * ENV PARSER
 * ============================================================================
 *
 * Parses .env files into configuration entries.
 *
 * .env File Format:
 * - Lines starting with # are comments
 * - KEY=VALUE format
 * - Optional quotes around values
 * - Supports variable expansion (not implemented for security)
 *
 * Design Decisions:
 * - Converts UPPER_SNAKE_CASE to dot.notation for Spring compatibility
 * - Handles quoted values (single and double quotes)
 * - Line numbers tracked for accurate error reporting
 *
 * Spring Boot Relaxed Binding:
 * Spring Boot supports relaxed binding, so SPRING_PROFILES_ACTIVE maps to
 * spring.profiles.active. We normalize to dot notation for rule matching.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnvContent = parseEnvContent;
const domain_1 = require("../../domain");
/**
 * Parses a .env file content into configuration entries.
 *
 * @param content - The raw .env file content
 * @param filePath - The source file path
 * @returns Parsed configuration file with entries
 *
 * @example
 * ```typescript
 * const content = `
 * # Spring configuration
 * SPRING_PROFILES_ACTIVE=dev
 * SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/db"
 * `;
 * const parsed = parseEnvContent(content, '/app/.env');
 * // Entry keys will be: spring.profiles.active, spring.datasource.url
 * ```
 */
function parseEnvContent(content, filePath) {
    const entries = [];
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const lineNumber = i + 1;
        const line = lines[i] ?? '';
        const trimmed = line.trim();
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        // Parse KEY=VALUE
        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex === -1) {
            continue;
        }
        const rawKey = trimmed.slice(0, equalsIndex).trim();
        let value = trimmed.slice(equalsIndex + 1).trim();
        // Remove surrounding quotes if present
        value = removeQuotes(value);
        // Convert UPPER_SNAKE_CASE to dot.notation
        const normalizedKey = envKeyToPropertyKey(rawKey);
        entries.push({
            key: normalizedKey,
            value,
            sourceFile: filePath,
            lineNumber,
        });
    }
    return {
        filePath,
        entries,
        format: domain_1.ConfigFileFormat.ENV,
    };
}
/**
 * Removes surrounding quotes from a value.
 * Handles both single and double quotes.
 *
 * @param value - The value potentially wrapped in quotes
 * @returns The unquoted value
 */
function removeQuotes(value) {
    if (value.length < 2) {
        return value;
    }
    const firstChar = value[0];
    const lastChar = value[value.length - 1];
    if ((firstChar === '"' && lastChar === '"') ||
        (firstChar === "'" && lastChar === "'")) {
        return value.slice(1, -1);
    }
    return value;
}
/**
 * Converts an environment variable name to Spring Boot property key format.
 *
 * Spring Boot relaxed binding rules:
 * - SPRING_PROFILES_ACTIVE -> spring.profiles.active
 * - Underscores become dots
 * - Uppercase becomes lowercase
 *
 * @param envKey - The environment variable name
 * @returns The equivalent Spring Boot property key
 */
function envKeyToPropertyKey(envKey) {
    return envKey
        .toLowerCase()
        .replace(/_/g, '.');
}
//# sourceMappingURL=env-parser.js.map
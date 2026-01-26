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
import { ParsedConfigFile } from '../../domain';
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
export declare function parseEnvContent(content: string, filePath: string): ParsedConfigFile;
//# sourceMappingURL=env-parser.d.ts.map
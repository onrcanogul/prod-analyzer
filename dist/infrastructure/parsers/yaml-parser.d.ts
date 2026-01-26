/**
 * ============================================================================
 * YAML PARSER
 * ============================================================================
 *
 * Parses YAML configuration files (application.yml, bootstrap.yml, etc.)
 * into flat key-value pairs using dot notation.
 *
 * Design Decisions:
 * - Uses js-yaml for robust YAML parsing
 * - Flattens nested structures into dot notation keys
 * - Handles arrays by indexing (e.g., servers[0].host)
 * - All values converted to strings for uniform handling
 *
 * Why flatten to dot notation?
 * - Matches Spring Boot's property resolution
 * - Simplifies rule evaluation (no nested traversal)
 * - Enables consistent handling across file formats
 */
import { ParsedConfigFile } from '../../domain';
/**
 * Parses a YAML file content into configuration entries.
 *
 * @param content - The raw YAML content
 * @param filePath - The source file path (for error reporting)
 * @returns Parsed configuration file with flattened entries
 *
 * @example
 * ```typescript
 * const content = `
 * spring:
 *   profiles:
 *     active: dev
 * `;
 * const parsed = parseYamlContent(content, '/app/application.yml');
 * // Returns: {
 * //   filePath: '/app/application.yml',
 * //   entries: [{ key: 'spring.profiles.active', value: 'dev', ... }],
 * //   format: 'yaml'
 * // }
 * ```
 */
export declare function parseYamlContent(content: string, filePath: string): ParsedConfigFile;
//# sourceMappingURL=yaml-parser.d.ts.map
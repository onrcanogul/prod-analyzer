/**
 * ============================================================================
 * PROPERTIES PARSER
 * ============================================================================
 *
 * Parses Java .properties files into configuration entries.
 *
 * Properties File Format:
 * - Lines starting with # or ! are comments
 * - key=value or key:value format
 * - Backslash for line continuation
 * - Unicode escapes (\uXXXX)
 *
 * Design Decisions:
 * - Line-by-line parsing for accurate line number tracking
 * - Handles both = and : as separators (per Java spec)
 * - Trims whitespace around keys and values
 * - Supports escaped characters
 */
import { ParsedConfigFile } from '../../domain';
/**
 * Parses a .properties file content into configuration entries.
 *
 * @param content - The raw properties file content
 * @param filePath - The source file path
 * @returns Parsed configuration file with entries
 *
 * @example
 * ```typescript
 * const content = `
 * # Database settings
 * spring.datasource.url=jdbc:mysql://localhost:3306/db
 * spring.datasource.username=root
 * `;
 * const parsed = parsePropertiesContent(content, '/app/application.properties');
 * ```
 */
export declare function parsePropertiesContent(content: string, filePath: string): ParsedConfigFile;
//# sourceMappingURL=properties-parser.d.ts.map
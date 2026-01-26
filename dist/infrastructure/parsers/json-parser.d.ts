/**
 * ============================================================================
 * JSON CONFIGURATION PARSER
 * ============================================================================
 *
 * Parses JSON configuration files (appsettings.json, config.json, package.json).
 * Flattens nested JSON into dot-notation keys.
 *
 * Design Decisions:
 * - Recursive flattening for nested objects
 * - Arrays are converted to indexed keys (e.g., "items.0", "items.1")
 * - Null and undefined values are converted to empty strings
 * - Follows same pattern as YAML parser for consistency
 */
import { ParsedConfigFile } from '../../domain/models/config-entry';
/**
 * Parses JSON content into flat configuration entries.
 *
 * @param content - Raw JSON file content
 * @param filePath - Path to the source file
 * @returns Parsed configuration file object
 */
export declare function parseJsonContent(content: string, filePath: string): ParsedConfigFile;
//# sourceMappingURL=json-parser.d.ts.map
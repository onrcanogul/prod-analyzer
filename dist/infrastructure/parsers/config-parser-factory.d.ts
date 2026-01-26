/**
 * ============================================================================
 * CONFIG PARSER FACTORY
 * ============================================================================
 *
 * Factory for selecting the appropriate parser based on file format.
 *
 * Design Decisions:
 * - Factory pattern for parser selection
 * - Parsers are pure functions, not classes
 * - Single entry point for parsing any config file
 *
 * Why a factory?
 * - Encapsulates format detection logic
 * - Easy to add new formats without changing callers
 * - Centralizes parser instantiation
 */
import { ParsedConfigFile, ConfigFileFormat } from '../../domain';
/**
 * Parser function signature.
 * All parsers must conform to this interface.
 */
export type ConfigParser = (content: string, filePath: string) => ParsedConfigFile;
/**
 * Gets the appropriate parser for a file format.
 *
 * @param format - The configuration file format
 * @returns The parser function for that format
 *
 * @example
 * ```typescript
 * const parser = getParserForFormat(ConfigFileFormat.YAML);
 * const parsed = parser(content, filePath);
 * ```
 */
export declare function getParserForFormat(format: ConfigFileFormat): ConfigParser;
/**
 * Parses a configuration file based on its format.
 * Convenience function that combines format lookup and parsing.
 *
 * @param content - The file content to parse
 * @param filePath - The source file path
 * @param format - The file format
 * @returns Parsed configuration file
 */
export declare function parseConfigFile(content: string, filePath: string, format: ConfigFileFormat): ParsedConfigFile;
//# sourceMappingURL=config-parser-factory.d.ts.map
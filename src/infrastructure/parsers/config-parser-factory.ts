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

import { parseYamlContent } from './yaml-parser';
import { parsePropertiesContent } from './properties-parser';
import { parseEnvContent } from './env-parser';
import { parseJsonContent } from './json-parser';
import { ParsedConfigFile, ConfigFileFormat } from '../../domain';

/**
 * Parser function signature.
 * All parsers must conform to this interface.
 */
export type ConfigParser = (content: string, filePath: string) => ParsedConfigFile;

/**
 * Registry of parsers by file format.
 */
const PARSERS: Readonly<Record<ConfigFileFormat, ConfigParser>> = {
  [ConfigFileFormat.YAML]: parseYamlContent,
  [ConfigFileFormat.PROPERTIES]: parsePropertiesContent,
  [ConfigFileFormat.ENV]: parseEnvContent,
  [ConfigFileFormat.JSON]: parseJsonContent,
} as const;

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
export function getParserForFormat(format: ConfigFileFormat): ConfigParser {
  const parser = PARSERS[format];
  if (!parser) {
    throw new Error(`No parser available for format: ${format}`);
  }
  return parser;
}

/**
 * Parses a configuration file based on its format.
 * Convenience function that combines format lookup and parsing.
 * 
 * @param content - The file content to parse
 * @param filePath - The source file path
 * @param format - The file format
 * @returns Parsed configuration file
 */
export function parseConfigFile(
  content: string,
  filePath: string,
  format: ConfigFileFormat
): ParsedConfigFile {
  const parser = getParserForFormat(format);
  return parser(content, filePath);
}

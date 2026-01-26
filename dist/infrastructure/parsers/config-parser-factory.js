"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParserForFormat = getParserForFormat;
exports.parseConfigFile = parseConfigFile;
const yaml_parser_1 = require("./yaml-parser");
const properties_parser_1 = require("./properties-parser");
const env_parser_1 = require("./env-parser");
const json_parser_1 = require("./json-parser");
const domain_1 = require("../../domain");
/**
 * Registry of parsers by file format.
 */
const PARSERS = {
    [domain_1.ConfigFileFormat.YAML]: yaml_parser_1.parseYamlContent,
    [domain_1.ConfigFileFormat.PROPERTIES]: properties_parser_1.parsePropertiesContent,
    [domain_1.ConfigFileFormat.ENV]: env_parser_1.parseEnvContent,
    [domain_1.ConfigFileFormat.JSON]: json_parser_1.parseJsonContent,
};
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
function getParserForFormat(format) {
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
function parseConfigFile(content, filePath, format) {
    const parser = getParserForFormat(format);
    return parser(content, filePath);
}
//# sourceMappingURL=config-parser-factory.js.map
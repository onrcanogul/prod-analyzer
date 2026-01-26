"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonContent = parseJsonContent;
const config_entry_1 = require("../../domain/models/config-entry");
/**
 * Parses JSON content into flat configuration entries.
 *
 * @param content - Raw JSON file content
 * @param filePath - Path to the source file
 * @returns Parsed configuration file object
 */
function parseJsonContent(content, filePath) {
    try {
        const parsed = JSON.parse(content);
        const entries = flattenJson(parsed, '', filePath);
        return {
            filePath,
            entries,
            format: config_entry_1.ConfigFileFormat.JSON,
        };
    }
    catch (error) {
        console.warn(`Failed to parse JSON file ${filePath}:`, error);
        return {
            filePath,
            entries: [],
            format: config_entry_1.ConfigFileFormat.JSON,
        };
    }
}
/**
 * Recursively flattens a JSON object into dot-notation entries.
 */
function flattenJson(obj, prefix, filePath, lineNumber) {
    const entries = [];
    if (obj === null || obj === undefined) {
        if (prefix) {
            if (lineNumber !== undefined) {
                entries.push({
                    key: prefix,
                    value: '',
                    sourceFile: filePath,
                    lineNumber,
                });
            }
            else {
                entries.push({
                    key: prefix,
                    value: '',
                    sourceFile: filePath,
                });
            }
        }
        return entries;
    }
    if (typeof obj !== 'object') {
        if (lineNumber !== undefined) {
            entries.push({
                key: prefix,
                value: String(obj),
                sourceFile: filePath,
                lineNumber,
            });
        }
        else {
            entries.push({
                key: prefix,
                value: String(obj),
                sourceFile: filePath,
            });
        }
        return entries;
    }
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const key = prefix ? `${prefix}.${index}` : String(index);
            entries.push(...flattenJson(item, key, filePath, lineNumber));
        });
        return entries;
    }
    // Regular object
    const objRecord = obj;
    for (const [key, value] of Object.entries(objRecord)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        entries.push(...flattenJson(value, fullKey, filePath, lineNumber));
    }
    return entries;
}
//# sourceMappingURL=json-parser.js.map
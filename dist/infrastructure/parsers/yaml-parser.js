"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseYamlContent = parseYamlContent;
const yaml = __importStar(require("js-yaml"));
const domain_1 = require("../../domain");
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
function parseYamlContent(content, filePath) {
    const entries = [];
    try {
        const parsed = yaml.load(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            flattenObject(parsed, '', filePath, entries);
        }
    }
    catch (error) {
        // YAML parsing failed - return empty entries
        // In production, we might want to log this or collect warnings
        console.warn(`Warning: Failed to parse YAML file ${filePath}:`, error);
    }
    return {
        filePath,
        entries,
        format: domain_1.ConfigFileFormat.YAML,
    };
}
/**
 * Recursively flattens a nested object into dot-notation key-value pairs.
 *
 * @param obj - The object to flatten
 * @param prefix - Current key prefix (for nested keys)
 * @param filePath - Source file path
 * @param entries - Output array to populate
 */
function flattenObject(obj, prefix, filePath, entries) {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value === null || value === undefined) {
            // Skip null/undefined values
            continue;
        }
        if (Array.isArray(value)) {
            // Handle arrays with indexed notation
            flattenArray(value, fullKey, filePath, entries);
        }
        else if (typeof value === 'object') {
            // Recurse into nested objects
            flattenObject(value, fullKey, filePath, entries);
        }
        else {
            // Primitive value - add as entry
            entries.push({
                key: fullKey,
                value: String(value),
                sourceFile: filePath,
            });
        }
    }
}
/**
 * Flattens an array into indexed key-value pairs.
 *
 * @example
 * servers:
 *   - host: localhost
 *     port: 8080
 *
 * Becomes:
 * servers[0].host = localhost
 * servers[0].port = 8080
 */
function flattenArray(arr, prefix, filePath, entries) {
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        const indexedKey = `${prefix}[${i}]`;
        if (value === null || value === undefined) {
            continue;
        }
        if (Array.isArray(value)) {
            flattenArray(value, indexedKey, filePath, entries);
        }
        else if (typeof value === 'object') {
            flattenObject(value, indexedKey, filePath, entries);
        }
        else {
            entries.push({
                key: indexedKey,
                value: String(value),
                sourceFile: filePath,
            });
        }
    }
}
//# sourceMappingURL=yaml-parser.js.map
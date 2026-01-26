"use strict";
/**
 * ============================================================================
 * FILE DISCOVERY
 * ============================================================================
 *
 * Discovers configuration files within a directory tree.
 *
 * Design Decisions:
 * - Uses recursive directory traversal for thoroughness
 * - Filters by known config file patterns
 * - Returns absolute paths for unambiguous file access
 * - Skips common directories that shouldn't be scanned (node_modules, .git)
 *
 * Why not use glob libraries?
 * - Reduces external dependencies
 * - Full control over traversal logic
 * - Easier to customize filtering rules
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
exports.discoverConfigFiles = discoverConfigFiles;
exports.fileExists = fileExists;
exports.readFileContent = readFileContent;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const domain_1 = require("../../domain");
/**
 * Default directories to exclude from scanning.
 * These typically don't contain application configuration.
 */
const DEFAULT_EXCLUDE_DIRS = [
    'node_modules',
    '.git',
    '.svn',
    '.hg',
    'target',
    'build',
    'dist',
    'out',
    '.idea',
    '.vscode',
    '__pycache__',
    '.gradle',
];
/**
 * Discovers configuration files in the given directory.
 *
 * @param rootDir - The root directory to start discovery from
 * @param options - Discovery options
 * @returns Array of discovered configuration files
 *
 * @example
 * ```typescript
 * const files = await discoverConfigFiles('/app');
 * // Returns: [
 * //   { filePath: '/app/src/main/resources/application.yml', format: 'yaml' },
 * //   { filePath: '/app/src/main/resources/application.properties', format: 'properties' },
 * // ]
 * ```
 */
async function discoverConfigFiles(rootDir, options = {}) {
    const excludeDirs = new Set(options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS);
    const maxDepth = options.maxDepth ?? 10;
    const discovered = [];
    await traverseDirectory(rootDir, excludeDirs, maxDepth, 0, discovered);
    // Sort for deterministic output
    discovered.sort((a, b) => a.filePath.localeCompare(b.filePath));
    return discovered;
}
/**
 * Recursively traverses a directory looking for config files.
 */
async function traverseDirectory(dir, excludeDirs, maxDepth, currentDepth, discovered) {
    if (currentDepth > maxDepth) {
        return;
    }
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    }
    catch {
        // Directory might not be readable - skip silently
        return;
    }
    for (const entry of entries) {
        const entryName = String(entry.name);
        const fullPath = path.join(dir, entryName);
        if (entry.isDirectory()) {
            // Skip excluded directories
            if (!excludeDirs.has(entryName)) {
                await traverseDirectory(fullPath, excludeDirs, maxDepth, currentDepth + 1, discovered);
            }
        }
        else if (entry.isFile()) {
            const format = detectFileFormat(entryName);
            if (format !== null) {
                discovered.push({
                    filePath: fullPath,
                    format,
                });
            }
        }
    }
}
/**
 * Detects the configuration file format based on filename.
 *
 * @param filename - The name of the file (not full path)
 * @returns The detected format, or null if not a known config file
 */
function detectFileFormat(filename) {
    const lowerFilename = filename.toLowerCase();
    const entries = Object.entries(domain_1.CONFIG_FILE_PATTERNS);
    for (const [format, patterns] of entries) {
        for (const pattern of patterns) {
            if (matchesPattern(lowerFilename, pattern.toLowerCase())) {
                return format;
            }
        }
    }
    return null;
}
/**
 * Matches a filename against a pattern.
 * Supports simple wildcards (*).
 *
 * @param filename - The filename to check
 * @param pattern - The pattern to match against
 * @returns True if the filename matches the pattern
 */
function matchesPattern(filename, pattern) {
    // Convert glob pattern to regex
    // Escape special regex characters except *
    const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filename);
}
/**
 * Checks if a file exists and is readable.
 *
 * @param filePath - Path to check
 * @returns True if file exists and is readable
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath, fs.constants.R_OK);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Reads a file's content as a UTF-8 string.
 *
 * @param filePath - Path to the file
 * @returns The file content
 * @throws Error if file cannot be read
 */
async function readFileContent(filePath) {
    return fs.readFile(filePath, 'utf-8');
}
//# sourceMappingURL=file-discovery.js.map
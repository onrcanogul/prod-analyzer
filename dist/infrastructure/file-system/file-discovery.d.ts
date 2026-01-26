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
import { ConfigFileFormat } from '../../domain';
/**
 * Result of file discovery containing path and detected format.
 */
export interface DiscoveredFile {
    /** Absolute path to the discovered file */
    readonly filePath: string;
    /** Detected configuration file format */
    readonly format: ConfigFileFormat;
}
/**
 * Options for file discovery.
 */
export interface FileDiscoveryOptions {
    /**
     * Directories to skip during traversal.
     * Defaults to common non-source directories.
     */
    readonly excludeDirs?: readonly string[];
    /**
     * Maximum depth for directory traversal.
     * Prevents runaway traversal in deeply nested structures.
     * Default: 10
     */
    readonly maxDepth?: number;
}
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
export declare function discoverConfigFiles(rootDir: string, options?: FileDiscoveryOptions): Promise<readonly DiscoveredFile[]>;
/**
 * Checks if a file exists and is readable.
 *
 * @param filePath - Path to check
 * @returns True if file exists and is readable
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Reads a file's content as a UTF-8 string.
 *
 * @param filePath - Path to the file
 * @returns The file content
 * @throws Error if file cannot be read
 */
export declare function readFileContent(filePath: string): Promise<string>;
//# sourceMappingURL=file-discovery.d.ts.map
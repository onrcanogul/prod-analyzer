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

import * as fs from 'node:fs/promises';
import { Dirent } from 'node:fs';
import * as path from 'node:path';
import { ConfigFileFormat, CONFIG_FILE_PATTERNS} from '../../domain'


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
 * Default directories to exclude from scanning.
 * These typically don't contain application configuration.
 */
const DEFAULT_EXCLUDE_DIRS: readonly string[] = [
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
] as const;

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
export async function discoverConfigFiles(
  rootDir: string,
  options: FileDiscoveryOptions = {}
): Promise<readonly DiscoveredFile[]> {
  const excludeDirs = new Set(options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS);
  const maxDepth = options.maxDepth ?? 10;
  
  const discovered: DiscoveredFile[] = [];
  
  await traverseDirectory(rootDir, excludeDirs, maxDepth, 0, discovered);
  
  // Sort for deterministic output
  discovered.sort((a, b) => a.filePath.localeCompare(b.filePath));
  
  return discovered;
}

/**
 * Recursively traverses a directory looking for config files.
 */
async function traverseDirectory(
  dir: string,
  excludeDirs: Set<string>,
  maxDepth: number,
  currentDepth: number,
  discovered: DiscoveredFile[]
): Promise<void> {
  if (currentDepth > maxDepth) {
    return;
  }
  
  let entries: Dirent[];
  
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    // Directory might not be readable - skip silently
    return;
  }
  
  for (const entry of entries) {
    const entryName = String(entry.name);
    const fullPath = path.join(dir, entryName);
    
    if (entry.isDirectory()) {
      // Skip excluded directories
      if (!excludeDirs.has(entryName)) {
        await traverseDirectory(
          fullPath,
          excludeDirs,
          maxDepth,
          currentDepth + 1,
          discovered
        );
      }
    } else if (entry.isFile()) {
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
function detectFileFormat(filename: string): ConfigFileFormat | null {
  const lowerFilename = filename.toLowerCase();
  
  const entries = Object.entries(CONFIG_FILE_PATTERNS) as [ConfigFileFormat, readonly string[]][];
  
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
function matchesPattern(filename: string, pattern: string): boolean {
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
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
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
export async function readFileContent(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

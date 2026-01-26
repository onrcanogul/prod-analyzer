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

import { ConfigEntry, ParsedConfigFile, ConfigFileFormat } from '../../domain';  

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
export function parsePropertiesContent(
  content: string,
  filePath: string
): ParsedConfigFile {
  const entries: ConfigEntry[] = [];
  const lines = content.split(/\r?\n/);
  
  let continuedLine = '';
  let continuedLineNumber: number | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    let line = lines[i] ?? '';
    
    // Handle line continuation (backslash at end)
    if (continuedLine) {
      line = continuedLine + line.trimStart();
    }
    
    // Check for line continuation
    if (line.endsWith('\\')) {
      continuedLine = line.slice(0, -1);
      if (continuedLineNumber === undefined) {
        continuedLineNumber = lineNumber;
      }
      continue;
    }
    
    const effectiveLineNumber = continuedLineNumber ?? lineNumber;
    continuedLine = '';
    continuedLineNumber = undefined;
    
    // Skip empty lines and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue;
    }
    
    // Parse the key=value or key:value pair
    const entry = parsePropertyLine(trimmed, filePath, effectiveLineNumber);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return {
    filePath,
    entries,
    format: ConfigFileFormat.PROPERTIES,
  };
}

/**
 * Parses a single property line into a ConfigEntry.
 * 
 * @param line - The trimmed line content
 * @param filePath - Source file path
 * @param lineNumber - Line number in the file
 * @returns ConfigEntry or null if line is invalid
 */
function parsePropertyLine(
  line: string,
  filePath: string,
  lineNumber: number
): ConfigEntry | null {
  // Find the separator (= or :)
  // Need to find the first unescaped separator
  let separatorIndex = -1;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const prevChar = i > 0 ? line[i - 1] : '';
    
    if ((char === '=' || char === ':') && prevChar !== '\\') {
      separatorIndex = i;
      break;
    }
  }
  
  if (separatorIndex === -1) {
    // No separator found - treat as key with empty value
    return {
      key: unescapePropertyValue(line.trim()),
      value: '',
      sourceFile: filePath,
      lineNumber,
    };
  }
  
  const key = line.slice(0, separatorIndex).trim();
  const value = line.slice(separatorIndex + 1).trim();
  
  return {
    key: unescapePropertyValue(key),
    value: unescapePropertyValue(value),
    sourceFile: filePath,
    lineNumber,
  };
}

/**
 * Unescapes a property value (handles \n, \t, \uXXXX, etc.)
 */
function unescapePropertyValue(value: string): string {
  let result = '';
  let i = 0;
  
  while (i < value.length) {
    const char = value[i];
    
    if (char === '\\' && i + 1 < value.length) {
      const nextChar = value[i + 1];
      
      switch (nextChar) {
        case 'n':
          result += '\n';
          i += 2;
          break;
        case 't':
          result += '\t';
          i += 2;
          break;
        case 'r':
          result += '\r';
          i += 2;
          break;
        case 'f':
          result += '\f';
          i += 2;
          break;
        case 'u':
          // Unicode escape: \uXXXX
          if (i + 5 < value.length) {
            const hex = value.slice(i + 2, i + 6);
            const code = parseInt(hex, 16);
            if (!isNaN(code)) {
              result += String.fromCharCode(code);
              i += 6;
              break;
            }
          }
          // Invalid unicode escape - keep as-is
          result += char;
          i++;
          break;
        case '\\':
        case '=':
        case ':':
        case '#':
        case '!':
        case ' ':
          result += nextChar;
          i += 2;
          break;
        default:
          result += nextChar;
          i += 2;
          break;
      }
    } else {
      result += char;
      i++;
    }
  }
  
  return result;
}

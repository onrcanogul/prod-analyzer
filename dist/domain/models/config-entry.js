"use strict";
/**
 * ============================================================================
 * CONFIG ENTRY MODEL
 * ============================================================================
 *
 * Represents a single configuration entry extracted from a configuration file.
 * This is the fundamental unit that rules evaluate against.
 *
 * Design Decisions:
 * - Flat key-value representation simplifies rule evaluation
 * - Keys use dot notation (e.g., "spring.profiles.active") for consistency
 * - Tracks source file for accurate violation reporting
 * - Values are strings because config files are text-based
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_FILE_PATTERNS = exports.ConfigFileFormat = void 0;
/**
 * Supported configuration file formats.
 * Used by infrastructure layer to select the appropriate parser.
 */
var ConfigFileFormat;
(function (ConfigFileFormat) {
    ConfigFileFormat["YAML"] = "yaml";
    ConfigFileFormat["PROPERTIES"] = "properties";
    ConfigFileFormat["ENV"] = "env";
    ConfigFileFormat["JSON"] = "json";
})(ConfigFileFormat || (exports.ConfigFileFormat = ConfigFileFormat = {}));
/**
 * File patterns associated with each format.
 * Used by file discovery to identify config files.
 */
exports.CONFIG_FILE_PATTERNS = {
    [ConfigFileFormat.YAML]: [
        'application.yml',
        'application.yaml',
        'application-*.yml',
        'application-*.yaml',
        'bootstrap.yml',
        'bootstrap.yaml',
    ],
    [ConfigFileFormat.PROPERTIES]: [
        'application.properties',
        'application-*.properties',
        'bootstrap.properties',
    ],
    [ConfigFileFormat.ENV]: [
        '.env',
        '.env.*',
        '.env.local',
        '.env.production',
        '.env.development',
    ],
    [ConfigFileFormat.JSON]: [
        'appsettings.json',
        'appsettings.*.json',
        'config.json',
        'package.json',
    ],
};
//# sourceMappingURL=config-entry.js.map
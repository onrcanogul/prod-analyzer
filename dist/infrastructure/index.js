"use strict";
/**
 * ============================================================================
 * INFRASTRUCTURE LAYER
 * ============================================================================
 *
 * This layer handles all external concerns: file system access, file parsing,
 * and other I/O operations.
 *
 * Responsibilities:
 * - File discovery (finding configuration files)
 * - File parsing (YAML, properties, env files)
 * - Converting raw file content to domain models
 *
 * Design Decisions:
 * - Parsers are implemented as pure functions for testability
 * - File system operations are isolated for easy mocking
 * - Each file format has its own parser module
 *
 * This layer:
 * - Depends on: Domain layer (for models)
 * - Is called by: Application layer
 * - NEVER contains business logic
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./file-system/file-discovery"), exports);
__exportStar(require("./parsers/yaml-parser"), exports);
__exportStar(require("./parsers/properties-parser"), exports);
__exportStar(require("./parsers/env-parser"), exports);
__exportStar(require("./parsers/config-parser-factory"), exports);
//# sourceMappingURL=index.js.map
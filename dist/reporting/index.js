"use strict";
/**
 * ============================================================================
 * REPORTING LAYER
 * ============================================================================
 *
 * This layer handles all output formatting and presentation.
 *
 * Responsibilities:
 * - Format scan results for console output
 * - Format scan results as JSON
 * - Ensure deterministic, stable output
 *
 * Design Decisions:
 * - Reporters are pure functions (input -> string)
 * - No side effects (callers handle actual output)
 * - Consistent ordering for deterministic output
 * - Separate reporter per format
 *
 * This layer:
 * - Imports from: Domain layer (for models)
 * - Is called by: CLI layer
 * - NEVER modifies data, only formats it
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
__exportStar(require("./reporters/console-reporter"), exports);
__exportStar(require("./reporters/json-reporter"), exports);
__exportStar(require("./reporters/sarif-reporter"), exports);
__exportStar(require("./reporters/reporter-factory"), exports);
//# sourceMappingURL=index.js.map
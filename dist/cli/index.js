"use strict";
/**
 * ============================================================================
 * CLI LAYER
 * ============================================================================
 *
 * This layer handles all command-line interface concerns.
 *
 * Responsibilities:
 * - Parse command-line arguments
 * - Validate user input
 * - Call application services
 * - Handle exit codes
 * - Route to appropriate reporters
 *
 * Design Decisions:
 * - Uses Commander.js for argument parsing
 * - Zero business logic - only orchestration
 * - Exit codes are determined by application layer results
 * - All output goes through reporting layer
 *
 * This layer:
 * - Imports from: Application layer, Reporting layer, Domain layer
 * - Is the entry point of the application
 * - NEVER imports from: Infrastructure layer directly
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
__exportStar(require("./commands/scan-command"), exports);
//# sourceMappingURL=index.js.map
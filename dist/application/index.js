"use strict";
/**
 * ============================================================================
 * APPLICATION LAYER
 * ============================================================================
 *
 * This layer orchestrates the scanning process and coordinates between
 * domain and infrastructure layers.
 *
 * Responsibilities:
 * - Orchestrate the complete scanning workflow
 * - Coordinate rule execution against configuration entries
 * - Aggregate violations into scan results
 * - Provide the main entry point for the CLI
 *
 * Design Decisions:
 * - ScanService is the primary use case entry point
 * - ScanOptions encapsulate all scanning parameters
 * - No direct file system access - delegates to infrastructure
 *
 * This layer:
 * - Imports from: Domain layer, Infrastructure layer
 * - Is called by: CLI layer
 * - NEVER contains presentation logic
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
__exportStar(require("./services/scan-service"), exports);
__exportStar(require("./services/rule-engine"), exports);
__exportStar(require("./models/scan-options"), exports);
//# sourceMappingURL=index.js.map
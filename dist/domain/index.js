"use strict";
/**
 * ============================================================================
 * DOMAIN LAYER
 * ============================================================================
 *
 * This layer contains the core business logic of the secure-guard application.
 * It is framework-agnostic and has ZERO external dependencies.
 *
 * Responsibilities:
 * - Define domain models (Violation, Severity, Rule)
 * - Define rule evaluation logic
 * - Provide rule registry for pluggable rule management
 *
 * Design Decisions:
 * - Rules are pure functions wrapped in a Rule interface for testability
 * - Severity is an enum with numeric weights for comparison operations
 * - Violations are immutable value objects
 *
 * This layer should NEVER import from:
 * - Infrastructure layer
 * - CLI layer
 * - Reporting layer
 *
 * It MAY be imported by:
 * - Application layer
 * - All other layers (read-only access to models)
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
__exportStar(require("./models/severity"), exports);
__exportStar(require("./models/violation"), exports);
__exportStar(require("./models/rule"), exports);
__exportStar(require("./models/config-entry"), exports);
__exportStar(require("./models/scan-result"), exports);
__exportStar(require("./models/platform"), exports);
__exportStar(require("./models/scan-profile"), exports);
__exportStar(require("./models/grouped-violations"), exports);
__exportStar(require("./models/license-tier"), exports);
__exportStar(require("./rules/rule-registry"), exports);
__exportStar(require("./rules/implementations"), exports);
//# sourceMappingURL=index.js.map
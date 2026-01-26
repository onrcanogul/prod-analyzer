"use strict";
/**
 * ============================================================================
 * RULE IMPLEMENTATIONS INDEX
 * ============================================================================
 *
 * Central export point for all rule implementations.
 * Rules are organized by platform/framework for better maintainability.
 *
 * Adding a New Rule:
 * 1. Create a new file in the appropriate platform directory
 * 2. Export it from the platform's index.ts
 * 3. Add it to the ALL_RULES array below
 *
 * The ALL_RULES array is the authoritative list of rules that will be
 * registered in the default registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_RULES = exports.requireHttpsRule = exports.developerExceptionPageRule = exports.connectionStringExposureRule = exports.dotnetDetailedErrorsRule = exports.aspnetcoreEnvironmentRule = exports.helmetDisabledRule = exports.rateLimitDisabledRule = exports.jwtWeakSecretRule = exports.corsWildcardRule = exports.exposedSecretsRule = exports.nodejsDebugEnabledRule = exports.nodeEnvProductionRule = exports.exposedStackTraceRule = exports.secureCookieRule = exports.httpOnlyCookieRule = exports.csrfDisabledRule = exports.springProfileDevActiveRule = exports.hibernateDdlAutoUnsafeRule = exports.healthDetailsExposedRule = exports.debugLoggingEnabledRule = exports.actuatorEndpointsExposedRule = void 0;
// Spring Boot Rules
const spring_boot_1 = require("./spring-boot");
Object.defineProperty(exports, "actuatorEndpointsExposedRule", { enumerable: true, get: function () { return spring_boot_1.actuatorEndpointsExposedRule; } });
Object.defineProperty(exports, "debugLoggingEnabledRule", { enumerable: true, get: function () { return spring_boot_1.debugLoggingEnabledRule; } });
Object.defineProperty(exports, "healthDetailsExposedRule", { enumerable: true, get: function () { return spring_boot_1.healthDetailsExposedRule; } });
Object.defineProperty(exports, "hibernateDdlAutoUnsafeRule", { enumerable: true, get: function () { return spring_boot_1.hibernateDdlAutoUnsafeRule; } });
Object.defineProperty(exports, "springProfileDevActiveRule", { enumerable: true, get: function () { return spring_boot_1.springProfileDevActiveRule; } });
Object.defineProperty(exports, "csrfDisabledRule", { enumerable: true, get: function () { return spring_boot_1.csrfDisabledRule; } });
Object.defineProperty(exports, "httpOnlyCookieRule", { enumerable: true, get: function () { return spring_boot_1.httpOnlyCookieRule; } });
Object.defineProperty(exports, "secureCookieRule", { enumerable: true, get: function () { return spring_boot_1.secureCookieRule; } });
Object.defineProperty(exports, "exposedStackTraceRule", { enumerable: true, get: function () { return spring_boot_1.exposedStackTraceRule; } });
// Node.js Rules
const nodejs_1 = require("./nodejs");
Object.defineProperty(exports, "nodeEnvProductionRule", { enumerable: true, get: function () { return nodejs_1.nodeEnvProductionRule; } });
Object.defineProperty(exports, "nodejsDebugEnabledRule", { enumerable: true, get: function () { return nodejs_1.nodejsDebugEnabledRule; } });
Object.defineProperty(exports, "exposedSecretsRule", { enumerable: true, get: function () { return nodejs_1.exposedSecretsRule; } });
Object.defineProperty(exports, "corsWildcardRule", { enumerable: true, get: function () { return nodejs_1.corsWildcardRule; } });
Object.defineProperty(exports, "jwtWeakSecretRule", { enumerable: true, get: function () { return nodejs_1.jwtWeakSecretRule; } });
Object.defineProperty(exports, "rateLimitDisabledRule", { enumerable: true, get: function () { return nodejs_1.rateLimitDisabledRule; } });
Object.defineProperty(exports, "helmetDisabledRule", { enumerable: true, get: function () { return nodejs_1.helmetDisabledRule; } });
// .NET Rules
const dotnet_1 = require("./dotnet");
Object.defineProperty(exports, "aspnetcoreEnvironmentRule", { enumerable: true, get: function () { return dotnet_1.aspnetcoreEnvironmentRule; } });
Object.defineProperty(exports, "dotnetDetailedErrorsRule", { enumerable: true, get: function () { return dotnet_1.dotnetDetailedErrorsRule; } });
Object.defineProperty(exports, "connectionStringExposureRule", { enumerable: true, get: function () { return dotnet_1.connectionStringExposureRule; } });
Object.defineProperty(exports, "developerExceptionPageRule", { enumerable: true, get: function () { return dotnet_1.developerExceptionPageRule; } });
Object.defineProperty(exports, "requireHttpsRule", { enumerable: true, get: function () { return dotnet_1.requireHttpsRule; } });
/**
 * Array of all available rules across all platforms.
 * Used to populate the default rule registry.
 */
exports.ALL_RULES = [
    // Spring Boot (9 rules)
    spring_boot_1.actuatorEndpointsExposedRule,
    spring_boot_1.debugLoggingEnabledRule,
    spring_boot_1.healthDetailsExposedRule,
    spring_boot_1.hibernateDdlAutoUnsafeRule,
    spring_boot_1.springProfileDevActiveRule,
    spring_boot_1.csrfDisabledRule,
    spring_boot_1.httpOnlyCookieRule,
    spring_boot_1.secureCookieRule,
    spring_boot_1.exposedStackTraceRule,
    // Node.js (7 rules)
    nodejs_1.nodeEnvProductionRule,
    nodejs_1.nodejsDebugEnabledRule,
    nodejs_1.exposedSecretsRule,
    nodejs_1.corsWildcardRule,
    nodejs_1.jwtWeakSecretRule,
    nodejs_1.rateLimitDisabledRule,
    nodejs_1.helmetDisabledRule,
    // .NET (5 rules)
    dotnet_1.aspnetcoreEnvironmentRule,
    dotnet_1.dotnetDetailedErrorsRule,
    dotnet_1.connectionStringExposureRule,
    dotnet_1.developerExceptionPageRule,
    dotnet_1.requireHttpsRule,
];
//# sourceMappingURL=index.js.map
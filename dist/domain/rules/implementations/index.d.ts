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
import { Rule } from '../../models/rule';
import { actuatorEndpointsExposedRule, debugLoggingEnabledRule, healthDetailsExposedRule, hibernateDdlAutoUnsafeRule, springProfileDevActiveRule, csrfDisabledRule, httpOnlyCookieRule, secureCookieRule, exposedStackTraceRule } from './spring-boot';
import { nodeEnvProductionRule, nodejsDebugEnabledRule, exposedSecretsRule, corsWildcardRule, jwtWeakSecretRule, rateLimitDisabledRule, helmetDisabledRule } from './nodejs';
import { aspnetcoreEnvironmentRule, dotnetDetailedErrorsRule, connectionStringExposureRule, developerExceptionPageRule, requireHttpsRule } from './dotnet';
/**
 * Export individual rules for direct imports when needed.
 */
export { actuatorEndpointsExposedRule, debugLoggingEnabledRule, healthDetailsExposedRule, hibernateDdlAutoUnsafeRule, springProfileDevActiveRule, csrfDisabledRule, httpOnlyCookieRule, secureCookieRule, exposedStackTraceRule, nodeEnvProductionRule, nodejsDebugEnabledRule, exposedSecretsRule, corsWildcardRule, jwtWeakSecretRule, rateLimitDisabledRule, helmetDisabledRule, aspnetcoreEnvironmentRule, dotnetDetailedErrorsRule, connectionStringExposureRule, developerExceptionPageRule, requireHttpsRule, };
/**
 * Array of all available rules across all platforms.
 * Used to populate the default rule registry.
 */
export declare const ALL_RULES: readonly Rule[];
//# sourceMappingURL=index.d.ts.map
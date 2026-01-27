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

// Spring Boot Rules
import {
  actuatorEndpointsExposedRule,
  debugLoggingEnabledRule,
  healthDetailsExposedRule,
  hibernateDdlAutoUnsafeRule,
  springProfileDevActiveRule,
  csrfDisabledRule,
  httpOnlyCookieRule,
  secureCookieRule,
  exposedStackTraceRule,
} from './spring-boot';

// Node.js Rules
import {
  nodeEnvProductionRule,
  nodejsDebugEnabledRule,
  exposedSecretsRule,
  corsWildcardRule,
  jwtWeakSecretRule,
  rateLimitDisabledRule,
  helmetDisabledRule,
} from './nodejs';

// .NET Rules
import {
  aspnetcoreEnvironmentRule,
  dotnetDetailedErrorsRule,
  connectionStringExposureRule,
  developerExceptionPageRule,
  requireHttpsRule,
} from './dotnet';

// General/Framework-Agnostic Rules
import {
  defaultPasswordsRule,
  privateKeyInRepoRule,
  cloudTokenExposureRule,
  tlsVerifyDisabledRule,
  allowInsecureHttpRule,
  publicS3BucketRule,
} from './general';

/**
 * Export individual rules for direct imports when needed.
 */
export {
  // Spring Boot
  actuatorEndpointsExposedRule,
  debugLoggingEnabledRule,
  healthDetailsExposedRule,
  hibernateDdlAutoUnsafeRule,
  springProfileDevActiveRule,
  csrfDisabledRule,
  httpOnlyCookieRule,
  secureCookieRule,
  exposedStackTraceRule,
  // Node.js
  nodeEnvProductionRule,
  nodejsDebugEnabledRule,
  exposedSecretsRule,
  corsWildcardRule,
  jwtWeakSecretRule,
  rateLimitDisabledRule,
  helmetDisabledRule,
  // .NET
  aspnetcoreEnvironmentRule,
  dotnetDetailedErrorsRule,
  connectionStringExposureRule,
  developerExceptionPageRule,
  requireHttpsRule,
  // General/Framework-Agnostic
  defaultPasswordsRule,
  privateKeyInRepoRule,
  cloudTokenExposureRule,
  tlsVerifyDisabledRule,
  allowInsecureHttpRule,
  publicS3BucketRule,
};

/**
 * Array of all available rules across all platforms.
 * Used to populate the default rule registry.
 */
export const ALL_RULES: readonly Rule[] = [
  // Spring Boot (9 rules)
  actuatorEndpointsExposedRule,
  debugLoggingEnabledRule,
  healthDetailsExposedRule,
  hibernateDdlAutoUnsafeRule,
  springProfileDevActiveRule,
  csrfDisabledRule,
  httpOnlyCookieRule,
  secureCookieRule,
  exposedStackTraceRule,
  // Node.js (7 rules)
  nodeEnvProductionRule,
  nodejsDebugEnabledRule,
  exposedSecretsRule,
  corsWildcardRule,
  jwtWeakSecretRule,
  rateLimitDisabledRule,
  helmetDisabledRule,
  // .NET (5 rules)
  aspnetcoreEnvironmentRule,
  dotnetDetailedErrorsRule,
  connectionStringExposureRule,
  developerExceptionPageRule,
  requireHttpsRule,
  // General/Framework-Agnostic (6 rules)
  defaultPasswordsRule,
  privateKeyInRepoRule,
  cloudTokenExposureRule,
  tlsVerifyDisabledRule,
  allowInsecureHttpRule,
  publicS3BucketRule,
] as const;


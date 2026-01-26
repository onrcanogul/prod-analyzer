/**
 * ============================================================================
 * ACTUATOR ENDPOINTS EXPOSED RULE
 * ============================================================================
 *
 * Detects when all Spring Boot Actuator endpoints are exposed.
 *
 * Security Rationale:
 * Actuator endpoints expose sensitive operational information:
 * - /env: Environment variables and system properties
 * - /heapdump: JVM heap dump (can contain passwords, tokens)
 * - /threaddump: Thread state (can reveal internal logic)
 * - /beans: All Spring beans and their dependencies
 * - /mappings: All URL mappings (attack surface enumeration)
 * - /shutdown: Can shut down the application (if enabled)
 *
 * Using "*" exposes ALL endpoints, including potentially dangerous ones.
 * Each endpoint should be explicitly enabled based on need.
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects wildcard exposure of actuator endpoints.
 *
 * Triggers when management.endpoints.web.exposure.include = "*"
 */
export declare const actuatorEndpointsExposedRule: Rule;
//# sourceMappingURL=actuator-endpoints-exposed.rule.d.ts.map
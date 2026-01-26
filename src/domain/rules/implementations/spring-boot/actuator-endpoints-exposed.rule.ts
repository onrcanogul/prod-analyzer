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

import { ConfigEntry } from '../../../models/config-entry';
import { Platform } from '../../../models/platform';
import { Rule } from '../../../models/rule';
import { Severity } from '../../../models/severity';
import { createViolation, Violation } from '../../../models/violation';

/**
 * Configuration key that this rule targets.
 */
const TARGET_KEY = 'management.endpoints.web.exposure.include';

/**
 * The dangerous wildcard value that exposes all endpoints.
 */
const DANGEROUS_VALUE = '*';

/**
 * Rule: Detects wildcard exposure of actuator endpoints.
 * 
 * Triggers when management.endpoints.web.exposure.include = "*"
 */
export const actuatorEndpointsExposedRule: Rule = {
  id: 'ACTUATOR_ENDPOINTS_EXPOSED',
  name: 'All Actuator Endpoints Exposed',
  description:
    'Detects when all Spring Boot Actuator endpoints are exposed via wildcard. ' +
    'This exposes sensitive operational data including environment variables, ' +
    'heap dumps, and thread dumps.',
  defaultSeverity: Severity.HIGH,
  targetKeys: [TARGET_KEY],
  platforms: [Platform.SPRING_BOOT],
  
  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.key !== TARGET_KEY) {
      return [];
    }
    
    const normalizedValue = entry.value.trim();
    
    // Check for wildcard - either alone or in a comma-separated list
    const exposedEndpoints = normalizedValue.split(',').map(e => e.trim());
    
    if (exposedEndpoints.includes(DANGEROUS_VALUE)) {
      return [
        createViolation({
          ruleId: this.id,
          severity: this.defaultSeverity,
          message:
            'All Actuator endpoints are exposed via wildcard "*". ' +
            'This exposes sensitive operational data.',
          filePath: entry.sourceFile,
          configKey: entry.key,
          configValue: entry.value,
          lineNumber: entry.lineNumber,
          suggestion:
            `Replace "*" with only the endpoints you need. ` +
            `Safe defaults for production: "health,info,metrics". ` +
            `Avoid exposing: env, heapdump, threaddump, beans, mappings.`,
        }),
      ];
    }
    
    return [];
  },
};

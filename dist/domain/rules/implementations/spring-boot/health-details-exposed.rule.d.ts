/**
 * ============================================================================
 * HEALTH ENDPOINT DETAILS EXPOSED RULE
 * ============================================================================
 *
 * Detects when health endpoint shows full details to all users.
 *
 * Security Rationale:
 * When show-details=always, the health endpoint reveals:
 * - Database connection details and status
 * - Disk space information
 * - External service connectivity
 * - Custom health indicators with internal state
 *
 * This information helps attackers understand the system architecture
 * and identify potential targets (databases, caches, message queues).
 *
 * Recommended Settings:
 * - "never": Only shows UP/DOWN (safest)
 * - "when-authorized": Shows details only to authenticated users
 * - "always": Shows details to everyone (avoid in production)
 */
import { Rule } from '../../../models/rule';
/**
 * Rule: Detects when health endpoint details are always shown.
 *
 * This is MEDIUM severity because the information disclosed is
 * less sensitive than full actuator exposure, but still valuable
 * for reconnaissance.
 */
export declare const healthDetailsExposedRule: Rule;
//# sourceMappingURL=health-details-exposed.rule.d.ts.map
# Policy Engine Guide

Complete guide to creating and using custom security policies in prod-analyzer.

## Table of Contents

1. [Introduction](#introduction)
2. [Why Use Policies?](#why-use-policies)
3. [Quick Start](#quick-start)
4. [Policy File Format](#policy-file-format)
5. [Rule Types](#rule-types)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Examples by Platform](#examples-by-platform)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

The **Policy Engine** allows you to define company-specific security rules using simple YAML syntax, without writing any code. Policies complement the 27 built-in rules by enforcing your organization's unique requirements.

### Key Benefits

- 🎯 **No Code Required**: Write rules in YAML, not TypeScript
- 🏢 **Company-Specific**: Enforce your organization's standards
- 🔒 **Flexible**: Forbidden values, required values, or regex patterns
- 🤝 **Complements Built-in Rules**: Runs alongside existing security checks
- 📝 **Non-Technical Friendly**: Security teams can write policies without developers

---

## Why Use Policies?

### Built-in Rules vs Custom Policies

**Built-in Rules (27 rules):**
- ✅ General security best practices
- ✅ Apply to everyone
- ❌ Cannot be customized
- ❌ May not match your company's specific needs

**Example:** `HIBERNATE_DDL_AUTO_UNSAFE` blocks `create`, `create-drop`, and `update`

**Custom Policies:**
- ✅ Company-specific requirements
- ✅ Fully customizable
- ✅ Can be more strict than built-in rules
- ✅ Self-service for security teams

**Example:** "In our company, even `validate` is forbidden - only `none` is allowed"

### Real-World Use Cases

1. **Strict Database Migrations**
   ```yaml
   # Built-in rule allows 'validate'
   # Your policy: Only 'none' allowed
   - id: "no-ddl-auto-any"
     key: "spring.jpa.hibernate.ddl-auto"
     requiredValue: "none"
   ```

2. **Specific Environment Names**
   ```yaml
   # Built-in rule blocks 'dev', 'test', 'development'
   # Your policy: Must be exactly 'production' (not 'prod')
   - id: "require-production-env-name"
     key: "NODE_ENV"
     requiredValue: "production"  # Not 'prod'
   ```

3. **Company-Specific Secrets**
   ```yaml
   # Block your company's old default passwords
   - id: "no-legacy-passwords"
     key: "*"  # Check all keys
     forbiddenValues:
       - "AcmeCorp2020"  # Your old default
       - "CompanySecret123"
   ```

4. **Internal Service URLs**
   ```yaml
   # Enforce internal domain for services
   - id: "require-internal-domain"
     key: "SERVICE_URL"
     forbiddenPattern: "^(?!https://.*\\.company\\.internal).*"
   ```

---

## Quick Start

### 1. Create Policy File

Create `.prod-analyzer-policy.yml` in your project root:

```yaml
policies:
  name: "My Company Production Policy"
  version: "1.0.0"
  description: "Enforces Acme Corp security standards"
  
  rules:
    - id: "no-ddl-auto"
      description: "Database schema changes via Flyway only"
      key: "spring.jpa.hibernate.ddl-auto"
      forbiddenValues:
        - "create"
        - "create-drop"
        - "update"
        - "validate"  # Even validate is forbidden!
      severity: CRITICAL
      message: "DDL auto is completely forbidden - use Flyway migrations"
      suggestion: "Set spring.jpa.hibernate.ddl-auto=none"
```

### 2. Run Scan

```bash
prod-analyzer scan

# Output:
# 📋 Loading custom policy from .prod-analyzer-policy.yml
# ✓ Evaluated 1 custom policy rules from 'My Company Production Policy'
#
# [CRITICAL] POLICY:no-ddl-auto (1 occurrence)
#   → application.properties:5
#     spring.jpa.hibernate.ddl-auto = validate
#   Issue: [My Company Production Policy] DDL auto is completely forbidden
#   Fix:   Set spring.jpa.hibernate.ddl-auto=none
```

### 3. Fix and Re-scan

```properties
# application.properties
spring.jpa.hibernate.ddl-auto=none  # ✅ Policy satisfied
```

---

## Policy File Format

### Complete Structure

```yaml
policies:
  # Required: Policy metadata
  name: "Policy Name"
  version: "1.0.0"
  description: "What this policy enforces"
  
  # Optional: Organizational metadata
  metadata:
    owner: "Platform Team"
    contact: "platform@company.com"
    lastUpdated: "2026-01-15"
    documentation: "https://wiki.company.com/security-policy"
  
  # Required: List of policy rules
  rules:
    - id: "unique-rule-id"
      description: "Human-readable description"
      key: "config.key.name"
      
      # At least ONE enforcement type required:
      forbiddenValues: ["bad1", "bad2"]
      # OR
      requiredValue: "expected-value"
      # OR
      forbiddenPattern: "^regex-pattern$"
      
      # Required:
      severity: CRITICAL  # CRITICAL | HIGH | MEDIUM | LOW
      message: "Error message shown to users"
      
      # Optional:
      suggestion: "How to fix this issue"
      caseInsensitive: true  # Default: true
```

### Field Reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `policies.name` | ✅ Yes | string | Policy name shown in output |
| `policies.version` | ✅ Yes | string | Semantic version (e.g., "1.0.0") |
| `policies.description` | ❌ No | string | What this policy enforces |
| `policies.metadata` | ❌ No | object | Organizational info |
| `policies.rules` | ✅ Yes | array | List of policy rules |
| `rule.id` | ✅ Yes | string | Unique identifier (alphanumeric + dashes) |
| `rule.description` | ✅ Yes | string | What this rule checks |
| `rule.key` | ✅ Yes | string | Config key to check (supports wildcards) |
| `rule.forbiddenValues` | ⚠️ One required | array | Values that are forbidden |
| `rule.requiredValue` | ⚠️ One required | string | Value that must be present |
| `rule.forbiddenPattern` | ⚠️ One required | string | Regex pattern (forbidden matches) |
| `rule.severity` | ✅ Yes | enum | CRITICAL, HIGH, MEDIUM, or LOW |
| `rule.message` | ✅ Yes | string | Error message shown to users |
| `rule.suggestion` | ❌ No | string | How to fix the issue |
| `rule.caseInsensitive` | ❌ No | boolean | Case-insensitive matching (default: true) |

---

## Rule Types

### 1. Forbidden Values

**Block specific values from a list.**

```yaml
- id: "no-weak-passwords"
  description: "Prevent weak or default passwords"
  key: "DB_PASSWORD"
  forbiddenValues:
    - "admin"
    - "password"
    - "changeme"
    - "123456"
    - "root"
  severity: CRITICAL
  message: "Weak database password detected"
  suggestion: "Use a strong random password (minimum 16 characters)"
```

**Use cases:**
- Block specific environment names
- Prevent weak credentials
- Disallow dangerous configuration values

**How it works:**
1. Normalize value based on `caseInsensitive` setting
2. Check if value exists in `forbiddenValues` array
3. If found → Violation

---

### 2. Required Value

**Enforce that a key has a specific value.**

```yaml
- id: "require-production-env"
  description: "NODE_ENV must be exactly 'production'"
  key: "NODE_ENV"
  requiredValue: "production"
  severity: CRITICAL
  message: "NODE_ENV must be 'production' in production environments"
  suggestion: "Set NODE_ENV=production"
  caseInsensitive: false  # Exact match required
```

**Use cases:**
- Enforce specific environment names
- Require specific logging levels
- Mandate certain feature flags

**How it works:**
1. Normalize actual value and required value
2. Compare for equality
3. If not equal → Violation with "(expected: X, found: Y)" message

---

### 3. Forbidden Pattern (Regex)

**Block values matching a regular expression.**

```yaml
- id: "no-http-urls"
  description: "All URLs must use HTTPS"
  key: "API_URL"
  forbiddenPattern: "^http://.*"
  severity: HIGH
  message: "HTTP URLs are insecure - HTTPS required"
  suggestion: "Change to https://"
```

**Advanced regex examples:**

```yaml
# Block short passwords (less than 16 characters)
- id: "enforce-password-length"
  key: "*PASSWORD*"
  forbiddenPattern: "^.{0,15}$"
  message: "Password must be at least 16 characters"

# Block IPv4 addresses (require domain names)
- id: "no-ip-addresses"
  key: "DATABASE_HOST"
  forbiddenPattern: "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$"
  message: "Use domain names instead of IP addresses"

# Require specific email domain
- id: "require-company-email"
  key: "ADMIN_EMAIL"
  forbiddenPattern: "^(?!.*@company\\.com$).*"
  message: "Admin email must be @company.com"
```

**How it works:**
1. Create regex from pattern
2. Apply `caseInsensitive` flag if enabled
3. Test value against regex
4. If matches → Violation

---

## Advanced Features

### Wildcard Key Matching

**Match multiple configuration keys with wildcards.**

#### Simple Wildcard: `*`

```yaml
- id: "no-passwords-anywhere"
  description: "Check ALL keys for weak passwords"
  key: "*"  # Matches every configuration key
  forbiddenValues:
    - "admin"
    - "password"
    - "changeme"
  severity: CRITICAL
  message: "Weak password detected"
```

**Matches:**
- `DB_PASSWORD = admin` ❌
- `JWT_SECRET = password` ❌
- `API_KEY = changeme` ❌

---

#### Prefix Wildcard: `prefix.*`

```yaml
- id: "no-debug-logging"
  description: "No DEBUG logging at any level"
  key: "logging.level.*"
  forbiddenValues:
    - "DEBUG"
    - "TRACE"
  severity: HIGH
  message: "Debug logging forbidden in production"
```

**Matches:**
- ✅ `logging.level.root = DEBUG`
- ✅ `logging.level.com.myapp = DEBUG`
- ✅ `logging.level.org.springframework = TRACE`
- ❌ `logging.file.name = app.log` (different prefix)

---

#### Pattern Wildcard: `*substring*`

```yaml
- id: "no-test-in-keys"
  description: "No 'test' in any key name"
  key: "*test*"
  forbiddenValues: ["true", "enabled"]
  severity: MEDIUM
  message: "Test configurations detected"
```

**Matches:**
- ✅ `enable.test.mode = true`
- ✅ `test.database.url = ...`
- ✅ `use.testing.features = enabled`

---

### Case Sensitivity

**Control case-insensitive matching (default: true).**

```yaml
# Case-insensitive (default)
- id: "no-dev-env-case-insensitive"
  key: "NODE_ENV"
  forbiddenValues:
    - "development"
  caseInsensitive: true  # Default
  # Blocks: "development", "Development", "DEVELOPMENT"

# Case-sensitive
- id: "no-dev-env-case-sensitive"
  key: "NODE_ENV"
  forbiddenValues:
    - "Development"  # Only this exact case
  caseInsensitive: false
  # Blocks: "Development" only
  # Allows: "development", "DEVELOPMENT"
```

**When to use case-sensitive:**
- .NET configuration keys (case-sensitive)
- Exact string matching required
- Preventing specific typos

---

### Multiple Enforcement Types

**Combine multiple checks in one rule (OR logic).**

```yaml
- id: "strict-profile-check"
  description: "Profile must be 'prod' and cannot be 'dev'"
  key: "spring.profiles.active"
  
  # Both checks applied:
  requiredValue: "prod"        # Must be 'prod'
  forbiddenValues: ["dev"]     # Cannot be 'dev'
  
  severity: CRITICAL
  message: "Invalid profile configuration"
```

**Evaluation:**
1. Check `forbiddenValues` first
2. Then check `requiredValue`
3. Then check `forbiddenPattern`
4. **First violation found stops evaluation**

---

### Platform-Specific Policies

**Create separate policies for each platform.**

**Spring Boot Policy:**
```yaml
# .prod-analyzer-policy-spring.yml
policies:
  name: "Spring Boot Production Policy"
  rules:
    - id: "no-ddl-auto"
      key: "spring.jpa.hibernate.ddl-auto"
      # Spring-specific rules...
```

**Node.js Policy:**
```yaml
# .prod-analyzer-policy-node.yml
policies:
  name: "Node.js Production Policy"
  rules:
    - id: "require-production-env"
      key: "NODE_ENV"
      # Node-specific rules...
```

**.NET Policy:**
```yaml
# .prod-analyzer-policy-dotnet.yml
policies:
  name: ".NET Production Policy"
  rules:
    - id: "require-production-environment"
      key: "ASPNETCORE_ENVIRONMENT"
      # .NET-specific rules...
```

**Usage:**
```bash
# Use specific policy file (future feature)
prod-analyzer scan --policy .prod-analyzer-policy-spring.yml
```

---

## Best Practices

### 1. Start Simple

**Don't create 50 rules on day one.**

```yaml
# ✅ Good: Start with 3-5 critical rules
policies:
  name: "Production Policy v1"
  rules:
    - id: "require-prod-env"
      key: "NODE_ENV"
      requiredValue: "production"
      severity: CRITICAL
    
    - id: "no-weak-db-password"
      key: "DB_PASSWORD"
      forbiddenValues: ["admin", "password"]
      severity: CRITICAL
    
    - id: "require-https"
      key: "*URL"
      forbiddenPattern: "^http://.*"
      severity: HIGH
```

**Then iterate:**
- Monitor violations for 1-2 weeks
- Add more rules gradually
- Get team feedback

---

### 2. Use Descriptive IDs and Messages

```yaml
# ❌ Bad: Cryptic
- id: "rule_001"
  message: "Invalid config"

# ✅ Good: Descriptive
- id: "no-ddl-auto-create-drop"
  description: "Prevent DDL auto schema manipulation"
  message: "DDL auto create/drop is forbidden - use Flyway migrations"
  suggestion: "Set spring.jpa.hibernate.ddl-auto=none and create a Flyway migration"
```

---

### 3. Provide Actionable Suggestions

```yaml
# ❌ Bad: No guidance
- id: "bad-logging"
  message: "Logging is wrong"

# ✅ Good: Clear fix
- id: "no-debug-logging-root"
  message: "DEBUG logging at root level exposes sensitive data"
  suggestion: "Set logging.level.root=INFO or logging.level.root=WARN"
```

---

### 4. Set Appropriate Severities

**Severity Guidelines:**

| Severity | When to Use | Examples |
|----------|-------------|----------|
| **CRITICAL** | Data loss, security breach, compliance violation | DDL auto, exposed secrets, disabled encryption |
| **HIGH** | Major security risk, production instability | Debug logging, weak credentials, CORS wildcards |
| **MEDIUM** | Suboptimal configuration, potential issues | Verbose logging, missing best practices |
| **LOW** | Recommendations, nice-to-have | Code style, optional optimizations |

```yaml
# CRITICAL: Data loss risk
- id: "no-ddl-create"
  severity: CRITICAL
  
# HIGH: Security risk
- id: "no-weak-passwords"
  severity: HIGH
  
# MEDIUM: Suboptimal
- id: "prefer-connection-pooling"
  severity: MEDIUM
  
# LOW: Recommendation
- id: "suggest-compression"
  severity: LOW
```

---

### 5. Version Your Policies

```yaml
policies:
  name: "Acme Corp Production Policy"
  version: "2.1.0"  # Semantic versioning
  
  metadata:
    lastUpdated: "2026-01-15"
    changelog: |
      v2.1.0 (2026-01-15):
        - Added no-http-urls rule
        - Made ddl-auto check more strict
      
      v2.0.0 (2025-12-01):
        - Breaking: Changed NODE_ENV from 'prod' to 'production'
      
      v1.0.0 (2025-10-01):
        - Initial release
```

---

### 6. Document Your Policies

```yaml
policies:
  name: "Company Policy"
  description: |
    Enforces Acme Corp security standards for production deployments.
    
    For more information:
    - Documentation: https://wiki.company.com/security-policy
    - Contact: security@company.com
    - Last review: 2026-01-15
  
  metadata:
    owner: "Security Team"
    contact: "security@company.com"
    documentation: "https://wiki.company.com/security-policy"
```

---

## Examples by Platform

### Spring Boot

```yaml
policies:
  name: "Spring Boot Production Policy"
  version: "1.0.0"
  
  rules:
    # Database Safety
    - id: "no-ddl-auto-any"
      description: "Only Flyway migrations allowed"
      key: "spring.jpa.hibernate.ddl-auto"
      requiredValue: "none"
      severity: CRITICAL
      message: "DDL auto must be 'none' - use Flyway for schema changes"
    
    # Spring Profiles
    - id: "require-prod-profile"
      description: "Production profile required"
      key: "spring.profiles.active"
      requiredValue: "prod"
      severity: CRITICAL
      message: "Spring profile must be 'prod'"
    
    # Logging
    - id: "no-debug-logging-any-package"
      description: "No DEBUG logging anywhere"
      key: "logging.level.*"
      forbiddenValues: ["DEBUG", "TRACE"]
      severity: HIGH
      message: "DEBUG/TRACE logging forbidden in production"
    
    # Actuator Security
    - id: "no-actuator-wildcard"
      description: "Explicit actuator endpoints only"
      key: "management.endpoints.web.exposure.include"
      forbiddenValues: ["*"]
      severity: CRITICAL
      message: "Wildcard actuator exposure is dangerous"
      suggestion: "Use: health,info,metrics"
    
    # Error Handling
    - id: "no-stacktrace-exposure"
      description: "Never expose stacktraces"
      key: "server.error.include-stacktrace"
      forbiddenValues: ["always", "on-param"]
      severity: HIGH
      message: "Stacktraces expose internal application details"
```

---

### Node.js

```yaml
policies:
  name: "Node.js Production Policy"
  version: "1.0.0"
  
  rules:
    # Environment
    - id: "require-production-env"
      description: "NODE_ENV must be 'production'"
      key: "NODE_ENV"
      requiredValue: "production"
      severity: CRITICAL
      message: "NODE_ENV must be 'production'"
      caseInsensitive: false
    
    # Secrets
    - id: "no-weak-jwt-secret"
      description: "JWT secret must be strong"
      key: "JWT_SECRET"
      forbiddenPattern: "^.{0,31}$"  # Less than 32 chars
      severity: CRITICAL
      message: "JWT_SECRET must be at least 32 characters"
    
    - id: "no-default-session-secret"
      description: "No default session secrets"
      key: "SESSION_SECRET"
      forbiddenValues:
        - "secret"
        - "keyboard cat"
        - "my-secret"
      severity: CRITICAL
      message: "Default session secret detected"
    
    # CORS
    - id: "no-cors-wildcard"
      description: "Specific CORS origins only"
      key: "CORS_ORIGIN"
      forbiddenValues: ["*"]
      severity: HIGH
      message: "CORS wildcard allows any domain"
      suggestion: "Specify allowed origins: https://app.company.com"
    
    # HTTPS
    - id: "require-https-urls"
      description: "All URLs must use HTTPS"
      key: "*URL"
      forbiddenPattern: "^http://.*"
      severity: HIGH
      message: "HTTP URLs are insecure"
      suggestion: "Use https://"
    
    # TLS
    - id: "no-tls-disabled"
      description: "Never disable TLS verification"
      key: "NODE_TLS_REJECT_UNAUTHORIZED"
      forbiddenValues: ["0", "false"]
      severity: CRITICAL
      message: "TLS verification is disabled - allows MITM attacks"
```

---

### .NET / ASP.NET Core

```yaml
policies:
  name: ".NET Production Policy"
  version: "1.0.0"
  
  rules:
    # Environment
    - id: "require-production-environment"
      description: "ASPNETCORE_ENVIRONMENT must be 'Production'"
      key: "ASPNETCORE_ENVIRONMENT"
      requiredValue: "Production"
      severity: CRITICAL
      message: "Environment must be 'Production'"
      caseInsensitive: false  # .NET is case-sensitive
    
    # Error Pages
    - id: "no-detailed-errors"
      description: "Never show detailed errors"
      key: "DetailedErrors"
      forbiddenValues: ["true", "True"]
      severity: HIGH
      message: "Detailed errors expose application internals"
      caseInsensitive: false
    
    # HTTPS
    - id: "require-https-urls"
      description: "HTTPS only"
      key: "ASPNETCORE_URLS"
      forbiddenPattern: "^http://.*"
      severity: CRITICAL
      message: "HTTP URLs detected - HTTPS required"
      suggestion: "Use https://+:443"
    
    # Logging
    - id: "no-debug-logging-default"
      description: "No Debug/Trace logging"
      key: "Logging:LogLevel:Default"
      forbiddenValues: ["Debug", "Trace"]
      severity: HIGH
      message: "Debug/Trace logging exposes sensitive data"
      caseInsensitive: false
    
    # HSTS
    - id: "require-hsts"
      description: "HSTS must be enabled"
      key: "Hsts:Enabled"
      requiredValue: "true"
      severity: HIGH
      message: "HSTS should be enabled for security"
```

---

## Troubleshooting

### Policy File Not Found

**Problem:**
```
Warning: No custom policy file found
```

**Solution:**
1. Check filename: Must be `.prod-analyzer-policy.yml` (with leading dot)
2. Check location: Must be in the scan directory
3. Check format: Must be valid YAML

```bash
# Verify file exists
ls -la .prod-analyzer-policy.yml

# Validate YAML syntax
yamllint .prod-analyzer-policy.yml

# Or use online validator: https://www.yamllint.com/
```

---

### Policy Parse Error

**Problem:**
```
Warning: Failed to load custom policy: Invalid policy file
```

**Solution:**
Check YAML syntax:

```yaml
# ❌ Bad: Missing quotes in message
message: This won't work: it has a colon

# ✅ Good: Quoted string
message: "This works: colons are fine in quotes"

# ❌ Bad: Invalid regex (unescaped backslash)
forbiddenPattern: "\d+"

# ✅ Good: Escaped backslash
forbiddenPattern: "\\d+"

# ❌ Bad: Wrong indentation
rules:
- id: "test"
  key: "config.key"

# ✅ Good: Consistent indentation (2 spaces)
rules:
  - id: "test"
    key: "config.key"
```

---

### Policy Not Triggering

**Problem:**
Policy rule exists but no violations found.

**Debug steps:**

1. **Check key matching:**
   ```yaml
   # Is your key exact?
   key: "spring.profiles.active"  # ✅ Exact match
   key: "spring.profile.active"   # ❌ Typo
   ```

2. **Check value matching:**
   ```yaml
   # Case sensitivity matters
   forbiddenValues: ["dev"]
   caseInsensitive: false
   # Won't match "Dev" or "DEV"
   ```

3. **Check file format:**
   ```yaml
   # .env files are normalized:
   NODE_ENV=development  # Becomes "node.env" (lowercase, dots)
   
   # So use:
   key: "node.env"  # Not "NODE_ENV"
   ```

4. **Test with wildcard:**
   ```yaml
   # Temporarily use wildcard to see all keys
   - id: "debug-all-keys"
     key: "*"
     forbiddenValues: ["test-value-that-doesnt-exist"]
     message: "Debug: This should never trigger"
   
   # Run scan and check which keys are evaluated
   ```

---

### Regex Not Matching

**Problem:**
`forbiddenPattern` doesn't work as expected.

**Common issues:**

```yaml
# ❌ Unescaped backslash
forbiddenPattern: "\d+"

# ✅ Escaped backslash
forbiddenPattern: "\\d+"

# ❌ Missing anchors (matches anywhere)
forbiddenPattern: "http://"
# Matches: "https://http://example.com"

# ✅ Anchored (matches from start)
forbiddenPattern: "^http://.*"
# Only matches if starts with "http://"

# Test your regex:
# https://regex101.com/
```

---

## Advanced Patterns

### Multi-Environment Policies

**Use different policies per environment:**

```yaml
# .prod-analyzer-policy-staging.yml
policies:
  name: "Staging Policy"
  rules:
    - id: "allow-ddl-validate-staging"
      key: "spring.jpa.hibernate.ddl-auto"
      forbiddenValues: ["create", "create-drop"]  # Allow 'validate' in staging
      severity: HIGH

# .prod-analyzer-policy-production.yml
policies:
  name: "Production Policy"
  rules:
    - id: "no-ddl-any-production"
      key: "spring.jpa.hibernate.ddl-auto"
      requiredValue: "none"  # Strict: only 'none'
      severity: CRITICAL
```

---

### Inherited Policies

**Create a base policy and extend it:**

```yaml
# base-policy.yml
policies:
  name: "Base Security Policy"
  rules:
    - id: "no-weak-passwords"
      key: "*PASSWORD*"
      forbiddenValues: ["admin", "password"]
      severity: CRITICAL

# spring-policy.yml (extends base)
policies:
  name: "Spring Boot Policy"
  rules:
    # Import base rules manually
    # (auto-import is a future feature)
    
    - id: "no-weak-passwords"
      key: "*PASSWORD*"
      forbiddenValues: ["admin", "password"]
      severity: CRITICAL
    
    # Add Spring-specific rules
    - id: "no-ddl-auto"
      key: "spring.jpa.hibernate.ddl-auto"
      requiredValue: "none"
      severity: CRITICAL
```

---

## Summary

**Policy Engine enables:**
- ✅ Company-specific security enforcement
- ✅ No-code rule creation (YAML only)
- ✅ Flexible rule types (forbidden/required/pattern)
- ✅ Wildcard key matching
- ✅ Complements built-in rules

**Getting Started:**
1. Create `.prod-analyzer-policy.yml`
2. Add 3-5 critical rules
3. Run `prod-analyzer scan`
4. Iterate based on results

**Next Steps:**
- See [SCAN_MECHANISM.md](SCAN_MECHANISM.md) for technical details
- See [examples/policies/](../examples/policies/) for complete examples
- See [USAGE_GUIDE.md](USAGE_GUIDE.md) for CLI usage

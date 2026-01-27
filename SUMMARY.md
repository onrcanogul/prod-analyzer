# prod-analyzer - Project Summary

**Version**: 0.1.2  
**Status**: Published to npm  
**License**: MIT

## Overview

prod-analyzer is a production-quality CLI tool that scans configuration files for security misconfigurations across **Spring Boot**, **Node.js**, and **.NET** applications. It acts as a fail-fast CI gate to prevent misconfigured applications from reaching production.

## Key Features

### 1. Multi-Platform Support
- **Spring Boot**: application.properties, application.yml
- **Node.js**: .env, package.json
- **.NET**: appsettings.json, web.config

### 2. Custom Policy Engine (NEW)
- **Company-Specific Rules**: Define YAML policies without writing code
- **Flexible Enforcement**: Forbidden values, required values, regex patterns
- **Auto-Discovery**: `.prod-analyzer-policy.yml` automatically loaded
- **Wildcard Support**: Match multiple keys (e.g., `logging.level.*`)

### 3. 27 Built-in Security Rules
- **9 Spring Boot rules**: Actuator exposure, DDL auto, debug logging, CSRF
- **7 Node.js rules**: NODE_ENV, secrets, CORS, JWT, rate limiting
- **5 .NET rules**: Environment, exceptions, HTTPS, connection strings
- **6 General rules**: Default passwords, private keys, cloud tokens, TLS, HTTP, S3

### 4. CI/CD Ready
- **SARIF Output**: GitHub Security tab integration
- **Exit Codes**: 0 (pass), 1 (violations), 2 (invalid args), 3 (error)
- **Severity-Based Gating**: `--fail-on HIGH` blocks deployment
- **Multiple Formats**: Console, JSON, SARIF

### 5. Developer Experience
- **Zero Configuration**: Works out of the box
- **Profile-Based Scanning**: `--profile spring|node|dotnet|all`
- **Severity Grouping**: CRITICAL → HIGH → MEDIUM in console output
- **Docker Support**: Run anywhere without Node.js installation

## Architecture

```
src/
├── cli/              # CLI argument parsing (Commander.js)
├── application/      # Orchestration (scan service, rule engine)
├── domain/           # Business logic (rules, policies, models)
├── infrastructure/   # File I/O (parsers, file discovery, policy loader)
└── reporting/        # Output formatters (console, JSON, SARIF)
```

**Design Principles:**
- Clean Architecture with clear layer separation
- Single Responsibility: Each layer has one job
- Domain-Driven Design: Rules and policies are domain entities
- Testability: 68 passing tests with >80% coverage

## Installation & Usage

### Installation
```bash
# Global install
npm install -g prod-analyzer

# npx (no install)
npx prod-analyzer scan

# Local dev dependency
npm install --save-dev prod-analyzer
```

### Basic Usage
```bash
# Scan current directory (auto-detect platform)
prod-analyzer scan

# Scan with profile
prod-analyzer scan --profile node

# Custom directory
prod-analyzer scan -d ./backend --profile spring

# CI/CD with SARIF
prod-analyzer scan --format sarif > results.sarif
```

### Custom Policy Example
Create `.prod-analyzer-policy.yml`:
```yaml
policies:
  name: "Company Production Policy"
  version: "1.0.0"
  
  rules:
    - id: "no-ddl-create"
      key: "spring.jpa.hibernate.ddl-auto"
      forbiddenValues: ["create", "create-drop"]
      severity: CRITICAL
      message: "DDL auto operations forbidden by policy"
```

Run scan:
```bash
prod-analyzer scan
# Output includes:
# [CRITICAL] POLICY:no-ddl-create (1 occurrence)
#   → application.properties:5
#     spring.jpa.hibernate.ddl-auto = create-drop
#   Issue: [Company Production Policy] DDL auto operations forbidden by policy
```

## Built-in Rules Summary

| Platform | Rule ID | Severity | Description |
|----------|---------|----------|-------------|
| Spring | SPRING_PROFILE_DEV_ACTIVE | HIGH | Dev/test profiles active |
| Spring | DEBUG_LOGGING_ENABLED | HIGH | DEBUG/TRACE logging |
| Spring | ACTUATOR_ENDPOINTS_EXPOSED | HIGH | All actuator endpoints exposed |
| Spring | HEALTH_DETAILS_EXPOSED | MEDIUM | Health details always visible |
| Spring | HIBERNATE_DDL_AUTO_UNSAFE | CRITICAL | DDL auto create/update |
| Node.js | NODE_ENV_NOT_PRODUCTION | HIGH | NODE_ENV != production |
| Node.js | NODEJS_DEBUG_ENABLED | MEDIUM | DEBUG mode enabled |
| Node.js | EXPOSED_SECRETS | CRITICAL | Weak secrets (<8 chars) |
| Node.js | CORS_WILDCARD_ORIGIN | HIGH | CORS_ORIGIN = * |
| Node.js | JWT_WEAK_SECRET | CRITICAL | JWT secret <32 chars |
| .NET | ASPNETCORE_ENVIRONMENT_DEVELOPMENT | HIGH | Development environment |
| .NET | DEVELOPER_EXCEPTION_PAGE | HIGH | Exception page enabled |
| .NET | REQUIRE_HTTPS_DISABLED | HIGH | HTTPS not enforced |
| General | DEFAULT_PASSWORDS | CRITICAL | admin, password, changeme |
| General | PRIVATE_KEY_IN_REPO | CRITICAL | SSH/RSA private keys |
| General | CLOUD_TOKEN_EXPOSURE | CRITICAL | AWS, GitHub, Stripe tokens |
| General | TLS_VERIFY_DISABLED | CRITICAL | Certificate verification off |
| General | ALLOW_INSECURE_HTTP | HIGH | HTTP instead of HTTPS |
| General | PUBLIC_S3_BUCKET | HIGH | Public S3 bucket config |

## Policy Engine Details

### Policy File Structure
```yaml
policies:
  name: "Policy Name"
  version: "1.0.0"
  description: "Optional description"
  
  metadata:
    owner: "Team Name"
    contact: "team@company.com"
  
  rules:
    - id: "unique-rule-id"
      description: "What this rule checks"
      key: "config.key.path"
      forbiddenValues: ["bad1", "bad2"]  # Optional
      requiredValue: "expected-value"    # Optional
      forbiddenPattern: "regex-pattern"  # Optional
      severity: CRITICAL|HIGH|MEDIUM|LOW
      message: "Error message"
      suggestion: "How to fix"           # Optional
      caseInsensitive: true              # Default: true
```

### Enforcement Types

1. **Forbidden Values**: Block specific values
   ```yaml
   forbiddenValues: ["create", "create-drop", "update"]
   ```

2. **Required Value**: Enforce exact value
   ```yaml
   requiredValue: "production"
   ```

3. **Forbidden Pattern**: Regex matching
   ```yaml
   forbiddenPattern: "^http://.*"  # Block HTTP URLs
   ```

4. **Wildcard Keys**: Match multiple keys
   ```yaml
   key: "logging.level.*"  # Matches logging.level.root, logging.level.com.myapp, etc.
   ```

### Auto-Discovery
Policy files are automatically loaded if named:
- `.prod-analyzer-policy.yml`
- `.prod-analyzer-policy.yaml`
- `prod-analyzer-policy.yml`
- `prod-analyzer-policy.yaml`

### Example Policies
See `examples/policies/` for complete examples:
- `spring-boot-production.policy.yml` - 9 rules for Spring Boot
- `nodejs-production.policy.yml` - 13 rules for Node.js
- `dotnet-production.policy.yml` - 8 rules for .NET

## CI/CD Integration Examples

### GitHub Actions
```yaml
- name: Security Scan
  run: |
    npx prod-analyzer scan --format sarif > results.sarif
    npx prod-analyzer scan --fail-on HIGH

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: results.sarif
```

### GitLab CI
```yaml
security-scan:
  stage: test
  script:
    - npx prod-analyzer scan --format json > security-report.json
    - npx prod-analyzer scan --fail-on HIGH
  artifacts:
    reports:
      junit: security-report.json
```

### Jenkins
```groovy
stage('Security Scan') {
  steps {
    sh 'npx prod-analyzer scan --format sarif > results.sarif'
    sh 'npx prod-analyzer scan --fail-on HIGH'
    archiveArtifacts artifacts: 'results.sarif'
  }
}
```

## Project Statistics

- **Total Lines of Code**: ~3,500
- **Test Coverage**: >80%
- **Tests**: 68 passing
- **Dependencies**: 6 runtime (Commander, js-yaml, glob, chalk)
- **Build Time**: ~2 seconds
- **Docker Image Size**: ~150MB

## Development Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Type check
npm run type-check

# Link for local development
npm link

# Run from source
npm run dev -- scan -d test-fixtures
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test -- severity.test.ts
```

## Versioning

Current: **0.1.2**

**Changelog:**
- **0.1.2**: Added Policy Engine, 6 general rules, example policies
- **0.1.1**: Severity-grouped console output
- **0.1.0**: Initial release with 21 rules

**Next Release (0.2.0):**
- [ ] Web dashboard for scan results
- [ ] Baseline support (ignore known violations)
- [ ] Custom rule plugins
- [ ] Configuration file inheritance

## Contributing

This is a production-quality open source project. Contributions welcome!

**Areas for Contribution:**
1. New platform support (Python, Go, Ruby)
2. Additional security rules
3. Example policy files
4. Documentation improvements
5. Bug fixes and optimizations

## License

MIT License - See LICENSE file for details.

## Links

- **npm**: https://www.npmjs.com/package/prod-analyzer
- **GitHub**: https://github.com/onrcanogul/prod-analyzer
- **Docker**: ghcr.io/onrcanogul/prod-analyzer:latest
- **Documentation**: See docs/ directory

# Secure Guard

[![CI/CD](https://github.com/your-org/secure-guard/workflows/CI/badge.svg)](https://github.com/your-org/secure-guard/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-available-blue.svg)](https://github.com/your-org/secure-guard/pkgs/container/secure-guard)

A production-quality CLI tool for detecting security misconfigurations across **Spring Boot**, **Node.js**, and **.NET** applications.

## 🎯 Overview

Secure Guard is a **fail-fast CI gate tool** designed to prevent misconfigured applications from being deployed to production. It scans your configuration files and detects security issues **before** they reach production.

**Key Features:**
- ✅ **Multi-Platform Support** - Spring Boot, Node.js, .NET
- ✅ **CI/CD Ready** - SARIF output, GitHub/GitLab integration
- ✅ **Profile-Based Scanning** - Only run relevant rules
- ✅ **Grouped Violations** - Reduced noise, actionable reports
- ✅ **Docker Support** - Run anywhere
- ✅ **Zero Configuration** - Works out of the box

---

## 📦 Installation

### NPM (Recommended)

```bash
npm install -g secure-guard
```

### Docker

```bash
docker pull ghcr.io/your-org/secure-guard:latest
```

### From Source

```bash
git clone https://github.com/your-org/secure-guard.git
cd secure-guard
npm install
npm run build
npm link
```

---

## 🚀 Quick Start

### Basic Scan

```bash
# Scan current directory (Spring Boot by default)
secure-guard scan

# Scan specific directory with profile
secure-guard scan -d ./backend --profile spring

# Multi-platform scan
secure-guard scan --profile all
```

### CI/CD Integration

```bash
# GitHub Actions - SARIF for Security tab
secure-guard scan --format sarif > results.sarif

# Console output with fail-on threshold
secure-guard scan --fail-on HIGH

# JSON for artifacts
secure-guard scan --format json > security-report.json
```

### Docker Usage

```bash
# Scan with Docker
docker run --rm -v $(pwd):/workspace \
  ghcr.io/your-org/secure-guard:latest \
  scan -d /workspace --profile all
```

---

## 📋 CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --directory <path>` | Directory to scan | Current directory |
| `-e, --env <environment>` | Target environment (for context in reports) | `prod` |
| `-p, --profile <profile>` | Scan profile (`spring`, `node`, `dotnet`, `all`) | `spring` |
| `-f, --fail-on <severity>` | Minimum severity to trigger non-zero exit | `HIGH` |
| `--format <format>` | Output format (`console`, `json`, `sarif`) | `console` |
| `-v, --verbose` | Show verbose output with full details | `false` |

---

## 🎯 Exit Codes

| Code | Meaning | CI Action |
|------|---------|-----------|
| **0** | ✅ Success (no violations above threshold) | Pipeline passes |
| **1** | ❌ Violations found at or above threshold | Pipeline fails |
| **2** | ⚠️ Invalid arguments | Pipeline fails |
| **3** | 💥 Unexpected error | Pipeline fails |

**Example:**
```bash
# Exit code 1 if violations >= HIGH found
secure-guard scan --fail-on HIGH || echo "Deployment blocked!"
```

---

## 🔐 Security Rules

Secure Guard includes **12 built-in security rules** across 3 platforms:

### Spring Boot Rules (5)

#### 1. SPRING_PROFILE_DEV_ACTIVE (HIGH)
Detects when development or test Spring profiles are active.
- **Triggers:** `spring.profiles.active = dev|test|development|local`
- **Why:** Development profiles often enable debug features and relaxed security settings.

#### 2. DEBUG_LOGGING_ENABLED (HIGH)
Detects when DEBUG or TRACE logging levels are enabled.
- **Triggers:** `logging.level.root = DEBUG|TRACE|ALL`
- **Why:** Verbose logging can expose sensitive data including credentials and PII.

#### 3. ACTUATOR_ENDPOINTS_EXPOSED (HIGH)
Detects when all Spring Boot Actuator endpoints are exposed.
- **Triggers:** `management.endpoints.web.exposure.include = *`
- **Why:** Exposes sensitive operational data including environment variables and heap dumps.

#### 4. HEALTH_DETAILS_EXPOSED (MEDIUM)
Detects when health endpoint details are always shown.
- **Triggers:** `management.endpoint.health.show-details = always`
- **Why:** Reveals internal system architecture including database connections.

#### 5. HIBERNATE_DDL_AUTO_UNSAFE (HIGH/CRITICAL)
Detects unsafe Hibernate DDL auto configuration.
- **Triggers:** `spring.jpa.hibernate.ddl-auto = create|create-drop|update`
- **Why:** Can cause data loss or leave database in inconsistent state.

### Node.js Rules (4)

#### 6. NODE_ENV_NOT_PRODUCTION (HIGH)
Detects when NODE_ENV is not set to 'production'.
- **Triggers:** `NODE_ENV != production|prod`
- **Why:** Enables debug features and exposes detailed error stack traces.

#### 7. NODEJS_DEBUG_ENABLED (MEDIUM)
Detects when debug logging is enabled.
- **Triggers:** `DEBUG = *` or `LOG_LEVEL = debug|trace`
- **Why:** May expose sensitive application internals and performance data.

#### 8. EXPOSED_SECRETS (CRITICAL)
Detects weak or placeholder secrets in environment variables.
- **Triggers:** Short secrets (<8 chars) or common placeholders (test, changeme, admin)
- **Why:** Weak secrets can be easily compromised, leading to unauthorized access.

#### 9. CORS_WILDCARD_ORIGIN (HIGH)
Detects CORS wildcard configuration.
- **Triggers:** `CORS_ORIGIN = *`
- **Why:** Allows any website to make requests to your API, enabling CSRF attacks.

### .NET Rules (3)

#### 10. ASPNETCORE_ENVIRONMENT_DEVELOPMENT (HIGH)
Detects Development environment in ASP.NET Core.
- **Triggers:** `ASPNETCORE_ENVIRONMENT = Development|dev`
- **Why:** Enables developer exception pages and detailed error messages.

#### 11. DOTNET_DETAILED_ERRORS_ENABLED (HIGH/MEDIUM)
Detects detailed error messages enabled.
- **Triggers:** `customErrors = Off` or `DetailedErrors = true` or `LogLevel = Debug|Trace`
- **Why:** Exposes sensitive application internals including stack traces and file paths.

#### 12. DOTNET_CONNECTION_STRING_EXPOSED (CRITICAL)
Detects plain text connection strings.
- **Triggers:** `ConnectionStrings` in configuration with passwords
- **Why:** Critical security risk - exposes database credentials.

## Architecture

The project follows clean architecture principles with clearly separated layers:

```
src/
├── cli/              # CLI Layer - argument parsing, no business logic
├── application/      # Application Layer - orchestration, use cases
├── domain/           # Domain Layer - rules, models, business logic
├── infrastructure/   # Infrastructure Layer - file I/O, parsers
└── reporting/        # Reporting Layer - output formatting
```

### Adding New Rules

Rules are organized by platform for better maintainability:

```
src/domain/rules/implementations/
├── spring-boot/    # Spring Boot specific rules
├── nodejs/         # Node.js specific rules
└── dotnet/         # .NET specific rules
```

1. Create a new file in the appropriate platform directory
2. Implement the `Rule` interface with platform filter
3. Export from the platform's `index.ts`
4. Add to `ALL_RULES` in `implementations/index.ts`

Example:

```typescript
import { Rule } from '../../../models/rule';
import { Platform } from '../../../models/platform';
import { Severity } from '../../../models/severity';
import { createViolation } from '../../../models/violation';

export const myCustomRule: Rule = {
  id: 'MY_CUSTOM_RULE',
  name: 'My Custom Rule',
  description: 'Checks for a specific misconfiguration',
  defaultSeverity: Severity.HIGH,
  targetKeys: ['my.config.key'],
  platforms: [Platform.NODEJS], // Optional: filter by platform
  
  evaluate(entry) {
    if (entry.key !== 'my.config.key') return [];
    if (entry.value === 'bad-value') {
      return [createViolation({
        ruleId: this.id,
        severity: this.defaultSeverity,
        message: 'Bad configuration detected',
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: entry.value,
        lineNumber: entry.lineNumber,
        suggestion: 'Change to a good value',
      })];
    }
    return [];
  },
};
```

## 🔄 CI/CD Integration

Secure Guard is designed for seamless CI/CD integration. See **[CI_INTEGRATION.md](./CI_INTEGRATION.md)** for comprehensive guides.

### Quick Examples

#### GitHub Actions (SARIF)

```yaml
- name: Security Scan
  run: npx secure-guard scan --format sarif > results.sarif
  continue-on-error: true

- name: Upload to Security Tab
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

#### GitLab CI

```yaml
security-scan:
  script:
    - npx secure-guard scan --fail-on HIGH
  artifacts:
    reports:
      sast: gl-sast-report.json
```

#### Docker in CI

```bash
docker run --rm -v $PWD:/workspace \
  ghcr.io/your-org/secure-guard:latest \
  scan -d /workspace --profile all
```

**📚 For complete CI/CD integration guides (GitHub, GitLab, Azure, Jenkins, CircleCI), pre-commit hooks, and best practices, see [CI_INTEGRATION.md](./CI_INTEGRATION.md).**

---

## 🐳 Docker

### Build

```bash
docker build -t secure-guard .
```

### Run

```bash
# Scan current directory
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace

# With JSON output
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace --format json

# Specific profile
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace --profile spring
```

---

## 🧪 Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Run in development mode
npm run dev -- scan -d ./test-fixtures
```

## License

MIT

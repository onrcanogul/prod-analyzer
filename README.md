# prod-analyzer

[![npm version](https://img.shields.io/npm/v/prod-analyzer.svg)](https://www.npmjs.com/package/prod-analyzer)
[![npm downloads](https://img.shields.io/npm/dm/prod-analyzer.svg)](https://www.npmjs.com/package/prod-analyzer)
[![CI/CD](https://github.com/onrcanogul/prod-analyzer/workflows/CI/badge.svg)](https://github.com/onrcanogul/prod-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Stop production misconfigurations before they deploy.**

A lightweight, zero-config CLI tool that scans Spring Boot, Node.js, and .NET configuration files for security issues - and blocks your CI pipeline when it finds them.

---

## Why prod-analyzer?

**Because production incidents are expensive.**

A single misconfigured `spring.profiles.active=dev` in production can:
- Expose debug endpoints with sensitive data
- Enable verbose logging that fills disks and leaks secrets
- Disable security features like CSRF protection
- Cause data loss with `ddl-auto=create-drop`

**Traditional security tools miss these.**

- **SonarQube**: Analyzes code, not runtime configuration
- **Snyk**: Focuses on dependencies, not misconfigurations  
- **Trivy**: Scans containers and IaC, not application configs

**prod-analyzer fills the gap** - it's the only tool laser-focused on application configuration security for Spring Boot, Node.js, and .NET.

---

## Try it in 30 seconds

No installation required. Just run:

```bash
npx prod-analyzer scan
```

**Example output:**

```
━━━ Secure Guard Scan Report ━━━

Target:      /app/backend
Profile:     spring
Status:      FAIL ❌

Summary:
  Files scanned:     3
  Total violations:  12
  Security Score:    62/100 (POOR)

Blocking Violations (5 CRITICAL, 4 HIGH):

[CRITICAL] SPRING_PROFILE_DEV_ACTIVE (2 occurrences)
  → application.properties:4
    spring.profiles.active = dev
  Issue: Development profile active in production
  Fix:   Set spring.profiles.active=prod

[CRITICAL] HIBERNATE_DDL_AUTO_UNSAFE (1 occurrence)
  → application.yml:12
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: This WILL cause data loss on application restart
  Fix:   Use 'validate' or 'none' with migration tools

Exit Code: 1 (Deploy blocked)
```

**Add to your CI pipeline:**

```yaml
# .github/workflows/security.yml
- name: Configuration Security Scan
  run: npx prod-analyzer scan --fail-on HIGH
```

That's it. If violations are found, your pipeline fails. **Deploy blocked.**

---

## Who should use this?

**Perfect for:**

- **DevOps Engineers** - Add a security gate to CI/CD without complex setup
- **Security Teams** - Enforce configuration policies across all projects
- **Engineering Leads** - Prevent production incidents before they happen
- **Compliance Officers** - Audit production readiness automatically

**Ideal if you:**

- Deploy Spring Boot, Node.js, or .NET applications
- Want to catch misconfigurations in CI, not production
- Need a tool that runs in <5 seconds
- Prefer fail-fast over slow, comprehensive scans

**Not ideal if you:**

- Only need code analysis (use SonarQube)
- Only need dependency scanning (use Snyk)
- Need container security (use Trivy)
- Want general-purpose SAST (use Semgrep)

---

## Installation

### Quick Start (npx - No Install)

```bash
npx prod-analyzer scan
```

### Global Install (Recommended for CI)

```bash
npm install -g prod-analyzer
prod-analyzer scan --fail-on HIGH
```

### Local Dev Dependency

```bash
npm install --save-dev prod-analyzer
```

Add to `package.json`:

```json
{
  "scripts": {
    "security": "prod-analyzer scan --fail-on HIGH"
  }
}
```

---

## Platform Support

| Platform | Config Files | Rules | Status |
|----------|-------------|-------|--------|
| **Spring Boot** | `application.properties`, `application.yml` | 9 rules | Production Ready |
| **Node.js** | `.env`, `package.json`, `.npmrc` | 7 rules | Production Ready |
| **.NET** | `appsettings.json`, `web.config` | 5 rules | Production Ready |
| **General** | All platforms | 6 rules | Production Ready |

**Total: 27 production-tested security rules**

---

## Security Rules (Rule Spotlight)

### Critical Rules (Deploy Blockers)

#### 1. HIBERNATE_DDL_AUTO_UNSAFE (Spring Boot)
**Why it matters:** `ddl-auto=create-drop` WILL delete your production database on restart.

**Detects:**
- `spring.jpa.hibernate.ddl-auto = create | create-drop | update`

**Impact:** Data loss, application downtime, potential legal liability.

---

#### 2. EXPOSED_SECRETS (Node.js)
**Why it matters:** Weak secrets are brute-forceable in minutes.

**Detects:**
- JWT secrets < 32 characters
- Common passwords: "secret", "changeme", "admin"
- Database passwords in plaintext

**Impact:** Complete authentication bypass, data breach.

---

#### 3. CLOUD_TOKEN_EXPOSURE (All Platforms)
**Why it matters:** One exposed AWS key = $50,000 cryptomining bill.

**Detects:**
- AWS Access Keys (`AKIA...`)
- GitHub Personal Access Tokens (`ghp_...`)
- Stripe API Keys (`sk_live_...`)
- Google Cloud API Keys
- Azure Connection Strings

**Impact:** Unauthorized cloud resource usage, data exfiltration, financial loss.

---

#### 4. DEFAULT_PASSWORDS (All Platforms)
**Why it matters:** Default passwords are in every hacker's dictionary.

**Detects:**
- `admin`, `password`, `root`, `changeme`, `123456`
- Passwords < 8 characters

**Impact:** Unauthorized access, privilege escalation.

---

### High-Severity Rules

- **SPRING_PROFILE_DEV_ACTIVE**: Development features in production
- **ACTUATOR_ENDPOINTS_EXPOSED**: All Spring Boot Actuator endpoints exposed
- **NODE_ENV_NOT_PRODUCTION**: Node.js not in production mode
- **CORS_WILDCARD_ORIGIN**: CORS allows any domain
- **ASPNETCORE_ENVIRONMENT_DEVELOPMENT**: .NET in development mode

**[View all 27 rules →](docs/RULES.md)**

---

## CI Templates

**Production-ready CI/CD configuration templates for instant integration.**

We provide copy-paste ready CI templates for all major platforms. These templates include:
- Automatic Node.js setup
- Dependency installation and caching
- Build and test execution
- Production configuration security scanning as a CI gate
- Configurable scan profiles and fail thresholds
- Artifact generation (JSON and SARIF reports)

### Available Templates

All templates are located in the `ci-templates/` directory:

| Platform | Template Path | Copy To |
|----------|---------------|---------|
| **GitHub Actions** | `ci-templates/github-actions/prod-analyzer.yml` | `.github/workflows/prod-analyzer.yml` |
| **GitLab CI** | `ci-templates/gitlab-ci/.gitlab-ci.yml` | `.gitlab-ci.yml` |
| **Azure DevOps** | `ci-templates/azure-devops/azure-pipelines.yml` | `azure-pipelines.yml` |
| **Jenkins** | `ci-templates/jenkins/Jenkinsfile` | `Jenkinsfile` |

---

### GitHub Actions Template

**Location:** `ci-templates/github-actions/prod-analyzer.yml`

**Quick Setup:**

1. Copy the template to your repository:
```bash
mkdir -p .github/workflows
cp ci-templates/github-actions/prod-analyzer.yml .github/workflows/
```

2. Configure scan behavior by editing environment variables:
```yaml
env:
  PROFILE: spring          # Options: spring, node, dotnet, all
  ENVIRONMENT: prod        # Your target environment name
  FAIL_ON: HIGH           # Options: CRITICAL, HIGH, MEDIUM, LOW
  SCAN_TARGET: .          # Directory to scan
```

3. Commit and push. The workflow runs automatically on push and pull requests.

**Features:**
- Runs on Node.js 20
- Executes `npm ci`, `npm run build`, `npm test`
- Scans configuration files with prod-analyzer
- Fails pipeline if violations are found above threshold
- Uploads SARIF report to GitHub Security tab
- Saves JSON report as artifact

---

### GitLab CI Template

**Location:** `ci-templates/gitlab-ci/.gitlab-ci.yml`

**Quick Setup:**

1. Copy the template to your repository root:
```bash
cp ci-templates/gitlab-ci/.gitlab-ci.yml .
```

2. Configure scan behavior in the variables section:
```yaml
variables:
  PROFILE: spring          # Options: spring, node, dotnet, all
  ENVIRONMENT: prod        # Your target environment name
  FAIL_ON: HIGH           # Options: CRITICAL, HIGH, MEDIUM, LOW
  SCAN_TARGET: .          # Directory to scan
```

3. Commit and push. The pipeline runs automatically.

**Features:**
- Multi-stage pipeline (build, test, security)
- Node.js 20 Alpine image
- Caches node_modules for faster builds
- Generates JSON report as GitLab artifact
- Security scan runs in dedicated stage

---

### Azure DevOps Template

**Location:** `ci-templates/azure-devops/azure-pipelines.yml`

**Quick Setup:**

1. Copy the template to your repository root:
```bash
cp ci-templates/azure-devops/azure-pipelines.yml .
```

2. Configure scan behavior in the variables section:
```yaml
variables:
  PROFILE: 'spring'        # Options: spring, node, dotnet, all
  ENVIRONMENT: 'prod'      # Your target environment name
  FAIL_ON: 'HIGH'         # Options: CRITICAL, HIGH, MEDIUM, LOW
  SCAN_TARGET: '.'        # Directory to scan
```

3. Create a new pipeline in Azure DevOps pointing to this file.

**Features:**
- Multi-stage pipeline with build and security stages
- Artifact publishing for build outputs
- JSON report published as artifact
- Runs on ubuntu-latest agent
- Triggers on main, master, and develop branches

---

### Jenkins Template

**Location:** `ci-templates/jenkins/Jenkinsfile`

**Quick Setup:**

1. Copy the template to your repository root:
```bash
cp ci-templates/jenkins/Jenkinsfile .
```

2. Configure scan behavior in the environment section:
```groovy
environment {
    PROFILE = 'spring'          // Options: spring, node, dotnet, all
    ENVIRONMENT = 'prod'        // Your target environment name
    FAIL_ON = 'HIGH'           // Options: CRITICAL, HIGH, MEDIUM, LOW
    SCAN_TARGET = '.'          // Directory to scan
    NODE_VERSION = '20'        // Node.js version to use
}
```

3. Create a new Pipeline job in Jenkins and configure it to use this Jenkinsfile.

**Prerequisites:**
- NodeJS plugin installed in Jenkins
- Node.js 20 configured in Jenkins Global Tool Configuration

**Features:**
- Declarative pipeline with clear stages
- Automatic artifact archiving
- Workspace cleanup after build
- 15-minute timeout protection
- Post-build status reporting

---

### Configuration Options

All templates support these configuration variables:

| Variable | Description | Valid Values | Default |
|----------|-------------|--------------|---------|
| `PROFILE` | Platform-specific rules to run | `spring`, `node`, `dotnet`, `all` | `spring` |
| `ENVIRONMENT` | Target environment name (for reports) | Any string | `prod` |
| `FAIL_ON` | Minimum severity to fail the build | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `NONE` | `HIGH` |
| `SCAN_TARGET` | Directory to scan | Any valid path | `.` (current directory) |

---

### How It Works

1. **Install & Build**: Templates install Node.js, run `npm ci`, `npm run build`, and `npm test`
2. **Security Scan**: Executes `npx prod-analyzer scan` with your configuration
3. **Fail-Fast**: Pipeline fails if violations are found at or above the `FAIL_ON` threshold
4. **Report Generation**: Creates JSON and/or SARIF reports for artifact storage
5. **GitHub Security Integration**: SARIF reports automatically appear in GitHub Security tab (GitHub Actions only)

---

### Customization Examples

**Scan only production configs in a monorepo:**
```yaml
SCAN_TARGET: backend/src/main/resources
PROFILE: spring
```

**Multi-platform project:**
```yaml
PROFILE: all
SCAN_TARGET: .
```

**Strict security gate (only CRITICAL blocks):**
```yaml
FAIL_ON: CRITICAL
```

**Audit mode (never fail, just report):**
```yaml
FAIL_ON: NONE
```

---

### Troubleshooting

**Issue:** "prod-analyzer: command not found"  
**Solution:** Templates use `npx prod-analyzer` which doesn't require global install. If you prefer local build, use:
```bash
npm run build
node dist/cli/main.js scan -d . --profile spring --fail-on HIGH
```

**Issue:** Pipeline fails but no violations shown  
**Solution:** Check exit code. Code 2 = invalid arguments, Code 3 = unexpected error. Review pipeline logs.

**Issue:** Want to customize scan further  
**Solution:** See full CLI reference below or run `npx prod-analyzer scan --help`

---

## CI/CD Integration (Copy-Paste Ready)

### GitHub Actions

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  config-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configuration Security Scan
        run: npx prod-analyzer scan --fail-on HIGH
      
      - name: Upload SARIF to GitHub Security
        if: always()
        run: |
          npx prod-analyzer scan --format sarif > results.sarif
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: results.sarif
```

**Result:** Violations appear in GitHub Security tab automatically.

---

### GitLab CI

```yaml
config-security:
  stage: test
  script:
    - npx prod-analyzer scan --fail-on HIGH --format json > security-report.json
  artifacts:
    reports:
      junit: security-report.json
  allow_failure: false
```

---

### Jenkins

```groovy
stage('Configuration Security') {
  steps {
    sh 'npx prod-analyzer scan --fail-on HIGH'
  }
}
```

---

### Exit Codes (CI-Friendly)

| Exit Code | Meaning | CI Action |
|-----------|---------|-----------|
| **0** | No violations above threshold | Pipeline continues |
| **1** | Violations found at or above `--fail-on` level | Pipeline blocked |
| **2** | Invalid arguments (e.g., bad profile) | Pipeline fails |
| **3** | Unexpected error (e.g., file I/O) | Pipeline fails |

**Fail-fast behavior:**

```bash
# Block deploys if any HIGH or CRITICAL violations
prod-analyzer scan --fail-on HIGH
echo $?  # 1 if violations found, 0 otherwise

# Only block on CRITICAL violations
prod-analyzer scan --fail-on CRITICAL

# Audit mode (never fail pipeline)
prod-analyzer scan --fail-on NONE || true
```

---

## Custom Policy Engine

**Enforce company-specific rules without writing code.**

Create `.prod-analyzer-policy.yml`:

```yaml
policies:
  name: "Acme Corp Production Policy"
  version: "1.0.0"
  
  rules:
    - id: "no-ddl-auto"
      description: "Database schema changes forbidden"
      key: "spring.jpa.hibernate.ddl-auto"
      forbiddenValues: ["create", "create-drop", "update"]
      severity: CRITICAL
      message: "Use Flyway/Liquibase for schema changes"
    
    - id: "require-prod-profile"
      description: "Only 'prod' profile allowed"
      key: "spring.profiles.active"
      requiredValue: "prod"
      severity: CRITICAL
      message: "Production profile is mandatory"
    
    - id: "no-http-urls"
      description: "All APIs must use HTTPS"
      key: "API_URL"
      forbiddenPattern: "^http://.*"
      severity: HIGH
      message: "HTTP URLs are insecure"
```

**Policy violations appear in output:**

```
[CRITICAL] POLICY:no-ddl-auto (1 occurrence)
  → application.properties:5
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: [Acme Corp] Use Flyway/Liquibase for schema changes
```

**Why this matters:**
- **Semgrep** requires writing code rules
- **prod-analyzer policies** are YAML - accessible to security teams, not just developers

**[Complete Policy Guide →](docs/POLICY_GUIDE.md)**

---

## CLI Reference

### Scan Command

```bash
prod-analyzer scan [options]
```

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-d, --directory <path>` | Directory to scan | Current directory | `-d ./backend` |
| `-p, --profile <profile>` | Platform filter | `spring` | `--profile node` |
| `-f, --fail-on <severity>` | Exit 1 if violations ≥ severity | `HIGH` | `--fail-on CRITICAL` |
| `--format <format>` | Output format | `console` | `--format json` |
| `-e, --env <environment>` | Environment label | `prod` | `-e staging` |
| `-v, --verbose` | Detailed output | `false` | `-v` |

**Profiles:**

- `spring` - Spring Boot only (9 rules)
- `node` - Node.js only (7 rules)
- `dotnet` - .NET only (5 rules)
- `all` - All platforms (27 rules)

**Formats:**

- `console` - Human-readable terminal output
- `json` - Machine-readable JSON
- `sarif` - GitHub Security tab compatible

---

## Comparison: prod-analyzer vs Alternatives

| Feature | prod-analyzer | SonarQube | Snyk | Trivy | Semgrep |
|---------|---------------|-----------|------|-------|---------|
| **Focus** | Config files | Code quality | Dependencies | Containers | Code patterns |
| **Spring Boot configs** | ✅ 9 rules | ❌ | ❌ | ❌ | ⚠️ (custom rules) |
| **Node.js configs** | ✅ 7 rules | ❌ | ❌ | ❌ | ⚠️ (custom rules) |
| **.NET configs** | ✅ 5 rules | ❌ | ❌ | ❌ | ⚠️ (custom rules) |
| **Setup time** | < 30 seconds | Hours | Minutes | Minutes | Minutes |
| **Scan speed** | < 5 seconds | Minutes | Seconds | Seconds | Seconds |
| **Custom policies** | ✅ YAML | ✅ XML | ❌ | ❌ | ✅ Code |
| **CI/CD exit codes** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SARIF output** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Open source** | ✅ MIT | ⚠️ Limited | ❌ | ✅ Apache | ✅ LGPL |
| **Price** | Free | €€€€ | €€€€ | Free | Free |

**When to use prod-analyzer:**

- ✅ You deploy Spring Boot, Node.js, or .NET apps
- ✅ You need fast (<5s) configuration scanning
- ✅ You want zero-config CI integration
- ✅ You need company-specific policy enforcement

**When NOT to use:**

- ❌ You only need code analysis → Use SonarQube
- ❌ You only need dependency scanning → Use Snyk
- ❌ You only need container security → Use Trivy

**Best practice:** Use prod-analyzer **alongside** other tools:

```yaml
jobs:
  security:
    steps:
      - name: Code Analysis
        run: sonar-scanner
      
      - name: Dependency Scan
        run: snyk test
      
      - name: Configuration Scan  # ← Add this
        run: npx prod-analyzer scan --fail-on HIGH
```

---

## Output Formats

### Console (Human-Readable)

```bash
prod-analyzer scan
```

```
━━━ Secure Guard Scan Report ━━━

Target:      /app/backend
Profile:     spring
Environment: prod
Status:      FAIL ❌
Security Score: 62/100 (POOR)

Summary:
  Files scanned:     3
  Entries evaluated: 45
  Rules executed:    9
  Scan duration:     2ms
  Total violations:  12

Blocking Violations (5 CRITICAL, 4 HIGH):

[CRITICAL] HIBERNATE_DDL_AUTO_UNSAFE (1 occurrence)
  → application.yml:12
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: This WILL cause data loss on restart
  Fix:   Use 'validate' or 'none'

[HIGH] ACTUATOR_ENDPOINTS_EXPOSED (1 occurrence)
  → application.properties:8
    management.endpoints.web.exposure.include = *
  Issue: All endpoints exposed
  Fix:   Specify only: health,info,metrics

Exit Code: 1 (Deploy blocked)
```

---

### JSON (CI Artifacts)

```bash
prod-analyzer scan --format json > security-report.json
```

```json
{
  "targetDirectory": "/app/backend",
  "profile": "spring",
  "environment": "prod",
  "timestamp": "2026-01-28T10:30:00Z",
  "summary": {
    "filesScanned": 3,
    "totalViolations": 12,
    "criticalCount": 5,
    "highCount": 4,
    "mediumCount": 3,
    "securityScore": 62,
    "status": "FAIL"
  },
  "violations": [
    {
      "ruleId": "HIBERNATE_DDL_AUTO_UNSAFE",
      "severity": "CRITICAL",
      "message": "This WILL cause data loss",
      "filePath": "application.yml",
      "lineNumber": 12,
      "configKey": "spring.jpa.hibernate.ddl-auto",
      "configValue": "create-drop"
    }
  ]
}
```

---

### SARIF (GitHub Security Tab)

```bash
prod-analyzer scan --format sarif > results.sarif
```

Upload to GitHub:

```yaml
- uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: results.sarif
```

Violations appear in **Security → Code scanning alerts**.

---

## Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - 5-minute setup
- **[Policy Guide](docs/POLICY_GUIDE.md)** - Create custom rules
- **[All 27 Rules](docs/RULES.md)** - Complete rule reference
- **[CI/CD Integration](docs/CI_INTEGRATION.md)** - GitHub, GitLab, Jenkins examples
- **[Scan Mechanism](docs/SCAN_MECHANISM.md)** - How it works under the hood

---

## Roadmap

### Open Source (Always Free)

- ✅ 27 security rules across 3 platforms
- ✅ Custom YAML policies
- ✅ SARIF output for GitHub Security
- ✅ Multi-format output (console, JSON, SARIF)
- 🚧 Python/Django support (Q2 2026)
- 🚧 Ruby on Rails support (Q3 2026)
- 🚧 Configuration drift detection

### Enterprise Features (Coming Soon)

Considering paid add-ons for enterprise teams:

- **Policy Packs**: Pre-built policies for SOC2, PCI-DSS, HIPAA compliance
- **Web Dashboard**: Centralized security scores across all repos
- **Historical Trends**: Track security posture over time
- **Team Collaboration**: Shared policy libraries
- **Audit Logs**: Compliance-ready scan history
- **Priority Support**: SLA-backed responses

**Interested?** Email: enterprise@prod-analyzer.dev

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

**Easy first contributions:**

- Add a new rule for your platform
- Improve documentation
- Add example policy files
- Report false positives

---

## License

MIT License - See [LICENSE](LICENSE) file.

**Commercial use allowed.** No attribution required.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/onrcanogul/prod-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/onrcanogul/prod-analyzer/discussions)
- **Security**: Report vulnerabilities to security@prod-analyzer.dev
- **Enterprise**: enterprise@prod-analyzer.dev

---

## Quick Links

- [npm Package](https://www.npmjs.com/package/prod-analyzer)
- [GitHub Repository](https://github.com/onrcanogul/prod-analyzer)
- [Documentation](docs/)
- [Changelog](CHANGELOG.md)

---

**Stop production incidents. Start using prod-analyzer today.**

```bash
npx prod-analyzer scan
```

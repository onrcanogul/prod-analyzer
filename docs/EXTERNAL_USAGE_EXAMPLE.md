# External Project Usage Example

This guide shows how to use `prod-analyzer` in your own projects.

---

## 📦 Installation Options

### Option 1: Global Installation (Use Anywhere)

```bash
# Install globally
npm install -g prod-analyzer

# Verify installation
prod-analyzer --version
```

**Pros:**
- Install once, use in any project
- No package.json modifications needed
- Works from command line anywhere

**Use case:** Quick security checks, local development

---

### Option 2: Project Dependency (CI/CD Integration)

```bash
# Install as dev dependency
npm install --save-dev prod-analyzer

# Or with Yarn
yarn add --dev prod-analyzer
```

**Pros:**
- Version locked in package.json
- Consistent across team
- Works in CI/CD pipelines

**Use case:** Team projects, CI/CD automation

---

## 🚀 Quick Start Examples

### Example 1: Spring Boot Project

```bash
# Navigate to your Spring Boot project
cd ~/projects/my-spring-app

# Scan with default settings (Spring profile, HIGH threshold)
prod-analyzer scan

# Scan specific directory
prod-analyzer scan -d ./src/main/resources
```

**Expected output:**
```
━━━ Secure Guard Scan Report ━━━

Target:      /Users/you/projects/my-spring-app
Profile:     spring
Environment: prod

STATUS: FAIL
Deploy blocked due to CRITICAL violations (threshold: HIGH)

Blocking Violations (2 rules, 3 total):

[CRITICAL] HIBERNATE_DDL_AUTO_UNSAFE (1 occurrence)
  → application.properties:12
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: Hibernate ddl-auto set to "create-drop". This WILL cause data loss.
  Fix:   Set to "none" or "validate" in production...

[HIGH] SPRING_PROFILE_DEV_ACTIVE (2 occurrences)
  → application.yml:5
    spring.profiles.active = dev
  ...
```

---

### Example 2: Node.js / Express Project

```bash
# Navigate to your Node.js project
cd ~/projects/my-node-api

# Scan with Node.js profile
prod-analyzer scan --profile node

# Scan and output JSON for CI
prod-analyzer scan --profile node --format json > security-report.json
```

**Expected findings:**
- `NODE_ENV` not set to production
- Weak JWT secrets
- CORS wildcard origins
- Missing helmet middleware
- Debug logging enabled

---

### Example 3: .NET Project

```bash
# Navigate to your .NET project
cd ~/projects/MyDotNetApp

# Scan with .NET profile
prod-analyzer scan --profile dotnet

# Scan appsettings.json only
prod-analyzer scan -d . --profile dotnet
```

**Expected findings:**
- Development environment enabled
- Detailed error pages exposed
- Connection strings in plain text
- Missing HTTPS enforcement

---

### Example 4: Monorepo / Multi-Platform

```bash
# Navigate to monorepo
cd ~/projects/my-monorepo

# Scan everything with all profiles
prod-analyzer scan --profile all

# Scan only backend services
prod-analyzer scan -d ./services --profile all
```

**Project structure:**
```
my-monorepo/
├── frontend/          (React - not scanned)
├── backend-api/       (Node.js - scanned)
├── admin-service/     (Spring Boot - scanned)
└── worker-service/    (.NET - scanned)
```

---

## 🔧 Adding to Your Project's package.json

### Recommended Scripts

```json
{
  "name": "my-awesome-project",
  "scripts": {
    "security:scan": "prod-analyzer scan --profile all",
    "security:critical": "prod-analyzer scan --fail-on CRITICAL",
    "security:report": "prod-analyzer scan --format json > security-report.json",
    "security:sarif": "prod-analyzer scan --format sarif > results.sarif",
    "precommit": "prod-analyzer scan --fail-on HIGH"
  },
  "devDependencies": {
    "prod-analyzer": "^0.1.1"
  }
}
```

### Usage

```bash
# Quick scan (blocks on CRITICAL+)
npm run security:critical

# Full scan (all platforms)
npm run security:scan

# Generate report for CI artifacts
npm run security:report

# Pre-commit check
npm run precommit
```

---

## 🐳 Docker Usage

### Scan External Project with Docker

```bash
# Pull the image (when available)
docker pull ghcr.io/onrcanogul/prod-analyzer:latest

# Scan your project
docker run --rm \
  -v /path/to/your/project:/workspace \
  ghcr.io/onrcanogul/prod-analyzer:latest \
  scan -d /workspace --profile all

# Example: Scan Spring Boot project
docker run --rm \
  -v ~/projects/my-spring-app:/workspace \
  prod-analyzer:latest \
  scan -d /workspace --profile spring --fail-on HIGH
```

---

## 🔄 CI/CD Integration Examples

### GitHub Actions

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Configuration Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install prod-analyzer
        run: npm install -g prod-analyzer
      
      - name: Scan configuration
        run: prod-analyzer scan --profile all --fail-on HIGH
      
      - name: Generate SARIF report
        if: always()
        run: prod-analyzer scan --format sarif > results.sarif
      
      - name: Upload to GitHub Security
        if: always()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif
```

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
security-scan:
  stage: test
  image: node:20-alpine
  script:
    - npm install -g prod-analyzer
    - prod-analyzer scan --profile all --fail-on HIGH
    - prod-analyzer scan --format sarif > gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
  allow_failure: false
```

### Jenkins

Add to `Jenkinsfile`:

```groovy
pipeline {
    agent any
    stages {
        stage('Security Scan') {
            steps {
                sh 'npm install -g prod-analyzer'
                sh 'prod-analyzer scan --profile all --fail-on HIGH'
            }
        }
    }
    post {
        always {
            sh 'prod-analyzer scan --format json > security-report.json'
            archiveArtifacts artifacts: 'security-report.json'
        }
    }
}
```

---

## 🔒 Pre-commit Hook

### Install Husky

```bash
npm install --save-dev husky
npx husky install
```

### Create Hook

```bash
# Create pre-commit hook
npx husky add .husky/pre-commit "npx prod-analyzer scan --fail-on HIGH"
```

Or manually create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running security configuration scan..."
npx prod-analyzer scan --fail-on HIGH || {
  echo "❌ Security scan failed! Fix violations before committing."
  exit 1
}
```

---

## 📊 Understanding Exit Codes

prod-analyzer uses standard exit codes for CI/CD integration:

| Exit Code | Meaning | CI Action |
|-----------|---------|-----------|
| **0** | No violations above threshold | ✅ Pipeline passes |
| **1** | Violations found at/above threshold | ❌ Pipeline fails |
| **2** | Invalid arguments | ❌ Pipeline fails |
| **3** | Unexpected error | ❌ Pipeline fails |

### Example CI Script

```bash
#!/bin/bash

# Run scan
prod-analyzer scan --profile all --fail-on HIGH

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Security scan passed!"
  exit 0
elif [ $EXIT_CODE -eq 1 ]; then
  echo "❌ Security violations found - deployment blocked!"
  exit 1
else
  echo "⚠️  Scan error (exit code: $EXIT_CODE)"
  exit $EXIT_CODE
fi
```

---

## 🎯 Real-World Scenarios

### Scenario 1: Spring Boot Microservice in Kubernetes

**Goal:** Prevent deployment if critical vulnerabilities exist

```bash
# In CI pipeline
prod-analyzer scan \
  -d ./config \
  --profile spring \
  --fail-on CRITICAL \
  --format sarif > k8s-security.sarif

# Deploy only if scan passes (exit code 0)
if [ $? -eq 0 ]; then
  kubectl apply -f deployment.yaml
fi
```

### Scenario 2: Node.js API with Environment Files

**Goal:** Catch exposed secrets before they hit production

```bash
# Scan environment files
prod-analyzer scan \
  -d . \
  --profile node \
  --fail-on HIGH

# Common findings:
# - EXPOSED_SECRETS (JWT secrets too short)
# - DEFAULT_PASSWORDS (changeme, admin, test)
# - CLOUD_TOKEN_EXPOSURE (AWS keys in .env files)
# - TLS_VERIFY_DISABLED (NODE_TLS_REJECT_UNAUTHORIZED=0)
```

### Scenario 3: .NET Core API with Azure Deployment

**Goal:** Ensure production-ready configuration before Azure deploy

```bash
# Scan appsettings.json and appsettings.Production.json
prod-analyzer scan \
  -d ./MyApi \
  --profile dotnet \
  --fail-on HIGH \
  --format json > azure-security-report.json

# Upload report to Azure DevOps artifacts
az devops publish --file azure-security-report.json
```

---

## 🛠️ Troubleshooting

### "Command not found: prod-analyzer"

**Solution:**
```bash
# Check if installed globally
npm list -g prod-analyzer

# Reinstall if missing
npm install -g prod-analyzer

# Or use npx
npx prod-analyzer scan
```

### "No configuration files found"

**Reasons:**
- Wrong directory (no application.properties, .env, appsettings.json found)
- Files are in subdirectories

**Solution:**
```bash
# List what files it looks for
prod-analyzer scan --help

# Scan subdirectory
prod-analyzer scan -d ./src/main/resources

# Scan with verbose output
prod-analyzer scan -v
```

### "Scan passes but shouldn't"

**Reasons:**
- Wrong profile (e.g., using `spring` profile on Node.js project)
- Threshold too high

**Solution:**
```bash
# Use correct profile
prod-analyzer scan --profile node  # For Node.js
prod-analyzer scan --profile all   # When unsure

# Lower threshold
prod-analyzer scan --fail-on MEDIUM
```

---

## 📚 Next Steps

- See [CI_INTEGRATION.md](./CI_INTEGRATION.md) for detailed CI/CD setup
- See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for all CLI options
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for how it works
- Check [README.md](../README.md) for full rule list

---

## 💡 Tips

1. **Start with CRITICAL threshold** in new projects, then tighten to HIGH
2. **Use `--profile all`** in monorepos or when platform is unclear
3. **Generate SARIF** for GitHub/GitLab Security tab integration
4. **Run in pre-commit hooks** to catch issues before they're committed
5. **Archive JSON reports** in CI for historical tracking

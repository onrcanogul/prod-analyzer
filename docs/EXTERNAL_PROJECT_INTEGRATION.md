# External Project Integration Guide

This guide shows how to integrate **Secure Guard** into **other projects'** CI/CD pipelines.

---

## Use Cases

### Scenario 1: Spring Boot Microservice
You have a Spring Boot backend at `my-company/payment-service` and want to scan its `application.yml` before deployment.

### Scenario 2: Node.js API
You have a Node.js Express API at `my-company/user-api` with `.env` files that need security checks.

### Scenario 3: Monorepo
You have a monorepo with Spring Boot backend + Node.js frontend, need to scan both.

---

## Integration Methods

### Method 1: NPM Package (Recommended)

**Best for:** Any project with Node.js in CI (most common)

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run Security Scan
        run: npx secure-guard scan --profile spring --fail-on HIGH
```

**Pros:**
- No installation needed (npx downloads on-demand)
- Always gets latest version
- Works in any CI with Node.js

**Cons:**
- Requires Node.js in CI (but most CIs have it)

---

### Method 2: Docker (Best for CI)

**Best for:** Projects without Node.js, or wanting containerized scans

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Security Scan
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            ghcr.io/your-org/secure-guard:latest \
            scan -d /workspace --profile spring --fail-on HIGH
```

**Pros:**
- ✅ Zero dependencies (Docker only)
- ✅ Consistent environment
- ✅ Works for Java-only, .NET-only projects

**Cons:**
- ❌ Slightly slower (Docker pull)

---

### Method 3: GitHub Action (Future)

**Coming soon:** Reusable GitHub Action

```yaml
- uses: your-org/secure-guard-action@v1
  with:
    directory: ./backend
    profile: spring
    fail-on: HIGH
    format: sarif
```

---

## 📚 Real-World Examples

### Example 1: Spring Boot Backend

**Project:** `my-company/payment-service` (Java Spring Boot)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
      - run: ./mvnw test
  
  # ⬇️ ADD THIS JOB ⬇️
  security-scan:
    runs-on: ubuntu-latest
    needs: test  # Run after tests pass
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js (for scanner)
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Scan Spring Boot Config
        run: |
          npx secure-guard scan \
            --profile spring \
            --fail-on HIGH \
            --format sarif > results.sarif
        continue-on-error: true
      
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
      
      - name: Fail if Critical Issues
        run: npx secure-guard scan --profile spring --fail-on HIGH
```

**What this does:**
1. Runs Spring Boot tests
2. Scans `application.yml` / `application.properties`
3. Uploads results to GitHub Security tab
4. Blocks deployment if HIGH/CRITICAL issues found

---

### Example 2: Node.js Express API

**Project:** `my-company/user-api` (Node.js + Express)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
  
  # ⬇️ ADD THIS JOB ⬇️
  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Scan Node.js Config
        run: npx secure-guard scan --profile node --fail-on HIGH
```

**Scans:**
- `.env` files (secrets, API keys)
- `config.json` (CORS, debug mode)
- Node environment variables

---

### Example 3: .NET Web API

**Project:** `my-company/customer-api` (ASP.NET Core)

```yaml
# .github/workflows/ci.yml
name: .NET CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      - run: dotnet build
      - run: dotnet test
  
  # ⬇️ ADD THIS JOB ⬇️
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Use Docker (no Node.js needed)
      - name: Security Scan
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            ghcr.io/your-org/secure-guard:latest \
            scan -d /workspace --profile dotnet --fail-on HIGH
```

**Scans:**
- `appsettings.json` (connection strings, detailed errors)
- `web.config` (environment settings)

---

### Example 4: Monorepo (Spring + Node.js)

**Project:** `my-company/platform` (Backend + Frontend)

```
platform/
├── backend/     (Spring Boot)
├── frontend/    (Next.js)
└── mobile/      (React Native)
```

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [push, pull_request]

jobs:
  scan-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan Spring Boot
        run: npx secure-guard scan -d ./backend --profile spring --fail-on HIGH
  
  scan-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan Node.js
        run: npx secure-guard scan -d ./frontend --profile node --fail-on HIGH
  
  scan-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan Everything
        run: npx secure-guard scan --profile all --fail-on HIGH --format json > full-report.json
      - uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: full-report.json
```

---

## 🔧 GitLab CI Examples

### Spring Boot Project

```yaml
# .gitlab-ci.yml
stages:
  - test
  - security
  - deploy

test:
  stage: test
  script:
    - ./mvnw test

security-scan:
  stage: security
  image: node:20-alpine
  script:
    - npx secure-guard scan --profile spring --fail-on HIGH
  allow_failure: false  # Block pipeline on violations
```

### With SAST Report

```yaml
security-scan:
  stage: security
  image: node:20-alpine
  script:
    - npx secure-guard scan --format sarif > gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
```

---

## 🐳 Docker in Production CI

### Jenkins

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh './gradlew build'
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    docker.image('ghcr.io/your-org/secure-guard:latest').inside {
                        sh 'secure-guard scan --profile spring --fail-on HIGH'
                    }
                }
            }
        }
    }
}
```

### CircleCI

```yaml
version: 2.1

jobs:
  security-scan:
    docker:
      - image: ghcr.io/your-org/secure-guard:latest
    steps:
      - checkout
      - run: secure-guard scan --profile spring --fail-on HIGH

workflows:
  version: 2
  build-and-scan:
    jobs:
      - security-scan
```

---

## 🎯 Integration Checklist

### Before Integration

- [ ] Determine project platform (Spring Boot, Node.js, .NET)
- [ ] Check if CI has Node.js (if using NPM method)
- [ ] Decide on Docker vs NPM approach
- [ ] Choose fail threshold (CRITICAL, HIGH, MEDIUM)

### During Integration

- [ ] Add security scan job to CI workflow
- [ ] Test on feature branch first
- [ ] Verify exit codes work correctly
- [ ] Check SARIF upload (GitHub/GitLab Security tab)

### After Integration

- [ ] Monitor scan duration (should be <1 second)
- [ ] Review violations in first run
- [ ] Adjust threshold if needed
- [ ] Document in project README

---

## ⚡ Performance

Typical scan times:

| Project Size | Files | Scan Time |
|-------------|-------|-----------|
| Small (1-5 files) | 1-5 | <100ms |
| Medium (10-20 files) | 10-20 | <500ms |
| Large (50+ files) | 50+ | <2s |

**Note:** NPM install adds ~5-10s on first run (cached after that).

---

## 🚨 Common Issues

### Issue 1: "command not found: npx"

**Solution:** Add Node.js setup step:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### Issue 2: Docker pull fails

**Solution:** Use public registry or authenticate:

```yaml
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Issue 3: Scan fails but should pass

**Check:**
1. Profile matches project type (`--profile spring` for Spring Boot)
2. Threshold is appropriate (`--fail-on HIGH` not `MEDIUM`)
3. Config files are in expected location

---

## 📊 Real-World Results

### Before Secure Guard

```
❌ Production incident: Dev profile active in prod
❌ Database wiped: ddl-auto=create-drop deployed
❌ Secrets leaked: API keys in .env committed
```

### After Secure Guard

```
✅ All misconfigurations caught in CI
✅ Zero production incidents from config issues
✅ Security team happy, DevOps team productive
```

---

## 🎓 Best Practices

### 1. **Run Early in Pipeline**

```yaml
jobs:
  security:  # ← First job
    runs-on: ubuntu-latest
    steps:
      - run: npx secure-guard scan
  
  build:     # Only runs if security passes
    needs: security
    runs-on: ubuntu-latest
```

### 2. **Use SARIF for GitHub/GitLab**

```yaml
- run: npx secure-guard scan --format sarif > results.sarif
- uses: github/codeql-action/upload-sarif@v3
```

**Why?** Security findings show in PR comments and Security tab.

### 3. **Different Thresholds per Branch**

```yaml
- name: Scan
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      npx secure-guard scan --fail-on CRITICAL
    else
      npx secure-guard scan --fail-on HIGH
    fi
```

### 4. **Cache NPM for Speed**

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← Speeds up npx
```

---

## 🚀 Quick Start Commands

### Test Locally First

```bash
# Test on your machine
npx secure-guard scan --profile spring

# See what violations would block CI
npx secure-guard scan --fail-on HIGH

# Generate SARIF for review
npx secure-guard scan --format sarif > results.sarif
```

### Add to CI (Simplest)

```yaml
# .github/workflows/security.yml
name: Security
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx secure-guard scan --profile spring --fail-on HIGH
```

---

## 📞 Support

### For Your Project

1. **Test locally first:** `npx secure-guard scan`
2. **Check CI logs** for error messages
3. **Adjust threshold** if too strict/loose
4. **Open issue** in Secure Guard repo for bugs

### For This Tool

- **GitHub Issues:** Report bugs/feature requests
- **Documentation:** [CI_INTEGRATION.md](./CI_INTEGRATION.md)
- **Examples:** See `test-fixtures/` directory

---

## ✅ Success Metrics

After integrating Secure Guard:

- [ ] Zero config-related production incidents
- [ ] Security findings in PRs before merge
- [ ] Clear pass/fail signals in CI
- [ ] Team understands violations and how to fix

---

**Ready to integrate?** Start with Method 1 (NPM) for quickest setup. Test on a feature branch first, then roll out to main.

**Questions?** Check [CI_INTEGRATION.md](./CI_INTEGRATION.md) for comprehensive examples.

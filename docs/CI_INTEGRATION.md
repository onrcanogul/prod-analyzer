# 🔄 CI/CD Integration Guide

Complete guide for integrating Secure Guard into your CI/CD pipelines.

---

## 📋 Table of Contents

- [GitHub Actions](#github-actions)
- [GitLab CI](#gitlab-ci)
- [Azure DevOps](#azure-devops)
- [Jenkins](#jenkins)
- [CircleCI](#circleci)
- [Docker Usage](#docker-usage)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Exit Codes](#exit-codes)
- [Best Practices](#best-practices)

---

## 🐙 GitHub Actions

### Basic Setup

```yaml
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
        run: npx secure-guard scan --fail-on HIGH
```

### With SARIF Upload (GitHub Security Tab)

```yaml
- name: Security Scan (SARIF)
  run: npx secure-guard scan --format sarif > results.sarif
  continue-on-error: true

- name: Upload to Security Tab
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

### Multi-Profile Scan

```yaml
- name: Scan Spring Boot Config
  run: npx secure-guard scan -d ./backend --profile spring

- name: Scan Node.js Config
  run: npx secure-guard scan -d ./frontend --profile node

- name: Scan .NET Config
  run: npx secure-guard scan -d ./api --profile dotnet
```

### With Artifacts

```yaml
- name: Security Scan (JSON Report)
  run: npx secure-guard scan --format json > security-report.json

- name: Upload Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: security-report
    path: security-report.json
```

---

## 🦊 GitLab CI

### Basic Setup

```yaml
security-scan:
  stage: test
  image: node:20-alpine
  script:
    - npm install -g secure-guard
    - secure-guard scan --fail-on HIGH
  allow_failure: false
```

### With SARIF Report

```yaml
security-scan:
  stage: test
  image: node:20-alpine
  script:
    - npm install -g secure-guard
    - secure-guard scan --format sarif > gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
```

### With JSON Artifact

```yaml
security-scan:
  stage: test
  script:
    - npx secure-guard scan --format json > security-report.json
  artifacts:
    paths:
      - security-report.json
    expire_in: 30 days
```

---

## ☁️ Azure DevOps

### Basic Pipeline

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: |
      npx secure-guard scan --fail-on HIGH
    displayName: 'Security Scan'
```

### With SARIF Upload

```yaml
- script: |
    npx secure-guard scan --format sarif > results.sarif
  displayName: 'Run Security Scan'
  continueOnError: true

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'results.sarif'
    artifactName: 'CodeAnalysisLogs'
```

---

## 🔨 Jenkins

### Declarative Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Security Scan') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 20') {
                    sh 'npx secure-guard scan --fail-on HIGH'
                }
            }
        }
        
        stage('Archive Results') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 20') {
                    sh 'npx secure-guard scan --format json > security-report.json'
                }
                archiveArtifacts artifacts: 'security-report.json', fingerprint: true
            }
        }
    }
    
    post {
        always {
            publishHTML([
                reportDir: '.',
                reportFiles: 'security-report.json',
                reportName: 'Security Report'
            ])
        }
    }
}
```

---

## ⭕ CircleCI

### Basic Config

```yaml
version: 2.1

jobs:
  security-scan:
    docker:
      - image: cimg/node:20.17
    steps:
      - checkout
      - run:
          name: Security Scan
          command: npx secure-guard scan --fail-on HIGH
      - store_artifacts:
          path: security-report.json

workflows:
  version: 2
  build-and-scan:
    jobs:
      - security-scan
```

---

## 🐳 Docker Usage

### Build Image

```bash
docker build -t secure-guard .
```

### Run in CI

```bash
# Scan current directory
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace

# With JSON output
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace --format json

# Specific profile
docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace --profile spring
```

### Docker Compose

```yaml
version: '3.8'

services:
  security-scan:
    image: secure-guard:latest
    volumes:
      - .:/workspace
    command: scan -d /workspace --fail-on HIGH
```

### In CI with Docker

```yaml
# GitHub Actions
- name: Security Scan (Docker)
  run: |
    docker run --rm -v ${{ github.workspace }}:/workspace \
      secure-guard:latest scan -d /workspace --format sarif > results.sarif
```

---

## 🪝 Pre-commit Hooks

### Install Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Pre-commit security scan

echo "🔍 Running security scan..."

# Run scan with fail-on CRITICAL (don't block for lower severity)
npx secure-guard scan --fail-on CRITICAL --format console

EXIT_CODE=$?

if [ $EXIT_CODE -eq 1 ]; then
    echo "❌ CRITICAL security issues found! Commit blocked."
    echo "💡 Run 'npx secure-guard scan -v' for details"
    exit 1
elif [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Security scan passed"
    exit 0
else
    echo "⚠️ Security scan error (exit code: $EXIT_CODE)"
    exit $EXIT_CODE
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

### Using Husky

Install husky:

```bash
npm install --save-dev husky
npx husky install
```

Add pre-commit hook:

```bash
npx husky add .git/hooks/pre-commit "npx secure-guard scan --fail-on CRITICAL"
```

---

## 📊 Exit Codes

| Code | Meaning | CI Action |
|------|---------|-----------|
| **0** | ✅ Success (no violations above threshold) | Pipeline passes |
| **1** | ❌ Violations found at or above threshold | Pipeline fails |
| **2** | ⚠️ Invalid arguments | Pipeline fails |
| **3** | 💥 Unexpected error | Pipeline fails |

### Usage in Scripts

```bash
#!/bin/bash

npx secure-guard scan --fail-on HIGH
EXIT_CODE=$?

case $EXIT_CODE in
    0)
        echo "✅ No security issues"
        ;;
    1)
        echo "❌ Security violations found"
        exit 1
        ;;
    2)
        echo "⚠️ Invalid configuration"
        exit 2
        ;;
    3)
        echo "💥 Scanner error"
        exit 3
        ;;
esac
```

---

## ✅ Best Practices

### 1. **Fail Early, Fail Fast**

```yaml
# Run security scan BEFORE build/deploy
stages:
  - security  # ← First stage
  - build
  - test
  - deploy
```

### 2. **Use Appropriate Thresholds**

```bash
# Development: Allow INFO/LOW, block MEDIUM+
secure-guard scan --fail-on MEDIUM

# Staging: Block HIGH+
secure-guard scan --fail-on HIGH

# Production: Block CRITICAL only (everything else already caught)
secure-guard scan --fail-on CRITICAL
```

### 3. **Profile-Specific Scans**

```yaml
# Don't scan Node.js rules for Spring Boot projects
- name: Spring Boot Security
  run: secure-guard scan -d ./backend --profile spring

- name: Node.js Security
  run: secure-guard scan -d ./frontend --profile node
```

### 4. **Generate Reports for Auditing**

```yaml
- name: Security Scan with Report
  run: |
    secure-guard scan --format json > security-report-${{ github.sha }}.json
  
- name: Archive Report
  uses: actions/upload-artifact@v4
  with:
    name: security-reports
    path: security-report-*.json
    retention-days: 90
```

### 5. **Use SARIF for GitHub/GitLab**

```yaml
# GitHub Security Tab integration
- run: secure-guard scan --format sarif > results.sarif
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

### 6. **Cache Dependencies**

```yaml
# GitHub Actions
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← Speeds up CI

# GitLab CI
cache:
  paths:
    - node_modules/
```

### 7. **Run on Every Push/PR**

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

### 8. **Don't Fail on Info/Low in Development**

```yaml
# Development branch - informational only
- name: Dev Security Scan
  if: github.ref != 'refs/heads/main'
  run: secure-guard scan --fail-on CRITICAL
  continue-on-error: true

# Production branch - strict
- name: Prod Security Scan
  if: github.ref == 'refs/heads/main'
  run: secure-guard scan --fail-on HIGH
```

---

## 🎯 Example: Complete GitHub Actions Workflow

```yaml
name: Production-Ready Security Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # Console output for logs
      - name: Security Scan (Console)
        run: npx secure-guard scan --profile all --fail-on HIGH --verbose
      
      # SARIF for GitHub Security
      - name: Security Scan (SARIF)
        run: npx secure-guard scan --profile all --format sarif > results.sarif
        continue-on-error: true
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
      
      # JSON for artifacts
      - name: Security Scan (JSON)
        if: always()
        run: npx secure-guard scan --profile all --format json > security-report.json
      
      - name: Upload JSON Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-report-${{ github.sha }}
          path: security-report.json
          retention-days: 90
```

---

## 📚 Additional Resources

- [SARIF Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [GitLab SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
- [Pre-commit Framework](https://pre-commit.com/)

---

**Need help?** Open an issue or check the [main README](./README.md).

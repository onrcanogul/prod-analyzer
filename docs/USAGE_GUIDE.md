# 🚀 Quick Usage Guide

## Installation

### Global Installation (Recommended)
Install once, use anywhere:
```bash
npm install -g prod-analyzer
```

Then run from any directory:
```bash
prod-analyzer scan
prod-analyzer scan --profile all
prod-analyzer scan -d ./backend --fail-on CRITICAL
```

### Local Installation (Per Project)
Install in your project:
```bash
npm install --save-dev prod-analyzer
```

Then run via npx or package.json scripts:
```bash
# Using npx
npx prod-analyzer scan

# Or add to package.json scripts:
{
  "scripts": {
    "security:scan": "prod-analyzer scan --profile all",
    "security:critical": "prod-analyzer scan --fail-on CRITICAL"
  }
}

# Then run:
npm run security:scan
```

---

## Basic Usage

### 1. Scan Current Directory (Default: Spring Boot)
```bash
prod-analyzer scan
```

### 2. Scan Specific Directory
```bash
prod-analyzer scan -d ./backend
prod-analyzer scan -d /path/to/project
```

### 3. Scan with Different Profile
```bash
# Spring Boot only
prod-analyzer scan --profile spring

# Node.js only
prod-analyzer scan --profile node

# .NET only
prod-analyzer scan --profile dotnet

# All platforms
prod-analyzer scan --profile all
```

### 4. Set Fail Threshold
```bash
# Fail on CRITICAL only (most permissive)
prod-analyzer scan --fail-on CRITICAL

# Fail on HIGH or above (default)
prod-analyzer scan --fail-on HIGH

# Fail on MEDIUM or above
prod-analyzer scan --fail-on MEDIUM
```

### 5. Different Output Formats
```bash
# Console (default - human readable)
prod-analyzer scan

# JSON (for CI/CD artifacts)
prod-analyzer scan --format json > security-report.json

# SARIF (for GitHub/GitLab Security tab)
prod-analyzer scan --format sarif > results.sarif
```

---

## Development Mode (From Source)

If you're developing prod-analyzer itself:

### NPM Scripts

### 1. `npm run demo`
Runs a demonstration scan on test fixtures with verbose output.
```bash
npm run demo
```
**What it does:**
- Builds the project
- Scans `test-fixtures/` directory
- Shows ALL violations with full details
- Uses Spring Boot profile (default)

**Perfect for:** Seeing how the tool works

---

### 2. `npm run scan -- -d <directory>`
Scans any directory you specify.
```bash
# Scan specific project
npm run scan -- -d ./my-backend

# Scan current directory
npm run scan -- -d .

# Scan with different profile
npm run scan -- -d ./my-node-app --profile node

# Scan with different threshold
npm run scan -- -d ./my-app --fail-on CRITICAL
```
**What it does:**
- Builds the project
- Scans the specified directory
- Shows all violations grouped by severity
- Exits with code 1 if violations >= threshold

**Perfect for:** Testing on real projects

---

### 3. `npm run scan:all`
Scans with ALL profiles (Spring Boot + Node.js + .NET).
```bash
npm run scan:all -- -d ./monorepo
```
**What it does:**
- Runs all 12 security rules
- Detects violations across all platforms
- Useful for monorepos with multiple technologies

**Perfect for:** Multi-platform projects

---

### 4. `npm run scan:json`
Outputs results in JSON format for CI/CD.
```bash
npm run scan:json -- -d ./backend > security-report.json
```
**What it does:**
- Generates machine-readable JSON
- Schema version 2.0.0
- Stable ordering for git diffs

**Perfect for:** CI/CD artifacts

---

### 5. `npm run scan:ci`
Outputs SARIF format for GitHub/GitLab Security tabs.
```bash
npm run scan:ci -- -d ./backend > results.sarif
```
**What it does:**
- Generates SARIF v2.1.0
- Compatible with GitHub Security tab
- Compatible with GitLab SAST reports

**Perfect for:** CI/CD integration

---

## Common Usage Patterns

### Development Workflow
```bash
# 1. See what the tool can do
npm run demo

# 2. Test on your project
npm run scan -- -d ./my-app

# 3. Fix violations, then re-scan
npm run scan -- -d ./my-app
```

### CI/CD Integration
```bash
# GitHub Actions - Console output
npm run scan -- -d . --profile all

# GitHub Actions - SARIF for Security tab
npm run scan:ci -- -d . > results.sarif

# GitLab CI - JSON for artifacts
npm run scan:json -- -d . > security-report.json
```

### Profile Selection
```bash
# Spring Boot projects
npm run scan -- -d ./backend --profile spring

# Node.js projects
npm run scan -- -d ./frontend --profile node

# .NET projects
npm run scan -- -d ./api --profile dotnet

# Monorepo with multiple platforms
npm run scan:all -- -d .
```

### Threshold Tuning
```bash
# Strict (block on HIGH or above)
npm run scan -- -d . --fail-on HIGH

# Very strict (block on MEDIUM or above)
npm run scan -- -d . --fail-on MEDIUM

# Only critical issues (block on CRITICAL only)
npm run scan -- -d . --fail-on CRITICAL
```

---

## Output Formats

### Console (Default)
```bash
npm run scan -- -d test-fixtures
```
Output:
```
━━━ Secure Guard Scan Report ━━━

STATUS: FAIL
Deploy blocked due to CRITICAL violations

Blocking Violations (4 rules, 8 total):
[CRITICAL] HIBERNATE_DDL_AUTO_UNSAFE (2 occurrences)
  → application.properties:5
    spring.jpa.hibernate.ddl-auto = create-drop
...
```

### JSON
```bash
npm run scan:json -- -d test-fixtures
```
Output:
```json
{
  "toolVersion": "1.0.0",
  "schemaVersion": "2.0.0",
  "status": "FAIL",
  "summary": { ... },
  "violations": [ ... ]
}
```

### SARIF
```bash
npm run scan:ci -- -d test-fixtures
```
Output:
```json
{
  "version": "2.1.0",
  "$schema": "https://...",
  "runs": [ ... ]
}
```

---

## Tips

### 🎯 See What's Wrong Quickly
```bash
npm run demo
```

### 🔍 Scan Your Project
```bash
npm run scan -- -d /path/to/your/project
```

### 🚀 CI/CD Ready
```bash
# In your GitHub Actions workflow
- run: npm run scan:ci -- -d . > results.sarif
```

### 🎨 Choose the Right Profile
- `--profile spring` → Spring Boot (default)
- `--profile node` → Node.js / Express / NestJS
- `--profile dotnet` → .NET / ASP.NET Core
- `--profile all` → All platforms (monorepo)

### ⚙️ Adjust Fail Threshold
- `--fail-on CRITICAL` → Only block on critical
- `--fail-on HIGH` → Block on high+ (default)
- `--fail-on MEDIUM` → Block on medium+
- `--fail-on LOW` → Block on low+
- `--fail-on INFO` → Block on everything

---

## Example Workflows

### First Time User
```bash
# 1. Clone the repo
git clone https://github.com/your-org/secure-guard.git
cd secure-guard

# 2. Install dependencies
npm install

# 3. See demo
npm run demo

# 4. Scan your project
npm run scan -- -d ~/my-project
```

### Developer Testing Locally
```bash
# Quick scan
npm run scan -- -d .

# Detailed scan with all profiles
npm run scan:all -- -d .

# JSON for parsing
npm run scan:json -- -d . | jq '.summary'
```

### CI/CD Pipeline
```yaml
# .github/workflows/security.yml
- name: Install
  run: npm install -g secure-guard

- name: Scan
  run: secure-guard scan --format sarif > results.sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

---

**Need more help?** See [README.md](./README.md) or [CI_INTEGRATION.md](./CI_INTEGRATION.md)

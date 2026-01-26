# ==============================================================================
# GitHub Actions CI/CD Checklist
# ==============================================================================
# Use this checklist before pushing to ensure CI will pass
# ==============================================================================

## ✅ Pre-Push Checklist

### Build & Test
- [ ] `npm run build` - TypeScript compilation successful
- [ ] `npm test` - All tests passing (68 tests)
- [ ] `npm run lint` - Linter passing (if configured)
- [ ] No `console.log` in production code (except parsers with console.warn)

### Files
- [ ] All new files added to git
- [ ] No sensitive data in commits (.env, secrets, API keys)
- [ ] package.json version updated (if releasing)
- [ ] CHANGELOG.md updated (if releasing)

### CI-Specific
- [ ] Node.js version in `.github/workflows/ci.yml` matches package.json engines
- [ ] Docker builds locally: `docker build -t secure-guard .`
- [ ] SARIF output valid: `node dist/cli/main.js scan --format sarif | jq .`
- [ ] Exit codes correct: Test with `--fail-on CRITICAL` and `--fail-on HIGH`

### Documentation
- [ ] README.md updated with new features
- [ ] CI_INTEGRATION.md reflects current CI setup
- [ ] Example code snippets tested

---

## 🚀 Quick CI Test Commands

```bash
# Full CI simulation
npm ci && npm test && npm run build

# SARIF validation
node dist/cli/main.js scan --format sarif | jq '.version'

# Exit code test
node dist/cli/main.js scan --fail-on HIGH; echo "Exit: $?"

# Docker build test
docker build -t secure-guard . && \
docker run --rm secure-guard scan --help
```

---

## 🎯 What CI Will Do

### 1. Test Job (ubuntu-latest, Node 20)
```yaml
✓ Checkout code
✓ Setup Node.js 20 with npm cache
✓ npm ci (clean install)
✓ npm run lint (if present)
✓ npm test (68 tests must pass)
✓ npm run build (TypeScript compile)
✓ Upload dist/ artifacts
```

### 2. Security Scan Job
```yaml
✓ Download dist/ from Test job
✓ Run Secure Guard with SARIF output
✓ Upload SARIF to GitHub Security tab
✓ Run Secure Guard with Console output
✓ Upload results as artifact
```

### 3. Docker Job (main branch only)
```yaml
✓ Build multi-stage Docker image
✓ Tag with :latest and :sha
✓ Push to ghcr.io (GitHub Container Registry)
✓ Use GitHub Actions cache
```

---

## Common CI Failures

### TypeScript Errors
```bash
# Symptom: tsc fails in CI
# Fix: Run locally first
npm run build
```

### Missing Dependencies
```bash
# Symptom: Module not found
# Fix: Ensure package.json is up to date
npm ci
```

### Test Failures
```bash
# Symptom: Jest fails
# Fix: Run tests locally
npm test -- --verbose
```

### Docker Build Failures
```bash
# Symptom: Docker build fails in CI
# Fix: Test locally
docker build --no-cache -t secure-guard .
```

### SARIF Invalid
```bash
# Symptom: SARIF upload fails
# Fix: Validate SARIF
node dist/cli/main.js scan --format sarif > test.sarif
jq . test.sarif  # Must be valid JSON
```

---

##  CI Configuration Files

- `.github/workflows/ci.yml` - Main CI pipeline
- `Dockerfile` - Multi-stage Docker build
- `.dockerignore` - Docker build exclusions
- `.npmignore` - NPM publish exclusions
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` - Test configuration

---

## 📊 CI Performance Tips

### Speed Up npm install
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  #  Already configured
```

### Speed Up Docker builds
```yaml
cache-from: type=gha  # ✅ Already configured
cache-to: type=gha,mode=max
```

### Parallel Jobs
```yaml
# Test and Docker can run in parallel after Test completes
needs: test  # Already configured
```

---

## 🎯 CI Success Criteria

All must pass:
- TypeScript compiles (no errors)
- Tests pass (68/68)
- Docker builds (<150MB)
- SARIF valid (uploadable to GitHub)
- Exit codes correct (0 or 1)

---

## Useful Commands

```bash
# Simulate full CI locally
npm ci && npm test && npm run build && \
docker build -t secure-guard . && \
docker run --rm secure-guard scan --help

# Check GitHub Actions syntax
gh workflow view ci

# Trigger CI manually
gh workflow run ci

# View CI status
gh run list

# Download CI artifacts
gh run download <run-id>
```

---

## Emergency: CI Failing?

1. **Check logs**: https://github.com/your-org/secure-guard/actions
2. **Run locally**: `npm ci && npm test && npm run build`
3. **Check file**: `.github/workflows/ci.yml` syntax
4. **Validate SARIF**: `jq . results.sarif`
5. **Test Docker**: `docker build --no-cache -t secure-guard .`

---

**Status**: CI is production-ready and fully configured

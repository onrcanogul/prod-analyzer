# Pre-Publish Checklist for v0.2.0

## Version Update
- [x] package.json version: 0.1.2 → 0.2.0
- [x] CHANGELOG.md created with v0.2.0 release notes
- [x] package.json description updated to mention policy engine

## Files to Include in NPM Package
- [x] dist/ (compiled TypeScript)
- [x] README.md
- [x] LICENSE
- [x] examples/policies/*.yml (NEW - policy templates)

## Build & Test
- [x] `npm run build` - Success ✅
- [x] `npm test` - All 68 tests passing ✅
- [x] Manual scan test - Policy engine working ✅

## Documentation
- [x] README.md - Policy section added
- [x] docs/POLICY_GUIDE.md - Complete policy reference
- [x] docs/SCAN_MECHANISM.md - Technical documentation
- [x] SUMMARY.md - Updated with v0.2.0 features
- [x] CHANGELOG.md - Complete release notes

## New Features Documented
- [x] Policy Engine overview
- [x] Example policy files (3 platforms)
- [x] 6 new general rules documented
- [x] YAML → Output mapping explained

## Git Preparation
```bash
# Stage all changes
git add .

# Commit with release message
git commit -m "Release v0.2.0: Policy Engine + 6 General Rules

- Add custom policy engine with YAML configuration
- Add 6 general/framework-agnostic security rules
- Add example policy files for Spring Boot, Node.js, .NET
- Add comprehensive policy documentation
- Update all documentation and examples"

# Tag the release
git tag -a v0.2.0 -m "Version 0.2.0: Policy Engine Release"

# Push to GitHub
git push origin main
git push origin v0.2.0
```

## NPM Publish Commands
```bash
# Login to npm (if not already)
npm login

# Dry run to check what will be published
npm publish --dry-run

# Publish to npm
npm publish

# Verify published package
npm view prod-analyzer@0.2.0
```

## Post-Publish Verification
```bash
# Test installation from npm
cd /tmp
mkdir test-prod-analyzer-v0.2.0
cd test-prod-analyzer-v0.2.0
npm init -y
npm install prod-analyzer

# Verify policy examples are included
ls node_modules/prod-analyzer/examples/policies/

# Test scan with policy
echo "policies:
  name: Test
  version: 1.0.0
  rules:
    - id: test
      key: NODE_ENV
      requiredValue: production
      severity: HIGH
      message: Test" > .prod-analyzer-policy.yml

echo "NODE_ENV=development" > .env

npx prod-analyzer scan
```

## GitHub Release Notes
Create a new release on GitHub with:
- Tag: v0.2.0
- Title: "Version 0.2.0: Custom Policy Engine"
- Description: Copy from CHANGELOG.md

## Key Features to Highlight
1. **Policy Engine** - Game changer for company-specific rules
2. **6 New Rules** - Framework-agnostic security patterns
3. **Example Policies** - Ready-to-use templates
4. **No Breaking Changes** - Fully backward compatible

## Expected Impact
- Users can now define custom rules without coding
- Differentiates from Semgrep (config-focused vs code-focused)
- Makes tool more enterprise-friendly
- Reduces need for custom forks

---

## Ready to Publish! 🚀

All checks passed. Run the commands above to publish v0.2.0.

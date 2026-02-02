# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-02

### 🎉 Major Release: Custom Policy Engine

**This release adds custom policy engine - making prod-analyzer the first config-focused security tool with YAML-based company policies.**

### Added

**Policy Engine**
- ✅ Define company-specific security rules in YAML (no coding required)
- ✅ Three enforcement types: forbidden values, required values, regex patterns
- ✅ Wildcard key matching (e.g., `logging.level.*`)
- ✅ Auto-discovery of `.prod-analyzer-policy.yml` files
- ✅ Policy violations shown with `[POLICY:rule-id]` prefix in output

**6 New General/Framework-Agnostic Rules** (21 → 27 total rules)
- `DEFAULT_PASSWORDS` (CRITICAL) - Detects common weak passwords (admin, password, root, etc.)
- `PRIVATE_KEY_IN_REPO` (CRITICAL) - Detects SSH/RSA private keys in config files
- `CLOUD_TOKEN_EXPOSURE` (CRITICAL) - Detects AWS, GitHub, Stripe, Google Cloud tokens
- `TLS_VERIFY_DISABLED` (CRITICAL) - Detects disabled certificate verification
- `ALLOW_INSECURE_HTTP` (HIGH) - Detects HTTP instead of HTTPS in URLs
- `PUBLIC_S3_BUCKET` (HIGH) - Detects public S3 bucket configurations

**Ready-to-Use Policy Templates**
- `examples/policies/spring-boot-production.policy.yml` - 9 production-ready Spring Boot rules
- `examples/policies/nodejs-production.policy.yml` - 13 production-ready Node.js rules
- `examples/policies/dotnet-production.policy.yml` - 8 production-ready .NET rules

**Enhanced Documentation**
- Conversion-focused README with "Why prod-analyzer?", "Try in 30 seconds", CI/CD examples
- `docs/POLICY_GUIDE.md` - Complete policy creation reference (40+ examples)
- `docs/RULES.md` - Comprehensive rule reference with real-world impact explanations
- `docs/SCAN_MECHANISM.md` - Technical deep dive into scan workflow
- Comparison table vs SonarQube/Snyk/Trivy/Semgrep

### Changed
- **README completely rewritten** for higher conversion and adoption
- Scan service now evaluates custom policies alongside built-in rules
- Console output groups policy violations by severity
- Enhanced violation reporting includes policy name context
- Removed Docker documentation (not yet supported)

### Technical
- Added `src/domain/models/policy.ts` - Policy data models with TypeScript strict mode
- Added `src/domain/policy-engine.ts` - Policy evaluation engine (interpreter pattern)
- Added `src/infrastructure/policy-loader.ts` - YAML policy parser with validation
- Policy violations merge seamlessly with built-in rule violations
- **27% increase in security coverage** (21 → 27 rules)

## [0.1.2] - 2026-01-20

### Changed
- Severity-grouped console output (CRITICAL → HIGH → MEDIUM → LOW)
- Enhanced console reporter with better violation grouping
- Removed emojis from README for professional appearance

### Fixed
- Console output formatting for better readability
- Violation sorting now respects severity hierarchy

## [0.1.1] - 2026-01-15

### Added
- Enhanced JSON reporter with structured output
- SARIF reporter for GitHub Security tab integration

### Fixed
- Exit code handling for CI/CD pipelines
- File discovery excludes `.git` and `node_modules` correctly

## [0.1.0] - 2026-01-10

### Added
- Initial release with 21 security rules
- Multi-platform support: Spring Boot, Node.js, .NET
- Profile-based scanning (`--profile spring|node|dotnet|all`)
- Three output formats: console, JSON, SARIF
- Docker support
- CI/CD integration examples (GitHub Actions, GitLab CI, Jenkins)
- Comprehensive documentation

### Security Rules
- **Spring Boot** (9 rules): Profile detection, logging, Actuator, DDL auto, CSRF
- **Node.js** (7 rules): NODE_ENV, debug mode, secrets, CORS, JWT, rate limiting
- **.NET** (5 rules): Environment, exception pages, HTTPS, connection strings

[0.2.0]: https://github.com/onrcanogul/prod-analyzer/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/onrcanogul/prod-analyzer/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/onrcanogul/prod-analyzer/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/onrcanogul/prod-analyzer/releases/tag/v0.1.0

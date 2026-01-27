# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-28

### Added
- **Policy Engine**: User-defined YAML policies for company-specific security rules
  - Support for forbidden values, required values, and regex patterns
  - Wildcard key matching (e.g., `logging.level.*`)
  - Auto-discovery of `.prod-analyzer-policy.yml` files
  - Policy violations shown with `[POLICY:rule-id]` prefix
- **6 New General/Framework-Agnostic Rules**:
  - `DEFAULT_PASSWORDS` - Detects common weak passwords
  - `PRIVATE_KEY_IN_REPO` - Detects SSH/RSA private keys
  - `CLOUD_TOKEN_EXPOSURE` - Detects AWS, GitHub, Stripe, Google Cloud tokens
  - `TLS_VERIFY_DISABLED` - Detects disabled certificate verification
  - `ALLOW_INSECURE_HTTP` - Detects HTTP instead of HTTPS
  - `PUBLIC_S3_BUCKET` - Detects public S3 bucket configurations
- **Example Policy Files**:
  - `examples/policies/spring-boot-production.policy.yml` - 9 Spring Boot rules
  - `examples/policies/nodejs-production.policy.yml` - 13 Node.js rules
  - `examples/policies/dotnet-production.policy.yml` - 8 .NET rules
- **Documentation**:
  - `docs/POLICY_GUIDE.md` - Complete policy creation reference
  - `docs/SCAN_MECHANISM.md` - Technical deep dive into scan workflow
  - Updated `SUMMARY.md` with policy engine details

### Changed
- Scan service now loads and evaluates custom policies alongside built-in rules
- Console output now shows policy violations grouped by severity
- Enhanced violation reporting with policy name context

### Technical
- Added `src/domain/models/policy.ts` - Policy data models
- Added `src/domain/policy-engine.ts` - Policy evaluation engine
- Added `src/infrastructure/policy-loader.ts` - YAML policy parser
- Total rules increased from 21 to 27 (27% increase in coverage)

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

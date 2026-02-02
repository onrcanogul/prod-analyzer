# Security Rules Reference

Complete reference for all 27 built-in security rules in prod-analyzer.

---

## Table of Contents

- [Spring Boot Rules (9)](#spring-boot-rules)
- [Node.js Rules (7)](#nodejs-rules)
- [.NET Rules (5)](#net-rules)
- [General Rules (6)](#general-rules)

---

## Spring Boot Rules

### 1. SPRING_PROFILE_DEV_ACTIVE
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
Development or test profiles active in production configuration.

**Triggers:**
```properties
spring.profiles.active = dev
spring.profiles.active = development
spring.profiles.active = test
spring.profiles.active = local
```

**Why it matters:**
Development profiles often enable:
- Debug endpoints
- Verbose logging that exposes secrets
- Relaxed security settings
- In-memory databases instead of production databases

**Fix:**
```properties
# ✅ Correct
spring.profiles.active = prod

# ❌ Wrong
spring.profiles.active = dev
```

---

### 2. DEBUG_LOGGING_ENABLED
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
DEBUG or TRACE logging levels in production.

**Triggers:**
```properties
logging.level.root = DEBUG
logging.level.root = TRACE
logging.level.com.myapp = DEBUG
```

**Why it matters:**
- Exposes sensitive data in logs (passwords, tokens, PII)
- Fills disk space rapidly
- Performance degradation
- Compliance violations (GDPR, PCI-DSS)

**Fix:**
```properties
# ✅ Correct
logging.level.root = INFO
logging.level.org.springframework = WARN

# ❌ Wrong
logging.level.root = DEBUG
```

---

### 3. ACTUATOR_ENDPOINTS_EXPOSED
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
All Spring Boot Actuator endpoints exposed via wildcard.

**Triggers:**
```properties
management.endpoints.web.exposure.include = *
```

**Why it matters:**
Exposes sensitive operational data:
- `/actuator/env` - Environment variables (including secrets)
- `/actuator/heapdump` - Heap dump with sensitive data
- `/actuator/threaddump` - Thread states
- `/actuator/beans` - Spring bean configuration

**Fix:**
```properties
# ✅ Correct - Only expose safe endpoints
management.endpoints.web.exposure.include = health,info,metrics

# ❌ Wrong
management.endpoints.web.exposure.include = *
```

---

### 4. HEALTH_DETAILS_EXPOSED
**Severity:** MEDIUM  
**Platform:** Spring Boot

**What it detects:**
Health endpoint details always visible.

**Triggers:**
```properties
management.endpoint.health.show-details = always
```

**Why it matters:**
Reveals internal architecture:
- Database connection details
- Service dependencies
- Infrastructure topology

**Fix:**
```properties
# ✅ Correct
management.endpoint.health.show-details = when-authorized

# ❌ Wrong
management.endpoint.health.show-details = always
```

---

### 5. HIBERNATE_DDL_AUTO_UNSAFE
**Severity:** CRITICAL  
**Platform:** Spring Boot

**What it detects:**
Hibernate DDL auto schema operations.

**Triggers:**
```properties
spring.jpa.hibernate.ddl-auto = create
spring.jpa.hibernate.ddl-auto = create-drop
spring.jpa.hibernate.ddl-auto = update
```

**Why it matters:**
- `create-drop` WILL delete all data on restart
- `update` may cause schema inconsistencies
- No rollback mechanism
- Potential data loss

**Fix:**
```properties
# ✅ Correct
spring.jpa.hibernate.ddl-auto = validate
spring.jpa.hibernate.ddl-auto = none

# Use Flyway or Liquibase for schema changes

# ❌ Wrong
spring.jpa.hibernate.ddl-auto = create-drop
```

---

### 6. CSRF_DISABLED
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
CSRF protection disabled.

**Triggers:**
```properties
security.csrf.enabled = false
spring.security.csrf.enabled = false
```

**Why it matters:**
Leaves application vulnerable to Cross-Site Request Forgery attacks.

**Fix:**
```properties
# ✅ Correct - Enable CSRF (default)
# Remove the csrf.enabled property

# ❌ Wrong
security.csrf.enabled = false
```

---

### 7. EXPOSED_STACK_TRACE
**Severity:** MEDIUM  
**Platform:** Spring Boot

**What it detects:**
Stack traces exposed in error responses.

**Triggers:**
```properties
server.error.include-stacktrace = always
server.error.include-stacktrace = on-param
```

**Why it matters:**
Reveals:
- Internal file paths
- Framework versions
- Application structure

**Fix:**
```properties
# ✅ Correct
server.error.include-stacktrace = never

# ❌ Wrong
server.error.include-stacktrace = always
```

---

### 8. REQUIRE_HTTPS_DISABLED
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
HTTPS enforcement disabled.

**Triggers:**
```properties
server.ssl.enabled = false
security.require-ssl = false
```

**Why it matters:**
Allows unencrypted HTTP traffic, enabling:
- Man-in-the-middle attacks
- Credential interception
- Data tampering

**Fix:**
```properties
# ✅ Correct
server.ssl.enabled = true
security.require-ssl = true

# ❌ Wrong
server.ssl.enabled = false
```

---

### 9. CONNECTION_STRING_EXPOSURE
**Severity:** HIGH  
**Platform:** Spring Boot

**What it detects:**
Database passwords in plaintext connection strings.

**Triggers:**
```properties
spring.datasource.url = jdbc:mysql://localhost/db?password=admin123
```

**Why it matters:**
Database credentials should never be in plaintext configuration files.

**Fix:**
```properties
# ✅ Correct - Use environment variables
spring.datasource.url = jdbc:mysql://localhost/db
spring.datasource.password = ${DB_PASSWORD}

# ❌ Wrong
spring.datasource.url = jdbc:mysql://localhost/db?password=admin123
```

---

## Node.js Rules

### 10. NODE_ENV_NOT_PRODUCTION
**Severity:** HIGH  
**Platform:** Node.js

**What it detects:**
NODE_ENV not set to 'production'.

**Triggers:**
```bash
NODE_ENV=development
NODE_ENV=dev
NODE_ENV=test
NODE_ENV=local
```

**Why it matters:**
- Disables production optimizations
- Enables stack traces in responses
- Performance degradation
- Security middleware may be disabled

**Fix:**
```bash
# ✅ Correct
NODE_ENV=production

# ❌ Wrong
NODE_ENV=development
```

---

### 11. NODEJS_DEBUG_ENABLED
**Severity:** MEDIUM  
**Platform:** Node.js

**What it detects:**
Debug mode enabled.

**Triggers:**
```bash
DEBUG=*
LOG_LEVEL=debug
LOG_LEVEL=trace
NODE_DEBUG=*
```

**Why it matters:**
- Exposes internal application state
- Performance impact
- May leak sensitive data

**Fix:**
```bash
# ✅ Correct
DEBUG=
LOG_LEVEL=info

# ❌ Wrong
DEBUG=*
```

---

### 12. EXPOSED_SECRETS
**Severity:** CRITICAL  
**Platform:** Node.js

**What it detects:**
Weak or placeholder secrets.

**Triggers:**
```bash
JWT_SECRET=secret
API_KEY=test123
DB_PASSWORD=admin
SESSION_SECRET=changeme
```

**Why it matters:**
- Weak secrets are brute-forceable
- Common placeholders are in attacker wordlists
- Complete authentication bypass possible

**Fix:**
```bash
# ✅ Correct - Strong random secrets
JWT_SECRET=a8f3j2k9d0s8a7f6g5h4j3k2l1m0n9o8p7q6r5s4t3u2v1w0x9y8z7
DB_PASSWORD=Y8$mK2#pL9@qR4&nT7

# ❌ Wrong
JWT_SECRET=secret
```

---

### 13. CORS_WILDCARD_ORIGIN
**Severity:** HIGH  
**Platform:** Node.js

**What it detects:**
CORS configured to allow any origin.

**Triggers:**
```bash
CORS_ORIGIN=*
ALLOWED_ORIGINS=*
```

**Why it matters:**
Allows any website to make requests to your API:
- CSRF attacks
- Data exfiltration
- Unauthorized API access

**Fix:**
```bash
# ✅ Correct
CORS_ORIGIN=https://app.mycompany.com

# ❌ Wrong
CORS_ORIGIN=*
```

---

### 14. HELMET_DISABLED
**Severity:** MEDIUM  
**Platform:** Node.js

**What it detects:**
Helmet security middleware disabled.

**Triggers:**
```bash
HELMET_ENABLED=false
USE_HELMET=false
```

**Why it matters:**
Missing security headers:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Content-Security-Policy

**Fix:**
```bash
# ✅ Correct
HELMET_ENABLED=true

# ❌ Wrong
HELMET_ENABLED=false
```

---

### 15. JWT_WEAK_SECRET
**Severity:** CRITICAL  
**Platform:** Node.js

**What it detects:**
JWT secrets shorter than 32 characters.

**Triggers:**
```bash
JWT_SECRET=short
JWT_SECRET=mysecret123
```

**Why it matters:**
Short JWT secrets can be:
- Brute-forced
- Dictionary attacked
- Leading to forged authentication tokens

**Fix:**
```bash
# ✅ Correct - Minimum 32 characters
JWT_SECRET=a8f3j2k9d0s8a7f6g5h4j3k2l1m0n9o8p7q6r5s4t3u2v1w0

# ❌ Wrong
JWT_SECRET=mysecret
```

---

### 16. RATE_LIMIT_DISABLED
**Severity:** MEDIUM  
**Platform:** Node.js

**What it detects:**
Rate limiting disabled.

**Triggers:**
```bash
RATE_LIMIT_ENABLED=false
ENABLE_RATE_LIMIT=false
```

**Why it matters:**
Enables:
- Brute force attacks
- Denial of Service
- API abuse

**Fix:**
```bash
# ✅ Correct
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# ❌ Wrong
RATE_LIMIT_ENABLED=false
```

---

## .NET Rules

### 17. ASPNETCORE_ENVIRONMENT_DEVELOPMENT
**Severity:** HIGH  
**Platform:** .NET

**What it detects:**
Development environment in production.

**Triggers:**
```json
{
  "ASPNETCORE_ENVIRONMENT": "Development",
  "ASPNETCORE_ENVIRONMENT": "Staging",
  "ASPNETCORE_ENVIRONMENT": "Test"
}
```

**Why it matters:**
- Developer exception pages enabled
- Detailed error messages
- Debug features active

**Fix:**
```json
{
  "ASPNETCORE_ENVIRONMENT": "Production"
}
```

---

### 18. DEVELOPER_EXCEPTION_PAGE
**Severity:** HIGH  
**Platform:** .NET

**What it detects:**
Developer exception page enabled.

**Triggers:**
```json
{
  "UseDeveloperExceptionPage": true,
  "DetailedErrors": true
}
```

**Why it matters:**
Exposes:
- Full stack traces
- Source code snippets
- Environment variables
- Request details

**Fix:**
```json
{
  "UseDeveloperExceptionPage": false,
  "DetailedErrors": false
}
```

---

### 19. REQUIRE_HTTPS_DISABLED
**Severity:** HIGH  
**Platform:** .NET

**What it detects:**
HTTPS enforcement disabled.

**Triggers:**
```json
{
  "RequireHttpsMetadata": false,
  "UseHsts": false
}
```

**Why it matters:**
Allows unencrypted HTTP traffic.

**Fix:**
```json
{
  "RequireHttpsMetadata": true,
  "UseHsts": true
}
```

---

### 20. CONNECTION_STRING_EXPOSURE
**Severity:** HIGH  
**Platform:** .NET

**What it detects:**
Connection strings with plaintext credentials.

**Triggers:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=db;User=sa;Password=Admin123;"
  }
}
```

**Why it matters:**
Database credentials should use:
- Environment variables
- Azure Key Vault
- Managed identities

**Fix:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=db;Integrated Security=true;"
  }
}
```

---

### 21. DETAILED_ERRORS_ENABLED
**Severity:** MEDIUM  
**Platform:** .NET

**What it detects:**
Detailed error messages enabled.

**Triggers:**
```json
{
  "DetailedErrors": true
}
```

**Why it matters:**
Exposes internal application details in error responses.

**Fix:**
```json
{
  "DetailedErrors": false
}
```

---

## General Rules

### 22. DEFAULT_PASSWORDS
**Severity:** CRITICAL  
**Platform:** All

**What it detects:**
Common weak passwords.

**Triggers:**
```bash
DB_PASSWORD=admin
DB_PASSWORD=password
DB_PASSWORD=root
DB_PASSWORD=changeme
DB_PASSWORD=123456
API_KEY=test123
```

**Why it matters:**
Default/weak passwords are:
- In every attacker's wordlist
- Brute-forceable in seconds
- Common in breached credential databases

**Fix:**
Use strong, random passwords (minimum 16 characters).

---

### 23. PRIVATE_KEY_IN_REPO
**Severity:** CRITICAL  
**Platform:** All

**What it detects:**
Private keys in configuration files.

**Triggers:**
```bash
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
SSL_KEY=-----BEGIN PRIVATE KEY-----
API_SECRET_KEY=sk_live_...
```

**Why it matters:**
- Private keys in repos are compromised
- Can't be rotated easily
- Git history preserves them forever

**Fix:**
Use secrets management:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Environment variables

---

### 24. CLOUD_TOKEN_EXPOSURE
**Severity:** CRITICAL  
**Platform:** All

**What it detects:**
Cloud provider tokens and API keys.

**Triggers:**
```bash
AWS_ACCESS_KEY_ID=AKIA...
GITHUB_TOKEN=ghp_...
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_API_KEY=AIza...
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https...
```

**Why it matters:**
One exposed AWS key can result in:
- $50,000+ cryptomining bills
- Data exfiltration
- Resource deletion
- Compliance violations

**Fix:**
- Use IAM roles
- Rotate immediately if exposed
- Enable credential scanning in CI

---

### 25. TLS_VERIFY_DISABLED
**Severity:** CRITICAL  
**Platform:** All

**What it detects:**
TLS certificate verification disabled.

**Triggers:**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
SSL_VERIFY=false
INSECURE_SKIP_VERIFY=true
```

**Why it matters:**
Disabling TLS verification:
- Allows man-in-the-middle attacks
- Defeats purpose of HTTPS
- Data can be intercepted and modified

**Fix:**
```bash
# ✅ Correct - Never disable TLS verification
NODE_TLS_REJECT_UNAUTHORIZED=1
SSL_VERIFY=true

# For self-signed certs, add them to trust store
```

---

### 26. ALLOW_INSECURE_HTTP
**Severity:** HIGH  
**Platform:** All

**What it detects:**
HTTP instead of HTTPS in URLs.

**Triggers:**
```bash
API_URL=http://api.example.com
WEBHOOK_URL=http://webhook.example.com
ALLOW_HTTP=true
```

**Why it matters:**
HTTP traffic can be:
- Intercepted
- Modified
- Replayed

**Fix:**
```bash
# ✅ Correct
API_URL=https://api.example.com
ALLOW_HTTP=false

# ❌ Wrong
API_URL=http://api.example.com
```

---

### 27. PUBLIC_S3_BUCKET
**Severity:** HIGH  
**Platform:** All

**What it detects:**
S3 buckets configured for public access.

**Triggers:**
```bash
S3_BUCKET_ACL=public-read
S3_BLOCK_PUBLIC_ACLS=false
S3_PUBLIC_ACCESS=true
```

**Why it matters:**
Public S3 buckets:
- Expose sensitive data
- Appear in search engines
- Violate compliance requirements

**Fix:**
```bash
# ✅ Correct
S3_BUCKET_ACL=private
S3_BLOCK_PUBLIC_ACLS=true

# Use CloudFront + OAI for public content
```

---

## Rule Statistics

| Platform | Total Rules | CRITICAL | HIGH | MEDIUM |
|----------|-------------|----------|------|--------|
| **Spring Boot** | 9 | 1 | 6 | 2 |
| **Node.js** | 7 | 3 | 2 | 2 |
| **.NET** | 5 | 0 | 3 | 2 |
| **General** | 6 | 4 | 2 | 0 |
| **TOTAL** | **27** | **8** | **13** | **6** |

---

## False Positives

If you encounter false positives, you can:

1. **Use custom policies** to override behavior
2. **Report the issue** on GitHub
3. **Contribute a fix** to improve the rule

See [Contributing Guide](../CONTRIBUTING.md) for details.

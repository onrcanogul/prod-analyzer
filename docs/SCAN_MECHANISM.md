# Scan Mechanism - Technical Deep Dive

This document explains the complete scanning workflow of prod-analyzer, from file discovery to violation reporting.

## Table of Contents

1. [Overview](#overview)
2. [Step-by-Step Workflow](#step-by-step-workflow)
3. [File Discovery](#file-discovery)
4. [Configuration Parsing](#configuration-parsing)
5. [Rule Execution](#rule-execution)
6. [Policy Engine](#policy-engine)
7. [Violation Reporting](#violation-reporting)
8. [Architecture Diagram](#architecture-diagram)

---

## Overview

The scan mechanism follows a **6-step pipeline**:

```
User Command → File Discovery → Parsing → Rule Execution → Policy Evaluation → Reporting
```

**Key Design Principles:**
- **Separation of Concerns**: Each step is handled by a dedicated layer
- **Extensibility**: New file formats and rules can be added without changing the core logic
- **Performance**: Parallel processing where possible, fail-fast on errors
- **Type Safety**: TypeScript ensures type correctness throughout the pipeline

---

## Step-by-Step Workflow

### Step 1: File Discovery

**Location:** `src/infrastructure/file-system/file-discovery.ts`

**Purpose:** Recursively discover all configuration files in the target directory.

**Process:**

1. **Start from target directory** (e.g., `test-fixtures/`)
2. **Recursively traverse** all subdirectories
3. **Match file patterns** against known configuration file types
4. **Exclude** specific directories (`.git/`, `node_modules/`, `dist/`, etc.)
5. **Determine file format** based on filename patterns

**Supported File Patterns:**

| Format | Patterns | Examples |
|--------|----------|----------|
| **YAML** | `*.yml`, `*.yaml` | `application.yml`, `.gitlab-ci.yml` |
| **Properties** | `*.properties` | `application.properties` |
| **JSON** | `appsettings.json`, `package.json` | `appsettings.json` |
| **ENV** | `.env*` | `.env`, `.env.production` |

**Code Example:**
```typescript
// File pattern matching
const CONFIG_FILE_PATTERNS = {
  yml: /\.(yml|yaml)$/i,
  properties: /\.properties$/i,
  json: /(appsettings|package)\.json$/i,
  env: /^\.env(\..+)?$/i,
};

// Excluded directories
const EXCLUDED_DIRS = ['.git', 'node_modules', 'dist', 'build', 'target'];
```

**Output:**
```typescript
[
  { filePath: "/path/application.properties", format: "PROPERTIES" },
  { filePath: "/path/application.yml", format: "YAML" },
  { filePath: "/path/.env", format: "ENV" },
  { filePath: "/path/appsettings.json", format: "JSON" }
]
```

---

### Step 2: Configuration Parsing

**Location:** `src/infrastructure/parsers/`

**Purpose:** Parse each configuration file into a normalized `ConfigEntry[]` format.

**Process:**

1. **Read file content** from disk
2. **Route to appropriate parser** based on file format
3. **Parse content** into key-value pairs
4. **Normalize keys** to dot notation (e.g., `NODE_ENV` → `node.env`)
5. **Flatten nested structures** (YAML/JSON)
6. **Preserve metadata** (file path, line numbers)

---

#### Parser: Properties Files

**Location:** `src/infrastructure/parsers/properties-parser.ts`

**Input:**
```properties
# application.properties
spring.profiles.active=test
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.root=TRACE
```

**Processing:**
1. Split by newlines
2. Ignore comments (`#` or `!`)
3. Parse `key=value` pairs
4. Trim whitespace

**Output:**
```typescript
[
  {
    key: "spring.profiles.active",
    value: "test",
    sourceFile: "/path/application.properties",
    lineNumber: 2
  },
  {
    key: "spring.jpa.hibernate.ddl-auto",
    value: "create-drop",
    sourceFile: "/path/application.properties",
    lineNumber: 3
  }
]
```

---

#### Parser: YAML Files

**Location:** `src/infrastructure/parsers/yaml-parser.ts`

**Input:**
```yaml
# application.yml
spring:
  profiles:
    active: dev
  jpa:
    hibernate:
      ddl-auto: update
```

**Processing:**
1. Parse YAML using `js-yaml` library
2. **Flatten nested structure** to dot notation
3. Track line numbers (if available from YAML parser)

**Flattening Algorithm:**
```typescript
// Nested object
{
  spring: {
    profiles: {
      active: "dev"
    }
  }
}

// Flattened to
{
  "spring.profiles.active": "dev"
}
```

**Output:**
```typescript
[
  {
    key: "spring.profiles.active",
    value: "dev",
    sourceFile: "/path/application.yml",
    lineNumber: 3
  },
  {
    key: "spring.jpa.hibernate.ddl-auto",
    value: "update",
    sourceFile: "/path/application.yml",
    lineNumber: 6
  }
]
```

---

#### Parser: ENV Files

**Location:** `src/infrastructure/parsers/env-parser.ts`

**Input:**
```bash
# .env
NODE_ENV=development
DB_PASSWORD=admin
JWT_SECRET=changeme
API_URL=http://api.example.com
```

**Processing:**
1. Parse `KEY=VALUE` pairs
2. **Normalize UPPER_SNAKE_CASE to dot.notation**
   - `NODE_ENV` → `node.env`
   - `DB_PASSWORD` → `db.password`
   - `JWT_SECRET` → `jwt.secret`
3. Handle quoted values (`"value"`, `'value'`)
4. Support multiline values

**Normalization Rules:**
```typescript
// UPPER_SNAKE_CASE → dot.notation
NODE_ENV          → node.env
DB_PASSWORD       → db.password
ASPNETCORE_ENVIRONMENT → aspnetcore.environment

// Special handling for common prefixes
AWS_ACCESS_KEY_ID → aws.access.key.id
```

**Output:**
```typescript
[
  {
    key: "node.env",
    value: "development",
    sourceFile: "/path/.env",
    lineNumber: 1
  },
  {
    key: "db.password",
    value: "admin",
    sourceFile: "/path/.env",
    lineNumber: 2
  }
]
```

---

#### Parser: JSON Files

**Location:** `src/infrastructure/parsers/json-parser.ts`

**Input:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;..."
  }
}
```

**Processing:**
1. Parse JSON using `JSON.parse()`
2. Flatten nested objects to dot notation
3. Preserve case sensitivity (important for .NET)

**Output:**
```typescript
[
  {
    key: "Logging.LogLevel.Default",
    value: "Debug",
    sourceFile: "/path/appsettings.json",
    lineNumber: 4
  },
  {
    key: "ConnectionStrings.DefaultConnection",
    value: "Server=localhost;...",
    sourceFile: "/path/appsettings.json",
    lineNumber: 8
  }
]
```

---

### Step 3: Rule Execution

**Location:** `src/application/services/rule-engine.ts`

**Purpose:** Execute all applicable rules against parsed configuration entries.

**Process:**

1. **Create Rule Registry** based on selected profile
2. **Filter rules** by platform (Spring/Node.js/.NET/General)
3. **Execute each rule** against matching entries
4. **Collect violations** from all rules

---

#### Profile-Based Filtering

```typescript
// User command: --profile spring
// Only execute rules where:
// 1. platforms is undefined (general rules)
// 2. platforms includes Platform.SPRING

const springRules = ALL_RULES.filter(rule => 
  !rule.platforms || rule.platforms.includes(Platform.SPRING)
);

// Result: 9 Spring rules + 6 General rules = 15 rules executed
```

---

#### Rule Execution Algorithm

```typescript
function executeRules(entries: ConfigEntry[], rules: Rule[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const entry of entries) {
    for (const rule of rules) {
      // Step 1: Check if rule applies to this entry
      if (!ruleAppliesTo(rule, entry)) continue;
      
      // Step 2: Execute rule logic
      const ruleViolations = rule.evaluate(entry);
      
      // Step 3: Collect violations
      violations.push(...ruleViolations);
    }
  }
  
  return violations;
}
```

**Key Matching Logic:**

```typescript
function ruleAppliesTo(rule: Rule, entry: ConfigEntry): boolean {
  // Check if entry key matches any of the rule's target keys
  for (const targetKey of rule.targetKeys) {
    if (targetKey === '*') return true; // Wildcard: match all
    if (entry.key === targetKey) return true; // Exact match
    if (targetKey.endsWith('.*')) {
      // Prefix match: "logging.level.*" matches "logging.level.root"
      const prefix = targetKey.slice(0, -2);
      if (entry.key.startsWith(prefix + '.')) return true;
    }
  }
  return false;
}
```

---

#### Example Rule Execution

**Rule:** `SPRING_PROFILE_DEV_ACTIVE`

```typescript
{
  id: 'SPRING_PROFILE_DEV_ACTIVE',
  targetKeys: ['spring.profiles.active'],
  platforms: [Platform.SPRING],
  
  evaluate(entry: ConfigEntry): Violation[] {
    const devProfiles = ['dev', 'development', 'test', 'local'];
    
    if (devProfiles.includes(entry.value.toLowerCase())) {
      return [createViolation({
        ruleId: this.id,
        severity: Severity.HIGH,
        message: `Non-production profile "${entry.value}" is active`,
        filePath: entry.sourceFile,
        configKey: entry.key,
        configValue: entry.value,
        lineNumber: entry.lineNumber,
      })];
    }
    
    return [];
  }
}
```

**Entry:**
```typescript
{
  key: "spring.profiles.active",
  value: "test",
  sourceFile: "/path/application.properties",
  lineNumber: 4
}
```

**Execution:**
1. ✅ Key matches: `spring.profiles.active` === `spring.profiles.active`
2. ✅ Value is in forbidden list: `test` ∈ `['dev', 'development', 'test', 'local']`
3. ❌ **VIOLATION CREATED**

**Output:**
```typescript
{
  ruleId: "SPRING_PROFILE_DEV_ACTIVE",
  severity: "HIGH",
  message: 'Non-production profile "test" is active',
  filePath: "/path/application.properties",
  configKey: "spring.profiles.active",
  configValue: "test",
  lineNumber: 4,
  suggestion: "Remove or change to a production profile"
}
```

---

### Step 4: Policy Engine

**Location:** `src/domain/policy-engine.ts`

**Purpose:** Evaluate user-defined custom policies against configuration entries.

**Process:**

1. **Discover policy file** (`.prod-analyzer-policy.yml` in scan directory)
2. **Load and parse** policy YAML
3. **Validate policy structure** (required fields, rule syntax)
4. **Execute policy rules** against all entries
5. **Convert to standard violations** with `POLICY:` prefix

---

#### Policy File Discovery

**Location:** `src/infrastructure/policy-loader.ts`

**Default filenames searched:**
```typescript
const POLICY_FILE_NAMES = [
  '.prod-analyzer-policy.yml',
  '.prod-analyzer-policy.yaml',
  'prod-analyzer-policy.yml',
  'prod-analyzer-policy.yaml',
];
```

**Discovery process:**
```typescript
// Look in scan directory
for (const fileName of POLICY_FILE_NAMES) {
  const filePath = `${scanDirectory}/${fileName}`;
  if (fileExists(filePath)) {
    console.log(`📋 Loading custom policy from ${fileName}`);
    return await loadPolicyFromFile(filePath);
  }
}
```

---

#### Policy File Structure

```yaml
policies:
  name: "Company Production Policy"
  version: "1.0.0"
  description: "Enforces production standards"
  
  metadata:  # Optional
    owner: "Platform Team"
    contact: "platform@company.com"
  
  rules:
    - id: "unique-rule-id"
      description: "What this rule checks"
      key: "config.key.path"
      
      # Enforcement type (at least one required):
      forbiddenValues: ["bad1", "bad2"]  # Block these values
      requiredValue: "expected"          # Enforce this value
      forbiddenPattern: "^regex$"        # Block regex matches
      
      # Required fields:
      severity: CRITICAL  # CRITICAL, HIGH, MEDIUM, LOW
      message: "Error message shown to user"
      
      # Optional fields:
      suggestion: "How to fix this issue"
      caseInsensitive: true  # Default: true
```

---

#### Policy Rule Evaluation

**Three enforcement types:**

##### 1. Forbidden Values

```yaml
- id: "no-ddl-create"
  key: "spring.jpa.hibernate.ddl-auto"
  forbiddenValues:
    - "create"
    - "create-drop"
    - "update"
  severity: CRITICAL
  message: "DDL auto operations are forbidden"
```

**Evaluation Logic:**
```typescript
if (rule.forbiddenValues) {
  const normalizedValue = normalizeValue(entry.value, rule.caseInsensitive);
  const forbiddenSet = rule.forbiddenValues.map(v => 
    normalizeValue(v, rule.caseInsensitive)
  );
  
  if (forbiddenSet.includes(normalizedValue)) {
    return createPolicyViolation({
      policyId: policyName,
      ruleId: rule.id,
      severity: rule.severity,
      message: rule.message,
      // ... other fields
    });
  }
}
```

---

##### 2. Required Value

```yaml
- id: "require-prod-profile"
  key: "spring.profiles.active"
  requiredValue: "prod"
  severity: HIGH
  message: "Production profile is required"
```

**Evaluation Logic:**
```typescript
if (rule.requiredValue) {
  const normalizedActual = normalizeValue(entry.value, rule.caseInsensitive);
  const normalizedExpected = normalizeValue(rule.requiredValue, rule.caseInsensitive);
  
  if (normalizedActual !== normalizedExpected) {
    return createPolicyViolation({
      message: `${rule.message} (expected: ${rule.requiredValue}, found: ${entry.value})`,
      // ... other fields
    });
  }
}
```

---

##### 3. Forbidden Pattern (Regex)

```yaml
- id: "no-http-urls"
  key: "API_URL"
  forbiddenPattern: "^http://.*"
  severity: HIGH
  message: "API URLs must use HTTPS"
```

**Evaluation Logic:**
```typescript
if (rule.forbiddenPattern) {
  const regex = new RegExp(rule.forbiddenPattern, 
    rule.caseInsensitive ? 'i' : ''
  );
  
  if (regex.test(entry.value)) {
    return createPolicyViolation({
      message: rule.message,
      // ... other fields
    });
  }
}
```

---

#### Wildcard Key Matching

**Policy rule:**
```yaml
- id: "no-debug-logging"
  key: "logging.level.*"
  forbiddenValues: ["DEBUG", "TRACE"]
```

**Matching algorithm:**
```typescript
function matchesKeyPattern(key: string, pattern: string): boolean {
  if (pattern === '*') return true; // Match all
  if (pattern === key) return true; // Exact match
  
  if (pattern.endsWith('.*')) {
    // Wildcard pattern: "logging.level.*"
    const prefix = pattern.slice(0, -2); // "logging.level"
    return key.startsWith(prefix + '.');
  }
  
  return false;
}
```

**Matches:**
- ✅ `logging.level.root`
- ✅ `logging.level.com.myapp`
- ✅ `logging.level.org.springframework.web`
- ❌ `logging.file.name` (different prefix)

---

#### Policy Violation Output

**Policy violations are prefixed with `POLICY:`:**

```
[CRITICAL] POLICY:no-ddl-create (1 occurrence)
  → application.properties:5
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: [Company Production Policy] DDL auto operations are forbidden
  Fix:   Use 'validate' or 'none'
```

**This helps distinguish:**
- Built-in rules: `HIBERNATE_DDL_AUTO_UNSAFE`
- Policy rules: `POLICY:no-ddl-create`

---

### Step 5: Violation Merging

**Location:** `src/application/services/scan-service.ts`

**Purpose:** Combine violations from built-in rules and custom policies.

**Process:**

```typescript
// Execute built-in rules
const ruleViolations = executeRules(entries, ruleRegistry);

// Execute custom policies (if present)
let policyViolations: Violation[] = [];
const policy = await findAndLoadPolicy(scanDirectory);
if (policy) {
  const policyResults = evaluatePolicy(policy, entries);
  policyViolations = mergePolicyViolations(policyResults);
}

// Merge all violations
const allViolations = [...ruleViolations, ...policyViolations];
```

**Example result:**
- Built-in violations: 33
- Policy violations: 2
- **Total: 35 violations**

---

### Step 6: Violation Reporting

**Location:** `src/reporting/reporters/`

**Purpose:** Format and display violations in the requested output format.

---

#### Severity Grouping (Console Output)

**Location:** `src/reporting/reporters/enhanced-console-reporter.ts`

**Process:**

1. **Group violations by severity:**
   ```typescript
   const grouped = {
     CRITICAL: violations.filter(v => v.severity === Severity.CRITICAL),
     HIGH: violations.filter(v => v.severity === Severity.HIGH),
     MEDIUM: violations.filter(v => v.severity === Severity.MEDIUM),
     LOW: violations.filter(v => v.severity === Severity.LOW),
   };
   ```

2. **Display in order:** CRITICAL → HIGH → MEDIUM → LOW

3. **Group by rule ID** within each severity:
   ```
   [CRITICAL] CLOUD_TOKEN_EXPOSURE (3 occurrences)
     → file1.env:9
     → file2.env:16
     → file3.env:32
   ```

---

#### Output Formats

**Console (Default):**
```
━━━ Secure Guard Scan Report ━━━
STATUS: FAIL
Total violations: 35

Blocking Violations (12 rules, 33 total):

[CRITICAL] HIBERNATE_DDL_AUTO_UNSAFE (2 occurrences)
  → application.properties:5
    spring.jpa.hibernate.ddl-auto = create-drop
  Issue: ...
  Fix: ...
```

**JSON:**
```json
{
  "status": "FAIL",
  "violations": [
    {
      "ruleId": "HIBERNATE_DDL_AUTO_UNSAFE",
      "severity": "CRITICAL",
      "message": "...",
      "filePath": "/path/application.properties",
      "lineNumber": 5,
      "configKey": "spring.jpa.hibernate.ddl-auto",
      "configValue": "create-drop"
    }
  ],
  "statistics": {
    "filesScanned": 5,
    "entriesEvaluated": 50,
    "rulesExecuted": 11
  }
}
```

**SARIF (GitHub Security Tab):**
```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "results": [{
      "ruleId": "HIBERNATE_DDL_AUTO_UNSAFE",
      "level": "error",
      "message": { "text": "..." },
      "locations": [{
        "physicalLocation": {
          "artifactLocation": { "uri": "application.properties" },
          "region": { "startLine": 5 }
        }
      }]
    }]
  }]
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI LAYER                               │
│  src/cli/commands/scan-command.ts                          │
│  - Parse arguments (--profile, --format, --fail-on)        │
│  - Create ScanOptions                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               APPLICATION LAYER                             │
│  src/application/services/scan-service.ts                  │
│  - Orchestrate the scan workflow                           │
│  - Call infrastructure for file discovery                  │
│  - Call rule engine for violation detection                │
│  - Call policy engine for custom policies                  │
│  - Aggregate results into ScanResult                       │
└──────────────┬─────────────────┬────────────────────────────┘
               │                 │
               ▼                 ▼
┌──────────────────────┐   ┌─────────────────────────────────┐
│ INFRASTRUCTURE LAYER │   │      DOMAIN LAYER               │
│                      │   │                                 │
│ File Discovery:      │   │ Rule Registry:                  │
│  - Recursive scan    │   │  - 27 built-in rules            │
│  - Pattern matching  │   │  - Platform filtering           │
│  - Format detection  │   │  - Rule execution logic         │
│                      │   │                                 │
│ Parsers:             │   │ Policy Engine:                  │
│  - properties-parser │   │  - YAML policy parsing          │
│  - yaml-parser       │   │  - Custom rule evaluation       │
│  - env-parser        │   │  - Violation creation           │
│  - json-parser       │   │                                 │
│                      │   │ Models:                         │
│ Policy Loader:       │   │  - ConfigEntry                  │
│  - Auto-discovery    │   │  - Violation                    │
│  - YAML parsing      │   │  - Rule                         │
│  - Validation        │   │  - Policy                       │
└──────────────────────┘   └─────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPORTING LAYER                            │
│  src/reporting/reporters/                                  │
│  - enhanced-console-reporter (severity grouping)           │
│  - enhanced-json-reporter (structured JSON)                │
│  - sarif-reporter (GitHub Security integration)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

**Benchmark (typical project):**
- Files scanned: 5-50
- Config entries: 50-500
- Rules executed: 11-27
- Scan duration: **10-100ms**

**Bottlenecks:**
1. **File I/O**: Reading files from disk (slowest)
2. **YAML Parsing**: Complex nested structures
3. **Rule Execution**: O(entries × rules) complexity

**Optimizations:**
- ✅ Parallel file reading (where possible)
- ✅ Early termination on rule mismatch
- ✅ Caching parsed files (future enhancement)
- ✅ Profile-based rule filtering reduces unnecessary checks

---

## Error Handling

**File Discovery Errors:**
```typescript
try {
  const files = await discoverConfigFiles(directory);
} catch (error) {
  console.error(`Failed to scan directory: ${error.message}`);
  process.exit(3); // EXIT_CODE_ERROR
}
```

**Parsing Errors:**
```typescript
try {
  const entries = parseConfigFile(content, filePath, format);
} catch (error) {
  console.warn(`Warning: Failed to parse ${filePath}:`, error);
  // Continue with other files (graceful degradation)
}
```

**Policy Loading Errors:**
```typescript
try {
  const policy = await loadPolicyFromFile(policyPath);
} catch (error) {
  console.warn(`Warning: Failed to load custom policy:`, error);
  // Continue with built-in rules only
}
```

---

## Extension Points

### Adding a New File Format

1. **Create parser:** `src/infrastructure/parsers/xml-parser.ts`
2. **Add pattern:** Update `CONFIG_FILE_PATTERNS` in `file-discovery.ts`
3. **Register format:** Add to `ConfigFormat` enum
4. **Add to factory:** Update `config-parser-factory.ts`

### Adding a New Rule

1. **Create rule file:** `src/domain/rules/implementations/platform/my-rule.ts`
2. **Implement Rule interface:**
   ```typescript
   export const myRule: Rule = {
     id: 'MY_RULE',
     targetKeys: ['config.key'],
     platforms: [Platform.SPRING],
     evaluate(entry) { /* ... */ }
   };
   ```
3. **Export from index:** Add to platform's `index.ts`
4. **Add to registry:** Include in `ALL_RULES`

### Adding a New Output Format

1. **Create reporter:** `src/reporting/reporters/markdown-reporter.ts`
2. **Implement Reporter interface**
3. **Add to factory:** Update `reporter-factory.ts`
4. **Add CLI option:** Update `scan-command.ts`

---

## Testing

**Unit Tests:**
```typescript
// Test parser
describe('YAML Parser', () => {
  it('should flatten nested YAML', () => {
    const yaml = 'spring:\n  profiles:\n    active: dev';
    const entries = parseYaml(yaml, 'test.yml');
    expect(entries).toContainEqual({
      key: 'spring.profiles.active',
      value: 'dev'
    });
  });
});

// Test rule
describe('SPRING_PROFILE_DEV_ACTIVE', () => {
  it('should detect test profile', () => {
    const entry = { key: 'spring.profiles.active', value: 'test', /* ... */ };
    const violations = SPRING_PROFILE_DEV_ACTIVE.evaluate(entry);
    expect(violations).toHaveLength(1);
  });
});
```

**Integration Tests:**
```typescript
describe('Scan Service', () => {
  it('should scan test fixtures and find violations', async () => {
    const result = await scan({
      targetDirectory: 'test-fixtures',
      profile: 'spring'
    });
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
```

---

## Debugging Tips

**Enable verbose logging:**
```bash
prod-analyzer scan --verbose
```

**Inspect JSON output:**
```bash
prod-analyzer scan --format json | jq '.violations'
```

**Test single file:**
```bash
prod-analyzer scan -d ./path/to/single/file
```

**Check which files are discovered:**
```bash
# Add debug output in file-discovery.ts
console.log('Discovered files:', discoveredFiles);
```

**Profile rule execution:**
```bash
# Add timing in rule-engine.ts
const start = Date.now();
const violations = rule.evaluate(entry);
const duration = Date.now() - start;
if (duration > 10) console.log(`Slow rule: ${rule.id} (${duration}ms)`);
```

---

## Summary

The scan mechanism is a **6-step pipeline** that transforms configuration files into actionable security violations:

1. **File Discovery**: Find all config files using pattern matching
2. **Parsing**: Convert to normalized `ConfigEntry[]` format
3. **Rule Execution**: Apply 27 built-in security rules
4. **Policy Evaluation**: Apply custom company policies
5. **Violation Merging**: Combine all detected issues
6. **Reporting**: Display in console/JSON/SARIF format

**Key Strengths:**
- ✅ Clear separation of concerns
- ✅ Extensible architecture
- ✅ Type-safe implementation
- ✅ Fast execution (<100ms typical)
- ✅ Graceful error handling
- ✅ Multiple output formats

**Next Steps:**
- See [POLICY_GUIDE.md](POLICY_GUIDE.md) for custom policy creation
- See [ARCHITECTURE.md](../ARCHITECTURE.md) for overall system design
- See [USAGE_GUIDE.md](USAGE_GUIDE.md) for CLI usage examples

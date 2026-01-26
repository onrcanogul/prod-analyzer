# 🏛️ Secure Guard - Mimari Dokümantasyon

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Katman Mimarisi](#katman-mimarisi)
3. [Domain Layer (Alan Katmanı)](#domain-layer)
4. [Application Layer (Uygulama Katmanı)](#application-layer)
5. [Infrastructure Layer (Altyapı Katmanı)](#infrastructure-layer)
6. [Reporting Layer (Raporlama Katmanı)](#reporting-layer)
7. [CLI Layer (Komut Satırı Katmanı)](#cli-layer)
8. [Veri Akışı](#veri-akışı)
9. [Tasarım Kararları](#tasarım-kararları)

---

## Genel Bakış

Secure Guard, **Clean Architecture** prensiplerini takip eden, Spring Boot yapılandırma dosyalarındaki güvenlik hatalarını tespit eden bir CLI aracıdır.

### Temel Özellikler:
- ✅ Modüler ve genişletilebilir mimari
- ✅ Katı tip güvenliği (TypeScript strict mode)
- ✅ Sıfır dış bağımlılık (domain katmanında)
- ✅ Test edilebilir tasarım
- ✅ Immutable (değiştirilemez) veri yapıları

---

## Katman Mimarisi

```
┌─────────────────────────────────────────┐
│           CLI Layer                     │  ← Kullanıcı etkileşimi
│  • Argüman parsing                      │
│  • Exit code belirleme                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Application Layer                  │  ← İş akışı orkestrasyon
│  • ScanService (ana servis)             │
│  • RuleEngine (kural yürütücü)          │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐  ┌──────▼────────────┐
│ Domain Layer │  │ Infrastructure    │   ← Teknik detaylar
│ • Rules      │  │ • File I/O        │
│ • Models     │  │ • Parsers         │
└──────────────┘  └───────────────────┘
    │
┌───▼──────────┐
│ Reporting    │                          ← Çıktı formatlama
│ • Console    │
│ • JSON       │
└──────────────┘
```

### Bağımlılık Yönü:
```
CLI → Application → Domain ← Infrastructure
                  ↑
              Reporting
```

**Önemli:** Domain katmanı başka hiçbir katmana bağımlı değildir (saf iş mantığı).

---

## Domain Layer

**Konum:** `src/domain/`  
**Amaç:** İş mantığını ve kuralları içerir. Hiçbir framework veya dış kütüphaneye bağımlı değildir.

### 📦 Models (Veri Modelleri)

#### `Severity` (Önem Derecesi)
```typescript
enum Severity {
  INFO = 1,      // Bilgilendirme
  LOW = 2,       // Düşük önem
  MEDIUM = 3,    // Orta önem
  HIGH = 4,      // Yüksek önem
  CRITICAL = 5   // Kritik önem
}
```
**Ne yapar:** Bulunan ihlallerin önem derecesini belirler.  
**Neden önemli:** Numeric enum olması karşılaştırma operasyonlarını kolaylaştırır (`severity >= Severity.HIGH`).

#### `Violation` (İhlal)
```typescript
interface Violation {
  ruleId: string;         // Hangi kural tetiklendi
  severity: Severity;     // İhlalin önem derecesi
  message: string;        // İnsan okunabilir mesaj
  filePath: string;       // Dosya yolu
  configKey: string;      // Yapılandırma anahtarı (örn: "spring.profiles.active")
  configValue: string;    // Hatalı değer
  lineNumber?: number;    // Satır numarası
  suggestion: string;     // Nasıl düzeltilir
}
```
**Ne yapar:** Tespit edilen bir güvenlik/yapılandırma hatasını temsil eder.  
**Neden önemli:** Immutable (değiştirilemez) olması, veri bütünlüğünü garanti eder.

#### `ConfigEntry` (Yapılandırma Girişi)
```typescript
interface ConfigEntry {
  key: string;            // "spring.datasource.url"
  value: string;          // "jdbc:mysql://..."
  sourceFile: string;     // "/app/application.yml"
  lineNumber?: number;    // 15
}
```
**Ne yapar:** Yapılandırma dosyasından çıkarılan tek bir key-value çiftini temsil eder.  
**Neden önemli:** Kurallar bu yapıyı değerlendirerek ihlal bulur.

#### `Rule` (Kural)
```typescript
interface Rule {
  id: string;                        // "SPRING_PROFILE_DEV_ACTIVE"
  name: string;                      // "Development Profile Active"
  description: string;               // Açıklama
  defaultSeverity: Severity;         // Varsayılan önem
  targetKeys: readonly string[];     // ["spring.profiles.active"]
  evaluate(entry: ConfigEntry): readonly Violation[];
}
```
**Ne yapar:** Bir güvenlik kuralının sözleşmesini tanımlar.  
**Neden önemli:** Kurallar pure function olması, test edilebilirliği artırır.

#### `ScanResult` (Tarama Sonucu)
```typescript
interface ScanResult {
  scannedAt: string;                 // ISO 8601 tarih
  targetDirectory: string;           // Taranan dizin
  environment: string;               // "prod", "staging"
  violations: readonly Violation[];  // Bulunan ihlaller
  statistics: ScanStatistics;        // İstatistikler
  maxSeverity: Severity;             // En yüksek önem
  violationsBySeverity: Record<Severity, number>;
}
```
**Ne yapar:** Tüm tarama sonucunu ve istatistikleri içerir.  
**Neden önemli:** Raporlama katmanının ihtiyaç duyduğu tüm veriyi sağlar.

### 🔧 Rules (Kurallar)

#### `RuleRegistry` (Kural Kayıt Sistemi)
```typescript
class RuleRegistry {
  register(rule: Rule): void;
  getRulesForKey(key: string): readonly Rule[];
  getAllRules(): readonly Rule[];
}
```
**Ne yapar:** Tüm kuralları merkezi olarak yönetir.  
**Nasıl çalışır:** 
- Kuralları `id`'ye göre saklar
- Target key'lere göre indeksler (O(1) erişim)
- Wildcard kuralları destekler (`*`)

**Optimizasyon:** Her config entry için sadece ilgili kurallar çalıştırılır.

#### Kural Implementasyonları:

**1. `springProfileDevActiveRule`**
- **Ne yapar:** `spring.profiles.active = dev/test` gibi değerleri tespit eder
- **Severity:** HIGH
- **Neden:** Development profilleri debug özelliklerini aktif eder

**2. `debugLoggingEnabledRule`**
- **Ne yapar:** `logging.level.root = DEBUG/TRACE` değerlerini tespit eder
- **Severity:** HIGH
- **Neden:** Debug loglama hassas bilgileri açığa çıkarabilir

**3. `actuatorEndpointsExposedRule`**
- **Ne yapar:** `management.endpoints.web.exposure.include = *` değerini tespit eder
- **Severity:** HIGH
- **Neden:** Tüm actuator endpoint'leri sistem bilgilerini açığa çıkarır

**4. `healthDetailsExposedRule`**
- **Ne yapar:** `management.endpoint.health.show-details = always` değerini tespit eder
- **Severity:** MEDIUM
- **Neden:** İç sistem mimarisini gösterir

**5. `hibernateDdlAutoUnsafeRule`**
- **Ne yapar:** `spring.jpa.hibernate.ddl-auto = create/update` değerlerini tespit eder
- **Severity:** HIGH/CRITICAL (create-drop için CRITICAL)
- **Neden:** Veri kaybına veya tutarsızlığa sebep olabilir

---

## Application Layer

**Konum:** `src/application/`  
**Amaç:** İş akışını orkestre eder, katmanlar arası koordinasyonu sağlar.

### `ScanService` (Tarama Servisi)
```typescript
async function scan(options: ScanOptions): Promise<ScanResult>
```
**Ne yapar:** Ana tarama iş akışını yönetir.

**İş Akışı:**
1. Config dosyalarını keşfet (Infrastructure)
2. Her dosyayı format'ına göre parse et (Infrastructure)
3. Config entry'leri çıkar
4. Kuralları çalıştır (RuleEngine)
5. Sonuçları topla ve ScanResult oluştur

**Neden önemli:** Tek sorumluluk - sadece orkestrasyon, iş mantığı yok.

### `RuleEngine` (Kural Motoru)
```typescript
function executeRules(
  entries: readonly ConfigEntry[],
  registry: RuleRegistry
): RuleExecutionResult
```
**Ne yapar:** Config entry'lerine karşı kuralları çalıştırır.

**Algoritma:**
```
For each config entry:
  1. RuleRegistry'den ilgili kuralları al
  2. Her kuralın evaluate() metodunu çağır
  3. Dönen violation'ları topla
```

**Optimizasyon:** Sadece ilgili kurallar çalıştırılır (target key match).

### `ScanOptions` (Tarama Seçenekleri)
```typescript
interface ScanOptions {
  targetDirectory: string;      // Taranacak dizin
  environment: string;           // "prod", "staging"
  failOnSeverity: Severity;     // Hangi önemde fail olsun
  outputFormat: OutputFormat;    // "console" veya "json"
}
```
**Ne yapar:** CLI'dan gelen parametreleri encapsulate eder.

---

## Infrastructure Layer

**Konum:** `src/infrastructure/`  
**Amaç:** Dış dünya ile etkileşim (dosya sistemi, parsing).

### File System

#### `discoverConfigFiles()`
```typescript
async function discoverConfigFiles(
  rootDir: string,
  options?: FileDiscoveryOptions
): Promise<readonly DiscoveredFile[]>
```
**Ne yapar:** Dizin ağacını recursive olarak tarar, config dosyalarını bulur.

**Algoritma:**
```
1. Dizini oku
2. Her entry için:
   - Dizinse → recursive çağır (excludeDirs kontrolü ile)
   - Dosyaysa → pattern match yap
3. Bulunan dosyaları döndür (sorted)
```

**Exclude edilen dizinler:** `node_modules`, `.git`, `dist`, `build` vb.

### Parsers (Ayrıştırıcılar)

#### `YamlParser`
```typescript
function parseYamlContent(content: string, filePath: string): ParsedConfigFile
```
**Ne yapar:** YAML dosyalarını flat key-value pair'lere dönüştürür.

**Örnek:**
```yaml
spring:
  profiles:
    active: dev
```
↓
```typescript
{ key: "spring.profiles.active", value: "dev" }
```

**Özellikler:**
- Nested yapıları dot notation'a çevirir
- Array'leri index notation ile temsil eder (`servers[0].host`)
- Null/undefined değerleri skip eder

#### `PropertiesParser`
```typescript
function parsePropertiesContent(content: string, filePath: string): ParsedConfigFile
```
**Ne yapar:** Java .properties dosyalarını parse eder.

**Özellikler:**
- `#` ve `!` ile başlayan satırlar comment
- `key=value` veya `key:value` formatı
- Escape karakterleri (`\n`, `\t`, `\uXXXX`)
- Line continuation (`\` ile devam eden satırlar)
- Satır numarası tracking

#### `EnvParser`
```typescript
function parseEnvContent(content: string, filePath: string): ParsedConfigFile
```
**Ne yapar:** .env dosyalarını parse eder.

**Özellikler:**
- `UPPER_SNAKE_CASE` → `dot.notation` dönüşümü
- Quoted değerleri destekler (`"value"`, `'value'`)
- Spring Boot relaxed binding uyumlu

**Örnek:**
```
SPRING_PROFILES_ACTIVE=dev
```
↓
```typescript
{ key: "spring.profiles.active", value: "dev" }
```

#### `ConfigParserFactory`
```typescript
function parseConfigFile(
  content: string,
  filePath: string,
  format: ConfigFileFormat
): ParsedConfigFile
```
**Ne yapar:** Format'a göre doğru parser'ı seçer ve çalıştırır.

**Factory Pattern:** Yeni format eklemek kolay (TOML, XML vb.).

---

## Reporting Layer

**Konum:** `src/reporting/`  
**Amaç:** Scan sonuçlarını formatlayıp çıktı üretir.

### `ConsoleReporter`
```typescript
function formatConsoleReport(result: ScanResult, useColors: boolean): string
```
**Ne yapar:** İnsan okunabilir terminal çıktısı üretir.

**Özellikler:**
- ANSI color codes (severity'ye göre renklendirme)
- Violation'ları severity ve file path'e göre sıralar
- İstatistikleri gösterir
- Actionable suggestion'lar içerir

**Çıktı Formatı:**
```
━━━ Secure Guard Scan Report ━━━

Statistics:
  Files scanned:     2
  Entries evaluated: 15
  
Violations by Severity:
  HIGH: 3
  MEDIUM: 1

1. [HIGH] SPRING_PROFILE_DEV_ACTIVE
   File:   /app/application.yml:5
   Key:    spring.profiles.active
   Value:  dev
   Issue:  Non-production profile "dev" is active
   Fix:    Change to production profile
```

### `JsonReporter`
```typescript
function formatJsonReport(result: ScanResult, pretty: boolean): string
```
**Ne yapar:** Machine-readable JSON çıktısı üretir.

**Schema:**
```json
{
  "schemaVersion": "1.0.0",
  "scannedAt": "2026-01-26T10:30:00.000Z",
  "summary": {
    "totalViolations": 4,
    "maxSeverity": "HIGH",
    "violationsBySeverity": { "HIGH": 3, "MEDIUM": 1 }
  },
  "violations": [...]
}
```

**Önemli:** Schema versioned (breaking change'ler için).

### `ReporterFactory`
```typescript
function getReporter(format: OutputFormat): Reporter
```
**Ne yapar:** Output format'a göre reporter seçer.

---

## CLI Layer

**Konum:** `src/cli/`  
**Amaç:** Kullanıcı ile etkileşim, argüman parsing.

### `ScanCommand`
```typescript
function createScanCommand(): Command
```
**Ne yapar:** `scan` komutunu oluşturur ve yapılandırır.

**Options:**
- `-d, --directory` → Taranacak dizin
- `-e, --env` → Environment (rapor context'i için)
- `-f, --fail-on` → Hangi severity'de fail olsun
- `--format` → Çıktı formatı

**İş Akışı:**
```
1. Argümanları parse et ve validate et
2. ScanOptions oluştur
3. scan() servisini çağır
4. Sonucu formatla (reporter)
5. Console'a yaz
6. Exit code belirle
```

**Exit Codes:**
- `0` → Başarılı (threshold üstü violation yok)
- `1` → Violation bulundu
- `2` → Geçersiz argüman
- `3` → Beklenmeyen hata

### `main.ts` (Entry Point)
```typescript
async function main(): Promise<void>
```
**Ne yapar:** Commander program'ını oluşturur ve başlatır.

**Özellikler:**
- Version bilgisi
- Help text
- Usage examples
- Error handling

---

## Veri Akışı

### End-to-End Akış:

```
1. KULLANICI
   └→ $ secure-guard scan --fail-on HIGH

2. CLI LAYER (main.ts)
   └→ Commander program başlar
   └→ ScanCommand tetiklenir

3. CLI LAYER (scan-command.ts)
   └→ Options validate edilir
   └→ ScanOptions oluşturulur

4. APPLICATION LAYER (scan-service.ts)
   └→ scan(options) çağrılır
   
   4a. INFRASTRUCTURE (file-discovery.ts)
       └→ discoverConfigFiles()
       └→ [application.yml, application.properties]
   
   4b. INFRASTRUCTURE (parsers)
       └→ parseYamlContent(...)
       └→ parsePropertiesContent(...)
       └→ [ConfigEntry, ConfigEntry, ...]
   
   4c. APPLICATION (rule-engine.ts)
       └→ executeRules(entries, registry)
       
       4c-i. DOMAIN (rule-registry.ts)
             └→ getRulesForKey(entry.key)
             └→ [Rule1, Rule2, ...]
       
       4c-ii. DOMAIN (rule implementations)
              └→ rule1.evaluate(entry)
              └→ rule2.evaluate(entry)
              └→ [Violation, ...]
   
   4d. DOMAIN (scan-result.ts)
       └→ createScanResult(...)
       └→ ScanResult

5. REPORTING LAYER (reporter-factory.ts)
   └→ getReporter(format)
   └→ formatScanResult(result)
   └→ formatted string

6. CLI LAYER (scan-command.ts)
   └→ console.log(output)
   └→ hasViolationsAboveThreshold?
   └→ process.exit(1 veya 0)
```

---

## Tasarım Kararları

### 1. **Clean Architecture Kullanımı**
**Karar:** Katmanları bağımlılık yönüne göre ayırdık.  
**Neden:** 
- Test edilebilirlik
- Değiştirilebilirlik (parser değiştirmek domain'i etkilemez)
- İş mantığının izole olması

### 2. **Immutability (Değiştirilemezlik)**
**Karar:** Tüm modeller `readonly`.  
**Neden:**
- Thread-safe
- Predictable state
- Debugging kolaylığı

### 3. **Pure Functions**
**Karar:** Kurallar pure function (yan etki yok).  
**Neden:**
- Test edilebilir
- Paralelize edilebilir
- Deterministic (aynı input → aynı output)

### 4. **Factory Pattern**
**Karar:** Parser ve Reporter seçimi factory ile.  
**Neden:**
- Yeni format eklemek kolay
- Caller parser detaylarını bilmez
- Open/Closed Principle

### 5. **Registry Pattern**
**Karar:** Kurallar merkezi registry'de.  
**Neden:**
- Kurallar pluggable
- Dinamik kural ekleme mümkün
- O(1) lookup performance

### 6. **Strict TypeScript**
**Karar:** `noImplicitAny`, `strictNullChecks` aktif.  
**Neden:**
- Compile-time hata yakalama
- IDE autocomplete
- Refactoring güvenliği

### 7. **Flat Key-Value Structure**
**Karar:** Nested YAML'ı `dot.notation`'a çevirdik.  
**Neden:**
- Kural yazmak basitleşir
- Spring Boot property resolution ile uyumlu
- Tüm format'lar aynı yapıda

### 8. **Separation of Concerns**
**Karar:** Her layer tek sorumluluğa sahip.  
**Neden:**
- Kolay maintain
- Kolay test
- Kolay extend

---

## Örnek Senaryolar

### Senaryo 1: Yeni Kural Eklemek

```typescript
// 1. Domain'de yeni kural oluştur
export const corsWildcardRule: Rule = {
  id: 'CORS_WILDCARD_ORIGIN',
  targetKeys: ['cors.allowed-origins'],
  evaluate(entry) {
    if (entry.value === '*') {
      return [createViolation(...)];
    }
    return [];
  }
};

// 2. Index'e ekle
export const ALL_RULES = [..., corsWildcardRule];

// Hepsi bu! Registry otomatik alır.
```

### Senaryo 2: Yeni Parser Eklemek

```typescript
// 1. Infrastructure'da parser yaz
export function parseTomlContent(...): ParsedConfigFile { ... }

// 2. Factory'ye ekle
const PARSERS = {
  ...,
  [ConfigFileFormat.TOML]: parseTomlContent
};

// 3. ConfigFileFormat enum'a ekle
enum ConfigFileFormat {
  ...,
  TOML = 'toml'
}
```

### Senaryo 3: Yeni Output Format

```typescript
// 1. Reporter yaz
export function formatHtmlReport(...): string { ... }

// 2. OutputFormat enum'a ekle
enum OutputFormat {
  ...,
  HTML = 'html'
}

// 3. Factory'ye ekle
function getReporter(format: OutputFormat) {
  switch (format) {
    ...,
    case OutputFormat.HTML:
      return formatHtmlReport;
  }
}
```

---

## Best Practices

1. **Her yeni rule için test yaz**
2. **Parser'lar edge case'leri handle etmeli**
3. **Violation message'lar actionable olmalı**
4. **Breaking change'lerde schema version bump et**
5. **Performance için rule indexing kullan**
6. **Immutability'yi koru**
7. **Type safety'i bozmak için `any` kullanma**

---

**Secure Guard** production-ready, maintainable, ve extensible bir CLI tool'dur. Clean Architecture ve SOLID prensipleri sayesinde gelecekte kolayca genişletilebilir.

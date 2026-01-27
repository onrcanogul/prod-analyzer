# 🎯 Secure Guard - Hızlı Başlangıç Kılavuzu

## 📖 Proje Özeti

**Secure Guard**, Spring Boot uygulamalarının configuration dosyalarını (`.yml`, `.properties`, `.env`) tarayarak production ortamında tehlikeli olabilecek ayarları tespit eden bir CLI aracıdır.

---

## 🏗️ Katmanlar ve Sorumlulukları (Tek Cümle Özet)

### 1. **Domain Layer** (`src/domain/`)
> **Ne:** İş mantığının kalbi - kurallar, modeller ve validasyon mantığı.  
> **Sorumluluk:** Hangi konfigürasyonların yanlış olduğunu belirler.  
> **Örnek:** "spring.profiles.active = dev" → HIGH severity ihlal

**Ana Entityler:**
- **`Severity`** → İhlallerin önem derecesi (INFO, LOW, MEDIUM, HIGH, CRITICAL)
- **`Violation`** → Tespit edilen bir güvenlik hatası
- **`Rule`** → Bir konfigürasyon kuralı (5 tane kural var)
- **`ConfigEntry`** → Dosyadan okunan tek bir key-value çifti
- **`ScanResult`** → Tüm tarama sonucunu içeren ana model
- **`RuleRegistry`** → Kuralları yöneten merkezi kayıt sistemi

### 2. **Application Layer** (`src/application/`)
> **Ne:** İş akışını orkestre eden koordinatör.  
> **Sorumluluk:** "Dosyaları bul → Parse et → Kuralları çalıştır → Sonuç oluştur" akışını yönetir.  
> **Örnek:** ScanService tüm adımları sırasıyla çağırır

**Ana Servisler:**
- **`ScanService`** → Ana tarama servisi, tüm akışı yönetir
- **`RuleEngine`** → Config entry'lerine karşı kuralları çalıştırır
- **`ScanOptions`** → CLI parametrelerini taşır

### 3. **Infrastructure Layer** (`src/infrastructure/`)
> **Ne:** Dosya okuma, parsing gibi teknik işlemler.  
> **Sorumluluk:** Dış dünya ile etkileşim - dosya sistemi ve config dosya formatları.  
> **Örnek:** YAML dosyasını okuyup `{key: "spring.profiles.active", value: "dev"}` formatına çevirir

**Ana Componentler:**
- **`FileDiscovery`** → Dizinde recursive olarak config dosyalarını bulur
- **`YamlParser`** → YAML → flat key-value
- **`PropertiesParser`** → .properties → flat key-value
- **`EnvParser`** → .env (UPPER_SNAKE_CASE → dot.notation)
- **`ConfigParserFactory`** → Format'a göre doğru parser'ı seçer

### 4. **Reporting Layer** (`src/reporting/`)
> **Ne:** Çıktı formatlama - insan ve makine okumas ı.  
> **Sorumluluk:** Tarama sonuçlarını console veya JSON formatında gösterir.  
> **Örnek:** Renkli terminal çıktısı veya CI için JSON rapor

**Ana Reporterlar:**
- **`ConsoleReporter`** → Renkli, okunabilir terminal çıktısı
- **`JsonReporter`** → Machine-readable JSON (CI/CD için)
- **`ReporterFactory`** → Format'a göre reporter seçer

### 5. **CLI Layer** (`src/cli/`)
> **Ne:** Kullanıcı arayüzü ve komut yönetimi.  
> **Sorumluluk:** Argümanları parse eder, servisi çağırır, exit code belirler.  
> **Örnek:** `--fail-on HIGH` argümanını alıp Severity.HIGH'a çevirir

**Ana Componentler:**
- **`ScanCommand`** → `scan` komutunu implemente eder
- **`main.ts`** → Uygulama giriş noktası

---

## 🔄 Nasıl Çalışır? (End-to-End Akış)

```
1. Kullanıcı komutu çalıştırır
   $ secure-guard scan -d ./my-app --fail-on HIGH

2. CLI Layer argümanları parse eder
   → directory: "./my-app"
   → failOnSeverity: Severity.HIGH

3. Application Layer (ScanService) başlar

4. Infrastructure (FileDiscovery)
   → ./my-app dizininde recursive arama
   → Bulunan: [application.yml, application.properties]

5. Infrastructure (Parsers)
   → application.yml → YamlParser
   → application.properties → PropertiesParser
   → Çıktı: [{key: "spring.profiles.active", value: "dev"}, ...]

6. Application (RuleEngine)
   → Her entry için Registry'den ilgili kuralları al
   → springProfileDevActiveRule.evaluate(entry)
   → Violation döndü mü? Topla

7. Domain (ScanResult oluştur)
   → violations: [...]
   → maxSeverity: HIGH
   → statistics: {...}

8. Reporting (ConsoleReporter)
   → ScanResult → Renkli text çıktısı

9. CLI Layer
   → Çıktıyı console'a yaz
   → hasViolationsAboveThreshold(HIGH)?
   → Evet → process.exit(1)
   → Hayır → process.exit(0)
```

---

## 📝 Ana Entityler ve Amaçları

### `Severity` (Enum)
```typescript
enum Severity {
  INFO = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  CRITICAL = 5
}
```
**Amacı:** İhlallerin ciddiyetini sayısal olarak karşılaştırılabilir şekilde tutar.

### `Violation` (Interface)
```typescript
interface Violation {
  ruleId: string;        // Hangi kural tetiklendi
  severity: Severity;    // Ne kadar ciddi
  message: string;       // Ne oldu
  suggestion: string;    // Nasıl düzeltilir
  filePath: string;      // Hangi dosyada
  configKey: string;     // Hangi ayar
  configValue: string;   // Yanlış değer ne
}
```
**Amacı:** Bulunan bir hatanın tüm detaylarını taşır.

### `Rule` (Interface)
```typescript
interface Rule {
  id: string;
  targetKeys: string[];
  evaluate(entry: ConfigEntry): Violation[];
}
```
**Amacı:** Bir güvenlik kuralının sözleşmesini tanımlar.

### `ConfigEntry` (Interface)
```typescript
interface ConfigEntry {
  key: string;           // "spring.profiles.active"
  value: string;         // "dev"
  sourceFile: string;    // "/app/application.yml"
  lineNumber?: number;   // 5
}
```
**Amacı:** Config dosyasından çıkarılan bir ayarı temsil eder.

### `ScanResult` (Interface)
```typescript
interface ScanResult {
  violations: Violation[];
  statistics: {...};
  maxSeverity: Severity;
  violationsBySeverity: Record<Severity, number>;
}
```
**Amacı:** Tüm taramanın sonucunu ve istatistiklerini içerir.

---

## 🎯 5 Ana Kural

| Kural ID | Ne Tespit Eder | Severity | Örnek |
|----------|----------------|----------|-------|
| **SPRING_PROFILE_DEV_ACTIVE** | Dev/test profili aktif | HIGH | `spring.profiles.active: dev` |
| **DEBUG_LOGGING_ENABLED** | Debug logging açık | HIGH | `logging.level.root: DEBUG` |
| **ACTUATOR_ENDPOINTS_EXPOSED** | Tüm actuator endpoint'leri açık | HIGH | `management.endpoints.web.exposure.include: *` |
| **HEALTH_DETAILS_EXPOSED** | Health detayları herkese açık | MEDIUM | `management.endpoint.health.show-details: always` |
| **HIBERNATE_DDL_AUTO_UNSAFE** | DDL auto tehlikeli modda | HIGH/CRITICAL | `spring.jpa.hibernate.ddl-auto: create-drop` |

---

## 🚀 Kullanım

```bash
# Build
npm run build

# Temel tarama
node dist/cli/main.js scan

# Belirli dizin
node dist/cli/main.js scan -d /path/to/project

# Fail threshold değiştir
node dist/cli/main.js scan --fail-on MEDIUM

# JSON output
node dist/cli/main.js scan --format json

# Tüm seçenekler
node dist/cli/main.js scan \
  -d ./my-app \
  -e prod \
  --fail-on HIGH \
  --format console
```

---

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch
```

**Test edilen şeyler:**
- Her kural'ın doğru violation ürettiği
- Parser'ların farklı formatları doğru parse ettiği
- Severity karşılaştırma işlemlerinin doğru çalıştığı
- RuleRegistry'nin doğru kural seçtiği

---

## 🔧 Yeni Kural Nasıl Eklenir?

```typescript
// 1. src/domain/rules/implementations/my-rule.rule.ts
export const myNewRule: Rule = {
  id: 'MY_NEW_RULE',
  name: 'My New Rule',
  description: 'Checks something important',
  defaultSeverity: Severity.HIGH,
  targetKeys: ['my.config.key'],
  
  evaluate(entry: ConfigEntry): readonly Violation[] {
    if (entry.value === 'dangerous') {
      return [createViolation({...})];
    }
    return [];
  },
};

// 2. src/domain/rules/implementations/index.ts
export { myNewRule } from './my-rule.rule';
export const ALL_RULES = [..., myNewRule];
```

---

## 📊 Exit Kodları

| Kod | Anlamı |
|-----|--------|
| 0 | ✅ Başarılı (threshold üstü violation yok) |
| 1 | ⛔ Violation bulundu |
| 2 | ❌ Geçersiz argüman |
| 3 | 💥 Beklenmeyen hata |

---

## 🎓 Tasarım Prensipleri

1. **Clean Architecture** → Katmanlar birbirinden izole
2. **SOLID Principles** → Her class/function tek sorumluluk
3. **Immutability** → Tüm modeller readonly
4. **Type Safety** → Strict TypeScript, no `any`
5. **Testability** → Pure functions, dependency injection
6. **Extensibility** → Yeni kural/parser/reporter eklemek kolay

---

## ⚠️ Bilinen Sorun

**TypeScript Path Aliases:**
`tsconfig.json`'da path aliasları (`@domain/*`) tanımlanmış ama runtime'da çalışmaz.  

**Çözüm:** Tüm import'ları relative path'e çevir:
```typescript
// Yerine:
import { Rule } from '@domain/models/rule';

// Kullan:
import { Rule } from '../../domain/models/rule';
```

---

## 📚 İlgili Dosyalar

- **README.md** → Kullanım kılavuzu
- **ARCHITECTURE.md** → Detaylı mimari dokümantasyon (Türkçe)
- **package.json** → Bağımlılıklar ve scriptler
- **tsconfig.json** → TypeScript konfigürasyonu
- **jest.config.js** → Test konfigürasyonu

---

**Sonuç:** Secure Guard, production-ready, test edilebilir, genişletilebilir bir CLI aracıdır. Clean Architecture sayesinde her katman bağımsız olarak geliştirilebilir ve test edilebilir.

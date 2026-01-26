import { Platform, detectPlatform, getPlatformMetadata } from './platform';

describe('Platform', () => {
  describe('detectPlatform', () => {
    it('should detect Spring Boot from application.properties', () => {
      const files = ['/project/src/main/resources/application.properties'];
      expect(detectPlatform(files)).toBe(Platform.SPRING_BOOT);
    });

    it('should detect Spring Boot from application.yml', () => {
      const files = ['/project/src/main/resources/application.yml'];
      expect(detectPlatform(files)).toBe(Platform.SPRING_BOOT);
    });

    it('should detect Node.js from .env', () => {
      const files = ['/project/.env'];
      expect(detectPlatform(files)).toBe(Platform.NODEJS);
    });

    it('should detect Node.js from package.json', () => {
      const files = ['/project/package.json'];
      expect(detectPlatform(files)).toBe(Platform.NODEJS);
    });

    it('should detect .NET from appsettings.json', () => {
      const files = ['/project/appsettings.json'];
      expect(detectPlatform(files)).toBe(Platform.DOTNET);
    });

    it('should detect .NET from web.config', () => {
      const files = ['/project/web.config'];
      expect(detectPlatform(files)).toBe(Platform.DOTNET);
    });

    it('should return GENERIC for unknown files', () => {
      const files = ['/project/config.txt'];
      expect(detectPlatform(files)).toBe(Platform.GENERIC);
    });

    it('should prefer more specific platform when multiple matches', () => {
      // If Spring Boot files are present, should detect Spring Boot
      const files = ['/project/application.yml', '/project/.env'];
      expect(detectPlatform(files)).toBe(Platform.SPRING_BOOT);
    });
  });

  describe('getPlatformMetadata', () => {
    it('should return metadata for Spring Boot', () => {
      const metadata = getPlatformMetadata(Platform.SPRING_BOOT);
      expect(metadata.platform).toBe(Platform.SPRING_BOOT);
      expect(metadata.displayName).toBe('Spring Boot');
      expect(metadata.filePatterns).toContain('application.properties');
    });

    it('should return metadata for Node.js', () => {
      const metadata = getPlatformMetadata(Platform.NODEJS);
      expect(metadata.platform).toBe(Platform.NODEJS);
      expect(metadata.displayName).toBe('Node.js');
      expect(metadata.filePatterns).toContain('.env');
    });

    it('should return metadata for .NET', () => {
      const metadata = getPlatformMetadata(Platform.DOTNET);
      expect(metadata.platform).toBe(Platform.DOTNET);
      expect(metadata.displayName).toBe('.NET');
      expect(metadata.filePatterns).toContain('appsettings.json');
    });
  });
});

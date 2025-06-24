
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ProductionValidator {
  static validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for development keys in production
    const clerkKey = "pk_test_Zmxvd2luZy1sb3VzZS02MC5jbGVyay5hY2NvdW50cy5kZXYk";
    if (window.location.hostname !== 'localhost' && clerkKey.includes('test')) {
      warnings.push('Using Clerk test keys in production environment');
    }

    // Check localStorage for sensitive data
    try {
      const keys = Object.keys(localStorage);
      const sensitiveKeys = keys.filter(key => 
        key.includes('api') || key.includes('secret') || key.includes('key')
      );
      if (sensitiveKeys.length > 0) {
        warnings.push(`Found ${sensitiveKeys.length} potentially sensitive keys in localStorage`);
      }
    } catch (error) {
      warnings.push('Unable to check localStorage for sensitive data');
    }

    // Check for console.log statements (in development)
    if (process.env.NODE_ENV === 'development') {
      warnings.push('Remember to remove console.log statements before production deployment');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateApiConnections(): Promise<ValidationResult> {
    return new Promise(async (resolve) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      try {
        // Test MEXC connection
        const response = await fetch('https://api.mexc.com/api/v3/ping', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          errors.push('MEXC API is not accessible');
        }
      } catch (error) {
        errors.push('Failed to connect to MEXC API');
      }

      try {
        // Test CoinGecko connection
        const response = await fetch('https://api.coingecko.com/api/v3/ping');
        if (!response.ok) {
          warnings.push('CoinGecko API is not accessible');
        }
      } catch (error) {
        warnings.push('Failed to connect to CoinGecko API');
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        warnings
      });
    });
  }

  static validateSecuritySettings(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check HTTPS in production
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      errors.push('Application must use HTTPS in production');
    }

    // Check for mixed content
    if (window.location.protocol === 'https:') {
      const scripts = document.querySelectorAll('script[src^="http:"]');
      const images = document.querySelectorAll('img[src^="http:"]');
      if (scripts.length > 0 || images.length > 0) {
        warnings.push('Mixed content detected - some resources may not load over HTTPS');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static async runAllValidations(): Promise<{
    environment: ValidationResult;
    api: ValidationResult;
    security: ValidationResult;
    overall: boolean;
  }> {
    const environment = this.validateEnvironment();
    const api = await this.validateApiConnections();
    const security = this.validateSecuritySettings();

    const overall = environment.isValid && api.isValid && security.isValid;

    return {
      environment,
      api,
      security,
      overall
    };
  }
}

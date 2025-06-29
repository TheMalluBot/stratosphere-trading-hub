import { EncryptionConfig, EncryptedData } from '@/types/security.types';

/**
 * Advanced Encryption Service for Financial Trading Platform
 * Provides AES-256-GCM encryption with key rotation and secure key management
 */
export class EncryptionService {
  private encryptionKey: CryptoKey | null = null;
  private keyVersion: string = 'v1';
  private config: EncryptionConfig;
  private keyRotationTimer: NodeJS.Timeout | null = null;
  private keyHistory: Map<string, CryptoKey> = new Map();

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      iterations: 100000,
      saltLength: 32,
      keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };
  }

  /**
   * Initialize the encryption service
   */
  async initialize(): Promise<void> {
    try {
      await this.generateMasterKey();
      this.startKeyRotationScheduler();
      console.log('🔐 Encryption Service initialized');
    } catch (error) {
      console.error('Failed to initialize Encryption Service:', error);
      throw error;
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: any): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption service not initialized');
    }

    const plaintext = JSON.stringify(data);
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    try {
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        plaintextBuffer
      );

      const encryptedArray = new Uint8Array(encrypted);
      const dataArray = encryptedArray.slice(0, -16); // Data without tag
      const tagArray = encryptedArray.slice(-16); // Last 16 bytes are the tag

      return {
        algorithm: this.config.algorithm,
        iv: this.arrayBufferToBase64(iv),
        data: this.arrayBufferToBase64(dataArray),
        tag: this.arrayBufferToBase64(tagArray),
        timestamp: Date.now(),
        keyVersion: this.keyVersion
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: EncryptedData): Promise<any> {
    let decryptionKey = this.encryptionKey;

    // Use historical key if needed
    if (encryptedData.keyVersion !== this.keyVersion) {
      decryptionKey = this.keyHistory.get(encryptedData.keyVersion);
      if (!decryptionKey) {
        throw new Error(`Decryption key for version ${encryptedData.keyVersion} not found`);
      }
    }

    if (!decryptionKey) {
      throw new Error('No decryption key available');
    }

    try {
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const data = this.base64ToArrayBuffer(encryptedData.data);
      const tag = this.base64ToArrayBuffer(encryptedData.tag);

      // Combine data and tag for GCM
      const encryptedBuffer = new Uint8Array(data.byteLength + tag.byteLength);
      encryptedBuffer.set(new Uint8Array(data), 0);
      encryptedBuffer.set(new Uint8Array(tag), data.byteLength);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv)
        },
        decryptionKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const plaintextString = decoder.decode(decrypted);
      return JSON.parse(plaintextString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure hash of data
   */
  async hash(data: any): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generate HMAC for data integrity
   */
  async generateHMAC(data: any, secret?: string): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    
    // Use provided secret or derive from master key
    let hmacKey: CryptoKey;
    if (secret) {
      const keyBuffer = encoder.encode(secret);
      hmacKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
    } else {
      if (!this.encryptionKey) {
        throw new Error('Encryption service not initialized');
      }
      // Derive HMAC key from encryption key
      const keyBuffer = await crypto.subtle.exportKey('raw', this.encryptionKey);
      hmacKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
    }

    const dataBuffer = encoder.encode(dataString);
    const signature = await crypto.subtle.sign('HMAC', hmacKey, dataBuffer);
    return this.arrayBufferToBase64(signature);
  }

  /**
   * Verify HMAC
   */
  async verifyHMAC(data: any, signature: string, secret?: string): Promise<boolean> {
    try {
      const expectedSignature = await this.generateHMAC(data, secret);
      return this.constantTimeEquals(signature, expectedSignature);
    } catch (error) {
      console.error('HMAC verification failed:', error);
      return false;
    }
  }

  /**
   * Generate a secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  /**
   * Derive key from password using PBKDF2
   */
  async deriveKeyFromPassword(
    password: string,
    salt?: Uint8Array,
    iterations?: number
  ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Generate salt if not provided
    const finalSalt = salt || crypto.getRandomValues(new Uint8Array(this.config.saltLength));
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: finalSalt,
        iterations: iterations || this.config.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt: finalSalt };
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(): Promise<void> {
    if (this.encryptionKey) {
      // Store current key in history
      this.keyHistory.set(this.keyVersion, this.encryptionKey);
    }

    // Generate new key
    await this.generateMasterKey();
    
    // Update version
    const versionNumber = parseInt(this.keyVersion.substring(1)) + 1;
    this.keyVersion = `v${versionNumber}`;

    console.log(`🔄 Encryption key rotated to ${this.keyVersion}`);
  }

  /**
   * Get current key version
   */
  getCurrentKeyVersion(): string {
    return this.keyVersion;
  }

  /**
   * Cleanup and destroy keys
   */
  destroy(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
      this.keyRotationTimer = null;
    }

    // Clear key references (actual key destruction depends on browser implementation)
    this.encryptionKey = null;
    this.keyHistory.clear();
    
    console.log('🔒 Encryption Service destroyed');
  }

  // Private methods

  private async generateMasterKey(): Promise<void> {
    try {
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        false, // Not extractable for security
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to generate master key:', error);
      throw new Error('Key generation failed');
    }
  }

  private startKeyRotationScheduler(): void {
    this.keyRotationTimer = setInterval(async () => {
      try {
        await this.rotateKey();
      } catch (error) {
        console.error('Key rotation failed:', error);
      }
    }, this.config.keyRotationInterval);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Also export the class as default
export default EncryptionService; 
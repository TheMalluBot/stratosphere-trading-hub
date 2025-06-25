
export class MessageProcessor {
  private messageRateLimit = new Map<string, number>();
  private compressionEnabled = true;

  processMessage(event: MessageEvent, subscribers: Map<string, Set<(data: any) => void>>) {
    try {
      let data = event.data;
      
      // Decompress if needed
      if (this.compressionEnabled && typeof data === 'string' && data.startsWith('compressed:')) {
        data = this.decompress(data.substring(11));
      }

      const message = JSON.parse(data);
      
      // Rate limiting check
      const messageType = message.type || 'unknown';
      const now = Date.now();
      const lastMessageTime = this.messageRateLimit.get(messageType) || 0;
      
      if (now - lastMessageTime < 50) { // 50ms rate limit
        return; // Skip this message
      }
      
      this.messageRateLimit.set(messageType, now);
      
      return message;
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      return null;
    }
  }

  notifySubscribers(type: string, data: any, subscribers: Map<string, Set<(data: any) => void>>) {
    const typeSubscribers = subscribers.get(type);
    
    if (typeSubscribers && typeSubscribers.size > 0) {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        typeSubscribers.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      });
    }
  }

  compress(data: string): string {
    // Simple compression placeholder - in production use proper compression
    return btoa(data);
  }

  private decompress(data: string): string {
    // Simple decompression placeholder
    return atob(data);
  }

  clearRateLimit() {
    this.messageRateLimit.clear();
  }
}

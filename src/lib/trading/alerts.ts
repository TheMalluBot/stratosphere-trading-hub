/**
 * Alerts and notifications system for trading events
 */

import { showDesktopNotification } from '../../utils/desktop/integration';

// Alert types
export type AlertType = 'price' | 'technical' | 'news' | 'trade' | 'system';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'disabled';

export interface AlertCondition {
  type: 'price' | 'indicator' | 'time' | 'volume' | 'custom';
  symbol?: string;
  operator?: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value?: number | string;
  indicator?: string;
  indicatorParams?: Record<string, any>;
  timeframe?: string;
  customEvaluator?: (data: any) => boolean;
}

export interface Alert {
  id: string;
  name: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  conditions: AlertCondition[];
  message: string;
  actions: AlertAction[];
  createdAt: number;
  expiresAt?: number;
  lastTriggered?: number;
  triggerCount: number;
  cooldownMinutes: number;
}

export interface AlertAction {
  type: 'notification' | 'sound' | 'email' | 'webhook' | 'trade';
  params?: Record<string, any>;
}

export interface AlertEvent {
  alertId: string;
  timestamp: number;
  data: any;
}

// In-memory alert storage
let alerts: Alert[] = [];
let alertHistory: AlertEvent[] = [];
let alertListeners: ((alert: Alert, data: any) => void)[] = [];

/**
 * Create a new alert
 * 
 * @param alert - Alert configuration
 * @returns Created alert with generated ID
 */
export const createAlert = (alert: Omit<Alert, 'id' | 'createdAt' | 'triggerCount'>): Alert => {
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    triggerCount: 0,
    status: 'active'
  };
  
  alerts.push(newAlert);
  return newAlert;
};

/**
 * Update an existing alert
 * 
 * @param alertId - ID of the alert to update
 * @param updates - Partial alert properties to update
 * @returns Updated alert or null if not found
 */
export const updateAlert = (alertId: string, updates: Partial<Alert>): Alert | null => {
  const index = alerts.findIndex(a => a.id === alertId);
  if (index === -1) return null;
  
  alerts[index] = { ...alerts[index], ...updates };
  return alerts[index];
};

/**
 * Delete an alert
 * 
 * @param alertId - ID of the alert to delete
 * @returns True if deleted, false if not found
 */
export const deleteAlert = (alertId: string): boolean => {
  const initialLength = alerts.length;
  alerts = alerts.filter(a => a.id !== alertId);
  return alerts.length < initialLength;
};

/**
 * Get all alerts, optionally filtered by status
 * 
 * @param status - Optional status filter
 * @returns Array of alerts
 */
export const getAlerts = (status?: AlertStatus): Alert[] => {
  if (status) {
    return alerts.filter(a => a.status === status);
  }
  return [...alerts];
};

/**
 * Get alert by ID
 * 
 * @param alertId - Alert ID
 * @returns Alert or null if not found
 */
export const getAlertById = (alertId: string): Alert | null => {
  return alerts.find(a => a.id === alertId) || null;
};

/**
 * Check if an alert's conditions are met
 * 
 * @param alert - Alert to evaluate
 * @param data - Data to evaluate against conditions
 * @returns True if all conditions are met
 */
export const evaluateAlertConditions = (alert: Alert, data: any): boolean => {
  // Skip if alert is not active
  if (alert.status !== 'active') return false;
  
  // Skip if in cooldown period
  if (alert.lastTriggered && alert.cooldownMinutes > 0) {
    const cooldownMs = alert.cooldownMinutes * 60 * 1000;
    if (Date.now() - alert.lastTriggered < cooldownMs) return false;
  }
  
  // Skip if expired
  if (alert.expiresAt && Date.now() > alert.expiresAt) {
    updateAlert(alert.id, { status: 'expired' });
    return false;
  }
  
  // Check all conditions
  return alert.conditions.every(condition => {
    switch (condition.type) {
      case 'price':
        if (!condition.symbol || !condition.operator || condition.value === undefined) return false;
        const price = data[condition.symbol]?.price;
        if (price === undefined) return false;
        
        switch (condition.operator) {
          case '>': return price > condition.value;
          case '<': return price < condition.value;
          case '>=': return price >= condition.value;
          case '<=': return price <= condition.value;
          case '==': return price === condition.value;
          case '!=': return price !== condition.value;
          default: return false;
        }
      
      case 'indicator':
        if (!condition.indicator || !condition.operator || condition.value === undefined) return false;
        const indicatorValue = data[condition.symbol]?.indicators?.[condition.indicator];
        if (indicatorValue === undefined) return false;
        
        switch (condition.operator) {
          case '>': return indicatorValue > condition.value;
          case '<': return indicatorValue < condition.value;
          case '>=': return indicatorValue >= condition.value;
          case '<=': return indicatorValue <= condition.value;
          case '==': return indicatorValue === condition.value;
          case '!=': return indicatorValue !== condition.value;
          default: return false;
        }
      
      case 'volume':
        if (!condition.symbol || !condition.operator || condition.value === undefined) return false;
        const volume = data[condition.symbol]?.volume;
        if (volume === undefined) return false;
        
        switch (condition.operator) {
          case '>': return volume > condition.value;
          case '<': return volume < condition.value;
          case '>=': return volume >= condition.value;
          case '<=': return volume <= condition.value;
          case '==': return volume === condition.value;
          case '!=': return volume !== condition.value;
          default: return false;
        }
      
      case 'time':
        const now = new Date();
        const timeValue = condition.value as string;
        const [hours, minutes] = timeValue.split(':').map(Number);
        return now.getHours() === hours && now.getMinutes() === minutes;
      
      case 'custom':
        return condition.customEvaluator ? condition.customEvaluator(data) : false;
      
      default:
        return false;
    }
  });
};

/**
 * Execute alert actions when triggered
 * 
 * @param alert - Triggered alert
 * @param data - Data that triggered the alert
 */
export const executeAlertActions = async (alert: Alert, data: any): Promise<void> => {
  // Update alert state
  updateAlert(alert.id, {
    status: 'triggered',
    lastTriggered: Date.now(),
    triggerCount: alert.triggerCount + 1
  });
  
  // Record in history
  alertHistory.push({
    alertId: alert.id,
    timestamp: Date.now(),
    data
  });
  
  // Execute each action
  for (const action of alert.actions) {
    try {
      switch (action.type) {
        case 'notification':
          await showDesktopNotification(
            `${alert.priority.toUpperCase()}: ${alert.name}`,
            alert.message
          );
          break;
          
        case 'sound':
          const audio = new Audio(action.params?.soundUrl || '/sounds/alert.mp3');
          audio.play();
          break;
          
        case 'email':
          // This would integrate with an email service
          console.log('Email alert:', alert.name, alert.message);
          break;
          
        case 'webhook':
          if (action.params?.url) {
            fetch(action.params.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                alert: alert.name,
                message: alert.message,
                priority: alert.priority,
                timestamp: Date.now(),
                data
              })
            }).catch(err => console.error('Webhook error:', err));
          }
          break;
          
        case 'trade':
          // This would integrate with order management
          console.log('Trade action triggered:', action.params);
          break;
      }
    } catch (error) {
      console.error(`Error executing alert action ${action.type}:`, error);
    }
  }
  
  // Notify listeners
  alertListeners.forEach(listener => {
    try {
      listener(alert, data);
    } catch (error) {
      console.error('Error in alert listener:', error);
    }
  });
};

/**
 * Process incoming market data to trigger alerts
 * 
 * @param marketData - Current market data
 */
export const processMarketData = (marketData: any): void => {
  const activeAlerts = getAlerts('active');
  
  activeAlerts.forEach(alert => {
    if (evaluateAlertConditions(alert, marketData)) {
      executeAlertActions(alert, marketData);
    }
  });
};

/**
 * Subscribe to alert events
 * 
 * @param listener - Callback function for alert events
 * @returns Unsubscribe function
 */
export const subscribeToAlerts = (listener: (alert: Alert, data: any) => void): () => void => {
  alertListeners.push(listener);
  return () => {
    alertListeners = alertListeners.filter(l => l !== listener);
  };
};

/**
 * Get alert history
 * 
 * @param limit - Maximum number of history items to return
 * @returns Array of alert events
 */
export const getAlertHistory = (limit?: number): AlertEvent[] => {
  const history = [...alertHistory].sort((a, b) => b.timestamp - a.timestamp);
  return limit ? history.slice(0, limit) : history;
};

/**
 * Reset all alerts (for testing)
 */
export const resetAlerts = (): void => {
  alerts = [];
  alertHistory = [];
};

/**
 * Create a price alert
 * 
 * @param symbol - Trading symbol
 * @param price - Target price
 * @param operator - Comparison operator
 * @param message - Alert message
 * @returns Created alert
 */
export const createPriceAlert = (
  symbol: string,
  price: number,
  operator: '>' | '<',
  message?: string
): Alert => {
  const operatorText = operator === '>' ? 'above' : 'below';
  const alertMessage = message || `${symbol} price moved ${operatorText} ${price}`;
  
  return createAlert({
    name: `${symbol} Price Alert`,
    type: 'price',
    priority: 'medium',
    status: 'active',
    conditions: [{
      type: 'price',
      symbol,
      operator,
      value: price
    }],
    message: alertMessage,
    actions: [
      { type: 'notification' },
      { type: 'sound' }
    ],
    cooldownMinutes: 5
  });
};

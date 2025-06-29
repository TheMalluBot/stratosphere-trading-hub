// Trading System Type Definitions
export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  exchange: string;
  type: 'SPOT' | 'FUTURES' | 'OPTIONS' | 'FOREX';
  status: 'TRADING' | 'BREAK' | 'HALT';
  precision: {
    price: number;
    quantity: number;
  };
  filters: {
    minPrice: number;
    maxPrice: number;
    minQty: number;
    maxQty: number;
    stepSize: number;
  };
}

export interface MarketData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  volume: number;
  volume24h: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  sparkline?: number[];
}

export interface OrderBookLevel {
  price: number;
  size: number;
  count?: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  lastUpdateId: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
  isBuyerMaker: boolean;
}

export interface Kline {
  symbol: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades: number;
  interval: string;
}

// Order Management Types
export type OrderType = 
  | 'MARKET' 
  | 'LIMIT' 
  | 'STOP_LOSS' 
  | 'STOP_LOSS_LIMIT' 
  | 'TAKE_PROFIT' 
  | 'TAKE_PROFIT_LIMIT'
  | 'TRAILING_STOP'
  | 'ICEBERG'
  | 'OCO';

export type OrderSide = 'BUY' | 'SELL';

export type OrderStatus = 
  | 'NEW' 
  | 'PARTIALLY_FILLED' 
  | 'FILLED' 
  | 'CANCELED' 
  | 'PENDING_CANCEL' 
  | 'REJECTED' 
  | 'EXPIRED';

export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTD';

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  postOnly?: boolean;
  clientOrderId?: string;
  trailingDelta?: number;
  trailingPercent?: number;
  icebergQty?: number;
  newClientOrderId?: string;
}

export interface Order {
  orderId: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  stopPrice?: number;
  status: OrderStatus;
  timeInForce: TimeInForce;
  executedQty: number;
  cummulativeQuoteQty: number;
  avgPrice: number;
  commission: number;
  commissionAsset: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQty: number;
  fills: OrderFill[];
}

export interface OrderFill {
  price: number;
  qty: number;
  commission: number;
  commissionAsset: string;
  tradeId: number;
}

export interface BracketOrder {
  entryOrder: OrderRequest;
  stopLoss?: OrderRequest;
  takeProfit?: OrderRequest;
  trailingStop?: {
    activationPrice: number;
    callbackRate: number;
  };
}

// Position Management Types
export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  percentage: number;
  leverage: number;
  margin: number;
  maintenanceMargin: number;
  marginRatio: number;
  liquidationPrice: number;
  breakEvenPrice: number;
  timestamp: number;
  duration: number;
}

export interface Portfolio {
  totalValue: number;
  availableBalance: number;
  usedMargin: number;
  freeMargin: number;
  marginLevel: number;
  unrealizedPnl: number;
  realizedPnl: number;
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
  totalCommission: number;
  positions: Position[];
  balances: Balance[];
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

// Alert System Types
export type AlertType = 
  | 'PRICE_ABOVE' 
  | 'PRICE_BELOW' 
  | 'PRICE_CHANGE' 
  | 'VOLUME_SPIKE' 
  | 'TECHNICAL_INDICATOR'
  | 'PATTERN_RECOGNITION'
  | 'VOLATILITY'
  | 'ORDER_FILLED'
  | 'POSITION_PNL';

export type AlertDelivery = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'AUDIO';

export interface Alert {
  id: string;
  name: string;
  symbol: string;
  type: AlertType;
  condition: {
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    field: string;
  };
  delivery: AlertDelivery[];
  enabled: boolean;
  triggered: boolean;
  triggerCount: number;
  lastTriggered?: number;
  created: number;
  expires?: number;
  message: string;
  sound?: string;
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  defaultCondition: Alert['condition'];
  defaultDelivery: AlertDelivery[];
}

// WebSocket Types
export interface WebSocketMessage {
  stream: string;
  data: any;
  timestamp: number;
}

export interface WebSocketSubscription {
  stream: string;
  symbol?: string;
  interval?: string;
  depth?: number;
  callback: (data: any) => void;
}

export interface WebSocketConnection {
  id: string;
  url: string;
  status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  subscriptions: Map<string, WebSocketSubscription>;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  lastPing: number;
  latency: number;
}

// Risk Management Types
export interface RiskLimits {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxLeverage: number;
  maxOrderValue: number;
  maxOpenOrders: number;
  allowedSymbols?: string[];
  blockedSymbols?: string[];
}

export interface RiskMetrics {
  currentRisk: number;
  maxRisk: number;
  dailyPnl: number;
  dailyLossLimit: number;
  openPositions: number;
  maxPositions: number;
  leverage: number;
  maxLeverage: number;
  marginUsage: number;
  warnings: RiskWarning[];
}

export interface RiskWarning {
  type: 'POSITION_SIZE' | 'DAILY_LOSS' | 'LEVERAGE' | 'MARGIN' | 'CORRELATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  symbol?: string;
  value: number;
  limit: number;
}

// Broker Integration Types
export interface BrokerAccount {
  id: string;
  name: string;
  broker: 'MEXC' | 'BINANCE' | 'INTERACTIVE_BROKERS' | 'CUSTOM';
  type: 'SPOT' | 'MARGIN' | 'FUTURES' | 'OPTIONS';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  balance: Portfolio;
  apiKey: string;
  secretKey: string;
  testnet: boolean;
  permissions: string[];
  rateLimits: {
    orders: number;
    requests: number;
    weight: number;
  };
}

export interface ExecutionReport {
  orderId: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  executionType: 'NEW' | 'CANCELED' | 'REPLACED' | 'REJECTED' | 'TRADE' | 'EXPIRED';
  orderStatus: OrderStatus;
  rejectReason?: string;
  price: number;
  quantity: number;
  lastExecutedPrice?: number;
  lastExecutedQuantity?: number;
  cumulativeFilledQuantity: number;
  averagePrice: number;
  commission: number;
  commissionAsset: string;
  timestamp: number;
  transactionTime: number;
  brokerId: string;
}

// Paper Trading Types
export interface PaperAccount {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  created: number;
  resetDate?: number;
}

export interface PaperTrade {
  id: string;
  accountId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  commission: number;
  entryTime: number;
  exitTime?: number;
  duration?: number;
  reason?: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'LIQUIDATION';
}

// Trading Interface State Types
export interface TradingInterfaceState {
  selectedSymbol: string;
  watchlist: string[];
  activeOrders: Order[];
  positions: Position[];
  portfolio: Portfolio;
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  alerts: Alert[];
  marketData: Map<string, MarketData>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface QuickTradeSettings {
  defaultQuantity: number;
  presetSizes: number[];
  autoStopLoss: boolean;
  stopLossPercent: number;
  autoTakeProfit: boolean;
  takeProfitPercent: number;
  confirmationRequired: boolean;
  hotkeysEnabled: boolean;
  soundEnabled: boolean;
}

export interface TradingPreferences {
  theme: 'light' | 'dark';
  layout: 'compact' | 'standard' | 'professional';
  panels: {
    marketWatch: boolean;
    orderBook: boolean;
    positions: boolean;
    alerts: boolean;
    news: boolean;
  };
  notifications: {
    orders: boolean;
    positions: boolean;
    alerts: boolean;
    sounds: boolean;
  };
  quickTrade: QuickTradeSettings;
  riskLimits: RiskLimits;
}

// Chart Integration Types
export interface ChartData {
  symbol: string;
  interval: string;
  data: Kline[];
  indicators: ChartIndicator[];
  drawings: ChartDrawing[];
}

export interface ChartIndicator {
  id: string;
  type: string;
  parameters: Record<string, any>;
  visible: boolean;
  color: string;
}

export interface ChartDrawing {
  id: string;
  type: 'trendline' | 'rectangle' | 'circle' | 'text';
  points: Array<{ time: number; price: number }>;
  style: Record<string, any>;
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  latency: {
    websocket: number;
    orderExecution: number;
    dataProcessing: number;
  };
  throughput: {
    messagesPerSecond: number;
    ordersPerSecond: number;
    updatesPerSecond: number;
  };
  reliability: {
    uptime: number;
    errorRate: number;
    reconnections: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Error Types
export interface TradingError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component: string;
  symbol?: string;
}

export interface ErrorHandler {
  onOrderError: (error: TradingError) => void;
  onConnectionError: (error: TradingError) => void;
  onDataError: (error: TradingError) => void;
  onRiskError: (error: TradingError) => void;
} 
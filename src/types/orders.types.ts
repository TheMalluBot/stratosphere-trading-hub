// Advanced Order Management System - Type Definitions

export type OrderType = 
  | 'MARKET' 
  | 'LIMIT' 
  | 'STOP_LOSS' 
  | 'STOP_LOSS_LIMIT' 
  | 'TAKE_PROFIT' 
  | 'TAKE_PROFIT_LIMIT'
  | 'TRAILING_STOP'
  | 'ICEBERG'
  | 'TWAP'
  | 'VWAP'
  | 'POV'
  | 'IMPLEMENTATION_SHORTFALL'
  | 'ARRIVAL_PRICE'
  | 'CONDITIONAL'
  | 'BRACKET'
  | 'OCO';

export type OrderSide = 'BUY' | 'SELL';

export type OrderStatus = 
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'PARTIALLY_FILLED' 
  | 'FILLED' 
  | 'CANCELED' 
  | 'PENDING_CANCEL' 
  | 'REJECTED' 
  | 'EXPIRED'
  | 'FAILED'
  | 'SUSPENDED';

export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTD' | 'DAY' | 'GFS' | 'GTX';

export type ExecutionType = 
  | 'NEW' 
  | 'CANCELED' 
  | 'REPLACED' 
  | 'REJECTED' 
  | 'TRADE' 
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CALCULATED'
  | 'RESTATED';

export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type VenueType = 'EXCHANGE' | 'DARK_POOL' | 'ECN' | 'MARKET_MAKER' | 'CROSSING_NETWORK';

// Core Order Interfaces
export interface OrderRequest {
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: TimeInForce;
  priority?: OrderPriority;
  
  // Advanced order parameters
  displayQuantity?: number; // For iceberg orders
  minQuantity?: number;
  maxFloor?: number;
  participationRate?: number; // For POV orders
  startTime?: number;
  endTime?: number;
  
  // Execution preferences
  preferredVenues?: string[];
  excludedVenues?: string[];
  allowCrossing?: boolean;
  allowPartialFills?: boolean;
  
  // Risk parameters
  maxSlippage?: number;
  maxCommission?: number;
  
  // Conditional parameters
  conditions?: OrderCondition[];
  
  // Metadata
  strategy?: string;
  account?: string;
  tags?: string[];
  notes?: string;
}

export interface Order {
  orderId: string;
  clientOrderId: string;
  parentOrderId?: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  
  // Quantities
  originalQuantity: number;
  executedQuantity: number;
  remainingQuantity: number;
  displayQuantity?: number;
  
  // Prices
  price?: number;
  stopPrice?: number;
  averagePrice: number;
  lastExecutedPrice?: number;
  
  // Timing
  timeInForce: TimeInForce;
  createdAt: number;
  submittedAt?: number;
  acknowledgedAt?: number;
  lastModifiedAt?: number;
  expiresAt?: number;
  
  // Execution details
  fills: OrderFill[];
  totalCommission: number;
  totalFees: number;
  
  // Routing information
  venues: OrderVenue[];
  routingDecision?: RoutingDecision;
  
  // Performance metrics
  submissionLatency?: number;
  acknowledgmentLatency?: number;
  fillLatency?: number;
  slippage?: number;
  
  // Risk and compliance
  riskChecks: RiskCheck[];
  complianceFlags: ComplianceFlag[];
  
  // Modification history
  modifications: OrderModification[];
  
  // Metadata
  strategy?: string;
  account: string;
  tags: string[];
  notes?: string;
}

export interface OrderFill {
  fillId: string;
  orderId: string;
  venue: string;
  symbol?: string;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: number;
  commission: number;
  fees: number;
  commissionAsset: string;
  tradeId?: string;
  counterparty?: string;
  settlementDate?: number;
  
  // Execution quality metrics
  priceImprovement?: number;
  effectiveSpread?: number;
  marketImpact?: number;
}

export interface OrderVenue {
  venue: string;
  venueType: VenueType;
  quantity: number;
  executedQuantity: number;
  averagePrice?: number;
  status: OrderStatus;
  submittedAt?: number;
  acknowledgedAt?: number;
  
  // Venue-specific details
  venueOrderId?: string;
  routingReason: string;
  expectedFillTime?: number;
  liquidityFlag?: 'MAKER' | 'TAKER' | 'UNKNOWN';
}

// Smart Order Routing
export interface RoutingDecision {
  algorithm: string;
  timestamp: number;
  venues: VenueAllocation[];
  reasoning: string;
  expectedCost: number;
  expectedImpact: number;
  confidence: number;
}

export interface VenueAllocation {
  venue: string;
  percentage: number;
  quantity: number;
  expectedPrice: number;
  expectedCommission: number;
  liquidityScore: number;
  latencyScore: number;
  costScore: number;
}

export interface VenueAnalytics {
  venue: string;
  
  // Liquidity metrics
  availableLiquidity: number;
  averageSpread: number;
  marketDepth: number;
  hiddenLiquidity: number;
  
  // Performance metrics
  fillRate: number;
  averageFillTime: number;
  priceImprovement: number;
  rejectionRate: number;
  
  // Cost metrics
  commission: number;
  fees: number;
  rebates: number;
  effectiveCost: number;
  
  // Quality metrics
  executionQuality: number;
  reliabilityScore: number;
  latency: number;
  
  // Historical data
  volume24h: number;
  trades24h: number;
  lastUpdate: number;
}

// Order Conditions
export interface OrderCondition {
  id: string;
  type: 'PRICE' | 'TIME' | 'VOLUME' | 'INDICATOR' | 'NEWS' | 'CUSTOM';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number | string;
  field: string;
  symbol?: string;
  timeframe?: string;
  
  // Condition state
  isMet: boolean;
  lastChecked: number;
  metAt?: number;
}

// Algorithmic Order Parameters
export interface TWAPParameters {
  startTime: number;
  endTime: number;
  intervals: number;
  maxParticipationRate?: number;
  priceLimit?: number;
  allowCrossing?: boolean;
}

export interface VWAPParameters {
  startTime: number;
  endTime: number;
  maxParticipationRate: number;
  priceLimit?: number;
  volumeProfile?: 'HISTORICAL' | 'INTRADAY' | 'CUSTOM';
  customProfile?: number[];
}

export interface POVParameters {
  participationRate: number;
  maxParticipationRate: number;
  minParticipationRate: number;
  startTime?: number;
  endTime?: number;
  volumeLookback: number;
}

export interface ImplementationShortfallParameters {
  riskAversion: number;
  marketImpactModel: string;
  timingRiskModel: string;
  maxParticipationRate: number;
  startTime: number;
  endTime: number;
}

// Order Analytics
export interface OrderAnalytics {
  orderId: string;
  
  // Execution metrics
  executionTime: number;
  fillRate: number;
  averageSlippage: number;
  priceImprovement: number;
  marketImpact: number;
  
  // Cost analysis
  totalCost: number;
  commission: number;
  fees: number;
  implicitCosts: number;
  opportunityCost: number;
  
  // Quality metrics
  executionQuality: number;
  implementationShortfall: number;
  effectiveSpread: number;
  
  // Timing analysis
  submissionLatency: number;
  acknowledgmentLatency: number;
  firstFillLatency: number;
  completionLatency: number;
  
  // Venue analysis
  venuePerformance: VenuePerformance[];
  bestVenue: string;
  worstVenue: string;
}

export interface VenuePerformance {
  venue: string;
  quantity: number;
  fillRate: number;
  averagePrice: number;
  slippage: number;
  latency: number;
  cost: number;
  score: number;
}

// Risk Management
export interface RiskCheck {
  id: string;
  type: 'PRE_TRADE' | 'REAL_TIME' | 'POST_TRADE';
  rule: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message?: string;
  timestamp: number;
  
  // Risk metrics
  exposureChange: number;
  leverageImpact: number;
  concentrationRisk: number;
  liquidityRisk: number;
  
  // Limits
  limit?: number;
  currentValue?: number;
  utilizationPercentage?: number;
}

export interface ComplianceFlag {
  id: string;
  type: 'REGULATORY' | 'INTERNAL' | 'BEST_EXECUTION' | 'MARKET_ABUSE';
  severity: 'INFO' | 'WARNING' | 'VIOLATION';
  rule: string;
  description: string;
  timestamp: number;
  requiresAction: boolean;
  actionTaken?: string;
}

// Order Modification
export interface OrderModification {
  modificationId: string;
  orderId: string;
  timestamp: number;
  type: 'PRICE' | 'QUANTITY' | 'TIF' | 'VENUE' | 'CANCEL' | 'SUSPEND';
  
  // Before/after values
  previousValue?: any;
  newValue?: any;
  
  // Modification details
  reason: string;
  requestedBy: string;
  approved: boolean;
  approvedBy?: string;
  
  // Impact assessment
  riskImpact: number;
  costImpact: number;
  executionImpact: number;
}

// Commission and Fee Calculation
export interface CommissionStructure {
  venue: string;
  assetClass: string;
  
  // Fee tiers
  tiers: CommissionTier[];
  
  // Fee types
  makerFee: number;
  takerFee: number;
  regulatoryFee: number;
  clearingFee: number;
  
  // Rebates
  makerRebate: number;
  liquidityRebate: number;
  
  // Minimums and maximums
  minimumCommission: number;
  maximumCommission: number;
  
  // Currency
  currency: string;
  
  // Effective dates
  effectiveFrom: number;
  effectiveTo?: number;
}

export interface CommissionTier {
  volumeThreshold: number;
  rate: number;
  flatFee?: number;
  rebateRate?: number;
}

export interface CommissionCalculation {
  orderId: string;
  venue: string;
  
  // Base calculations
  notionalValue: number;
  commissionRate: number;
  baseCommission: number;
  
  // Adjustments
  volumeDiscount: number;
  rebates: number;
  regulatoryFees: number;
  clearingFees: number;
  
  // Final amounts
  totalCommission: number;
  netCommission: number;
  
  // Breakdown
  breakdown: CommissionBreakdown[];
}

export interface CommissionBreakdown {
  type: string;
  description: string;
  amount: number;
  currency: string;
  rate?: number;
  basis?: number;
}

// Order History and Search
export interface OrderHistoryFilter {
  dateFrom?: number;
  dateTo?: number;
  symbols?: string[];
  sides?: OrderSide[];
  types?: OrderType[];
  statuses?: OrderStatus[];
  venues?: string[];
  strategies?: string[];
  accounts?: string[];
  tags?: string[];
  
  // Amount filters
  minQuantity?: number;
  maxQuantity?: number;
  minValue?: number;
  maxValue?: number;
  
  // Performance filters
  minSlippage?: number;
  maxSlippage?: number;
  minFillRate?: number;
  maxFillRate?: number;
  
  // Text search
  searchText?: string;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

export interface OrderHistoryResult {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  
  // Aggregated metrics
  summary: OrderHistorySummary;
}

export interface OrderHistorySummary {
  totalOrders: number;
  totalVolume: number;
  totalValue: number;
  totalCommission: number;
  averageFillRate: number;
  averageSlippage: number;
  averageExecutionTime: number;
  
  // Status breakdown
  statusBreakdown: Record<OrderStatus, number>;
  
  // Venue breakdown
  venueBreakdown: Record<string, VenueStats>;
  
  // Performance metrics
  bestExecutingVenue: string;
  worstExecutingVenue: string;
  totalSavings: number;
  totalCosts: number;
}

export interface VenueStats {
  orderCount: number;
  volume: number;
  fillRate: number;
  averageSlippage: number;
  averageLatency: number;
  totalCommission: number;
}

// Order Templates
export interface OrderTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Template parameters
  orderType: OrderType;
  defaultQuantity?: number;
  priceOffset?: number;
  timeInForce: TimeInForce;
  
  // Advanced parameters
  algorithmicParams?: any;
  riskLimits?: any;
  venuePreferences?: string[];
  
  // Metadata
  createdBy: string;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
  isPublic: boolean;
  tags: string[];
}

// Performance Monitoring
export interface OrderPerformanceMetrics {
  // Latency metrics (microseconds)
  validationLatency: number;
  routingLatency: number;
  submissionLatency: number;
  acknowledgmentLatency: number;
  firstFillLatency: number;
  completionLatency: number;
  
  // Throughput metrics
  ordersPerSecond: number;
  fillsPerSecond: number;
  modificationsPerSecond: number;
  cancellationsPerSecond: number;
  
  // Quality metrics
  fillRate: number;
  rejectionRate: number;
  slippageStdDev: number;
  priceImprovementRate: number;
  
  // System metrics
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  databaseLatency: number;
  
  // Error metrics
  errorRate: number;
  timeoutRate: number;
  retryRate: number;
  
  // Timestamp
  timestamp: number;
  measurementPeriod: number;
}

// Error Handling
export interface OrderError {
  errorId: string;
  orderId?: string;
  errorCode: string;
  errorType: 'VALIDATION' | 'ROUTING' | 'EXECUTION' | 'SETTLEMENT' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: any;
  timestamp: number;
  
  // Context
  component: string;
  venue?: string;
  symbol?: string;
  
  // Resolution
  isResolved: boolean;
  resolvedAt?: number;
  resolution?: string;
  
  // Impact
  affectedOrders: string[];
  financialImpact?: number;
}

// Event Types
export interface OrderEvent {
  eventId: string;
  orderId: string;
  eventType: 'CREATED' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'FILLED' | 'CANCELED' | 'REJECTED' | 'MODIFIED' | 'EXPIRED';
  timestamp: number;
  data: any;
  source: string;
  
  // Sequencing
  sequenceNumber: number;
  previousEventId?: string;
  
  // Metadata
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}

// Configuration
export interface OrderManagerConfig {
  // System limits
  maxOrdersPerSecond: number;
  maxOrderValue: number;
  maxOrderSize: number;
  maxOpenOrders: number;
  
  // Timeouts (milliseconds)
  orderTimeout: number;
  fillTimeout: number;
  cancelTimeout: number;
  
  // Retry settings
  maxRetries: number;
  retryDelay: number;
  retryBackoffMultiplier: number;
  
  // Risk settings
  enablePreTradeRisk: boolean;
  enableRealTimeRisk: boolean;
  enablePostTradeRisk: boolean;
  
  // Performance settings
  enablePerformanceTracking: boolean;
  metricsCollectionInterval: number;
  
  // Storage settings
  orderHistoryRetentionDays: number;
  compressionEnabled: boolean;
  
  // Routing settings
  defaultRoutingAlgorithm: string;
  enableSmartRouting: boolean;
  routingUpdateInterval: number;
}

// Webhook and Notifications
export interface OrderNotification {
  notificationId: string;
  orderId: string;
  type: 'FILL' | 'CANCEL' | 'REJECT' | 'EXPIRE' | 'RISK_BREACH' | 'SYSTEM_ERROR';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  message: string;
  timestamp: number;
  
  // Delivery settings
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'SLACK')[];
  recipients: string[];
  
  // Delivery status
  deliveryStatus: Record<string, 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'>;
  deliveryAttempts: number;
  lastDeliveryAttempt?: number;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers: Record<string, string>;
  
  // Security
  secret?: string;
  signatureHeader?: string;
  
  // Retry settings
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  
  // Status
  isActive: boolean;
  lastSuccessful?: number;
  lastFailed?: number;
  failureCount: number;
} 
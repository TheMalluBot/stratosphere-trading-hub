# Stratosphere Trading Hub Testing Strategy

This document outlines the testing strategy for the Stratosphere Trading Hub application.

## Testing Levels

### 1. Unit Tests

Unit tests focus on testing individual functions, hooks, and components in isolation.

**Tools:**
- Jest
- React Testing Library
- Mock Service Worker (for API mocking)

**Key Areas:**
- Utility functions
- Custom React hooks
- UI components
- State management

### 2. Integration Tests

Integration tests verify that different parts of the application work together correctly.

**Tools:**
- Cypress
- Jest

**Key Areas:**
- Component interactions
- Data flow between components
- API integration
- WebSocket handling

### 3. End-to-End Tests

End-to-end tests simulate real user scenarios across the entire application.

**Tools:**
- Cypress
- Playwright

**Key Areas:**
- User workflows
- Authentication
- Trading operations
- System integration

### 4. Performance Tests

Performance tests measure the responsiveness and stability of the application.

**Tools:**
- Lighthouse
- Custom performance monitoring

**Key Areas:**
- Chart rendering performance
- WebSocket data handling
- UI responsiveness
- Memory usage

## Test Organization

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── utils/
├── integration/
│   ├── api/
│   ├── websocket/
│   └── state/
├── e2e/
│   ├── auth/
│   ├── trading/
│   └── portfolio/
└── performance/
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/hooks/useMarketData.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### End-to-End Tests

```bash
# Open Cypress test runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run
```

### Performance Tests

```bash
# Run Lighthouse CI
npm run lighthouse

# Run custom performance tests
npm run test:performance
```

## Test Examples

### Unit Test Example (React Hook)

```typescript
// tests/unit/hooks/useWebSocket.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useWebSocket } from '../../../src/hooks/useWebSocket';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  readyState = 0;
  send = jest.fn();
  close = jest.fn();

  constructor() {
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen();
    }, 0);
  }
}

global.WebSocket = MockWebSocket as any;

describe('useWebSocket', () => {
  it('should connect to WebSocket', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocket('wss://test.com')
    );

    expect(result.current.isConnected).toBe(false);
    await waitForNextUpdate();
    expect(result.current.isConnected).toBe(true);
  });

  it('should send messages', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocket('wss://test.com')
    );

    await waitForNextUpdate();
    act(() => {
      result.current.send({ type: 'test', data: 'message' });
    });

    expect(result.current.socket?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'test', data: 'message' })
    );
  });
});
```

### Component Test Example

```typescript
// tests/unit/components/Chart.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Chart } from '../../../src/components/trading/Chart';

// Mock lightweight-charts
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn().mockReturnValue({
    applyOptions: jest.fn(),
    resize: jest.fn(),
    remove: jest.fn(),
    timeScale: jest.fn().mockReturnValue({
      fitContent: jest.fn(),
      subscribeVisibleTimeRangeChange: jest.fn(),
    }),
    addCandlestickSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
    }),
    addHistogramSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
    }),
    addLineSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      createPriceLine: jest.fn(),
    }),
    subscribeCrosshairMove: jest.fn(),
    removeSeries: jest.fn(),
  }),
}));

describe('Chart Component', () => {
  const mockData = [
    {
      timestamp: 1625945400000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000,
    },
    {
      timestamp: 1625946300000,
      open: 102,
      high: 107,
      low: 101,
      close: 105,
      volume: 1500,
    },
  ];

  it('renders chart component', () => {
    render(
      <Chart
        symbol="BTC/USD"
        data={mockData}
        width={800}
        height={500}
        timeframe="1h"
      />
    );

    // Chart container should be in the document
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <Chart
        symbol="BTC/USD"
        data={[]}
        width={800}
        height={500}
        timeframe="1h"
        isLoading={true}
      />
    );

    expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
  });
});
```

### End-to-End Test Example

```typescript
// cypress/integration/trading/order_placement.spec.ts
describe('Order Placement', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('POST', '/api/auth/signin', {
      statusCode: 200,
      body: { token: 'fake-token', user: { id: '1', name: 'Test User' } },
    });

    // Mock market data
    cy.intercept('GET', '/api/market/symbols', {
      statusCode: 200,
      body: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
    });

    cy.intercept('GET', '/api/market/quote/BTC/USD', {
      statusCode: 200,
      body: {
        symbol: 'BTC/USD',
        bid: 50000,
        ask: 50100,
        last: 50050,
      },
    });

    // Login and navigate to trading page
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=trading-nav]').click();
  });

  it('should place a market buy order', () => {
    // Mock order submission
    cy.intercept('POST', '/api/orders', {
      statusCode: 200,
      body: {
        id: 'order-123',
        symbol: 'BTC/USD',
        side: 'buy',
        type: 'market',
        quantity: 0.1,
        status: 'filled',
        filledPrice: 50100,
      },
    });

    // Select symbol
    cy.get('[data-testid=symbol-selector]').click();
    cy.get('[data-testid=symbol-item-BTC/USD]').click();

    // Select order type
    cy.get('[data-testid=order-type-selector]').click();
    cy.get('[data-testid=order-type-market]').click();

    // Select buy side
    cy.get('[data-testid=side-buy]').click();

    // Enter quantity
    cy.get('[data-testid=quantity-input]').type('0.1');

    // Submit order
    cy.get('[data-testid=place-order-button]').click();

    // Verify success message
    cy.get('[data-testid=order-success-message]').should('be.visible');
    cy.get('[data-testid=order-success-message]').should(
      'contain',
      'Market order filled at $50,100.00'
    );

    // Verify order appears in order history
    cy.get('[data-testid=orders-tab]').click();
    cy.get('[data-testid=order-row-order-123]').should('be.visible');
    cy.get('[data-testid=order-row-order-123]').should('contain', 'BTC/USD');
    cy.get('[data-testid=order-row-order-123]').should('contain', 'Buy');
    cy.get('[data-testid=order-row-order-123]').should('contain', 'Market');
    cy.get('[data-testid=order-row-order-123]').should('contain', '0.1');
    cy.get('[data-testid=order-row-order-123]').should('contain', 'Filled');
  });
});
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run Lighthouse CI
        run: npm run lighthouse
```

## Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Key workflows and data flows
- E2E Tests: Critical user journeys
- Performance Tests: Baseline metrics for key operations

## Best Practices

1. **Write tests first** for critical functionality (TDD approach)
2. **Mock external dependencies** to isolate the code being tested
3. **Use realistic test data** that mimics production scenarios
4. **Test edge cases** and error conditions
5. **Keep tests independent** from each other
6. **Optimize test performance** to maintain fast feedback cycles
7. **Monitor test coverage** to identify untested code paths
8. **Integrate testing into CI/CD pipeline** for automated verification

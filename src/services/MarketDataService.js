// Service for fetching market data from external APIs
// This is a simulation service that generates mock data for demonstration

export class MarketDataService {
  constructor() {
    this.baseUrl = 'https://api.example.com'; // Would be a real API endpoint in production
    this.markets = {
      'polymarket-btc-30000': {
        id: 'polymarket-btc-30000',
        name: 'Will BTC close above $30,000 in 2025?',
        currentPrice: 0.5, // 50% probability
        volume24h: 15000,
        liquidity: 250000,
        createdAt: '2023-11-01T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z'
      },
      'polymarket-eth-3000': {
        id: 'polymarket-eth-3000',
        name: 'Will ETH close above $3,000 in 2025?',
        currentPrice: 0.65, // 65% probability
        volume24h: 8500,
        liquidity: 120000,
        createdAt: '2023-11-15T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z'
      },
      'polymarket-election-2024': {
        id: 'polymarket-election-2024',
        name: 'Who will win the 2024 US election?',
        currentPrice: 0.48, // 48% probability
        volume24h: 32000,
        liquidity: 450000,
        createdAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-11-06T23:59:59Z'
      }
    };
  }

  async getMarketData(marketId) {
    // In a real implementation, this would make an API call
    // For demonstration, we'll return mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const market = this.markets[marketId];
        if (market) {
          // Add slight randomness to simulate price changes
          const randomChange = (Math.random() - 0.5) * 0.02; // +/- 1% max change
          market.currentPrice = Math.max(0.01, Math.min(0.99, market.currentPrice + randomChange));
          
          resolve({
            ...market,
            lastUpdated: new Date().toISOString()
          });
        } else {
          reject(new Error(`Market with ID ${marketId} not found`));
        }
      }, 300); // Simulate network delay
    });
  }

  async getHistoricalPrices(marketId, days = 30) {
    // In a real implementation, this would fetch historical data from an API
    // For demonstration, we'll generate mock historical data
    return new Promise((resolve) => {
      setTimeout(() => {
        const market = this.markets[marketId];
        if (!market) {
          resolve([]);
          return;
        }
        
        const now = new Date();
        const data = [];
        
        // Generate data points for the past 'days'
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          
          // Generate a somewhat realistic price series
          // Starting from the current price and working backward with some randomness
          const daysFactor = i / days;
          const basePrice = market.currentPrice * (0.7 + (daysFactor * 0.6));
          const randomFactor = (Math.random() - 0.5) * 0.1;
          const price = Math.max(0.01, Math.min(0.99, basePrice + randomFactor));
          
          data.push({
            timestamp: date.toISOString(),
            price,
            volume: Math.floor(Math.random() * market.volume24h * 0.8) + (market.volume24h * 0.2)
          });
        }
        
        resolve(data);
      }, 500); // Simulate network delay
    });
  }

  async getMarkets() {
    // Return all available markets
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Object.values(this.markets));
      }, 300);
    });
  }
}

// Create and export singleton instance
export const marketDataService = new MarketDataService();

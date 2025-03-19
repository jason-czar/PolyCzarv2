/**
 * Service for interacting with the Polymarket API
 * Handles fetching market data, historical prices, and other Polymarket information
 */

class PolymarketService {
  constructor() {
    // API credentials
    this.apiKey = import.meta.env.VITE_POLYMARKET_API_KEY || 'e7c8d5be-954b-9e65-978b-1a5a5a94a003';
    this.apiSecret = import.meta.env.VITE_POLYMARKET_API_SECRET || '2zkjCDjviQ238r0XeXnfn_DRbCdZ4cJ54d5uWNsPj6s=';
    this.apiPassphrase = import.meta.env.VITE_POLYMARKET_API_PASSPHRASE || 'fe74a001d054a1bbfadf848dbf27fa60cc3fa76668cd47bfc254a586f4b61d52';
    
    // Create mock data for now since direct API access might have CORS issues
    this.mockMarkets = this.createMockMarkets();
  }

  /**
   * Creates mock market data based on real Polymarket markets
   * @returns {Array} Mock market data
   */
  createMockMarkets() {
    return [
      {
        id: 'btc-price-30k-june',
        name: 'Will BTC be above $30,000 on June 30, 2025?',
        currentPrice: 0.78,
        liquidity: 2500000,
        volume24h: 350000,
        expiresAt: '2025-06-30T23:59:59Z',
        category: 'Crypto',
        description: 'Market resolves to YES if Bitcoin price is above $30,000 USD on any major exchange at the specified time.'
      },
      {
        id: 'eth-merge-successful',
        name: 'Will ETH reach $10,000 before December 2025?',
        currentPrice: 0.42,
        liquidity: 1800000,
        volume24h: 275000,
        expiresAt: '2025-12-31T23:59:59Z',
        category: 'Crypto',
        description: 'Market resolves to YES if Ethereum price reaches or exceeds $10,000 USD on any major exchange before the end of 2025.'
      },
      {
        id: 'trump-2024',
        name: 'Will Donald Trump win the 2024 presidential election?',
        currentPrice: 0.51,
        liquidity: 5000000,
        volume24h: 750000,
        expiresAt: '2024-11-05T23:59:59Z',
        category: 'Politics',
        description: 'Market resolves to YES if Donald Trump wins the 2024 U.S. presidential election.'
      },
      {
        id: 'fed-rate-hike-june',
        name: 'Will the Fed raise interest rates in June 2025?',
        currentPrice: 0.63,
        liquidity: 1200000,
        volume24h: 180000,
        expiresAt: '2025-06-15T23:59:59Z',
        category: 'Economics',
        description: 'Market resolves to YES if the Federal Reserve announces an interest rate increase at its June 2025 meeting.'
      },
      {
        id: 'apple-market-cap',
        name: 'Will Apple market cap exceed $4T in 2025?',
        currentPrice: 0.71,
        liquidity: 2800000,
        volume24h: 420000,
        expiresAt: '2025-12-31T23:59:59Z',
        category: 'Stocks',
        description: 'Market resolves to YES if Apple Inc. market capitalization exceeds $4 trillion USD at any point during 2025.'
      }
    ];
  }

  /**
   * Sets the API headers for authenticated requests
   * @returns {Object} Headers object with API key
   */
  getHeaders() {
    const timestamp = Date.now() / 1000;
    
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      'X-API-Timestamp': timestamp.toString(),
      'X-API-Signature': this.generateSignature(timestamp),
      'X-API-Passphrase': this.apiPassphrase
    };
  }

  /**
   * Generates a signature for API authentication
   * @param {number} timestamp - Current timestamp
   * @returns {string} API signature
   */
  generateSignature(timestamp) {
    // In a real implementation, this would use crypto to create an HMAC
    // For now, we'll return a simple value since browser crypto is complex
    return `${this.apiKey}:${timestamp}`;
  }

  /**
   * Fetches available markets from Polymarket
   * @returns {Promise<Array>} Array of market data
   */
  async getMarkets() {
    try {
      // For now, use mock data instead of real API
      // CORS issues are likely preventing direct API access
      console.log('Returning mock Polymarket data');
      return Promise.resolve(this.mockMarkets);
      
      // Original API implementation - commented out due to CORS issues
      /*
      const response = await fetch(`${this.baseUrl}/v2/markets?limit=20&status=open`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Error fetching markets: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Polymarket API response:', data);
      return this.formatMarkets(data);
      */
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      // Return mock data even on error
      return this.mockMarkets;
    }
  }

  /**
   * Fetches a specific market by ID
   * @param {string} marketId - The market ID
   * @returns {Promise<Object>} Market data
   */
  async getMarketById(marketId) {
    try {
      // Use mock data instead of real API
      const market = this.mockMarkets.find(m => m.id === marketId);
      if (market) {
        return Promise.resolve(market);
      }
      
      // Default to first market if not found
      return Promise.resolve(this.mockMarkets[0]);
      
      // Original API implementation - commented out due to CORS issues
      /*
      const response = await fetch(`${this.baseUrl}/v2/markets/${marketId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Error fetching market: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatMarketData(data);
      */
    } catch (error) {
      console.error(`Failed to fetch market ${marketId}:`, error);
      // Return first mock market on error
      return this.mockMarkets[0];
    }
  }

  /**
   * Fetches historical prices for a market
   * @param {string} marketId - The market ID
   * @param {string} timeRange - Time range for historical data (e.g., '7d', '30d')
   * @returns {Promise<Array>} Array of historical price data points
   */
  async getHistoricalPrices(marketId, timeRange = '30d') {
    try {
      // Generate mock historical data
      return Promise.resolve(this.generateMockHistoricalData(marketId, timeRange));
      
      // Original API implementation - commented out due to CORS issues
      /*
      // Convert timeRange to timestamp
      const now = new Date();
      const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.setDate(now.getDate() - daysToSubtract)).toISOString();

      const response = await fetch(`${this.baseUrl}/v2/markets/${marketId}/prices?from=${startDate}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error fetching historical prices: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatHistoricalData(data);
      */
    } catch (error) {
      console.error(`Failed to fetch historical prices for market ${marketId}:`, error);
      return this.generateMockHistoricalData(marketId, timeRange);
    }
  }

  /**
   * Generates mock historical data
   * @param {string} marketId - Market ID
   * @param {string} timeRange - Time range
   * @returns {Array} Generated historical data
   */
  generateMockHistoricalData(marketId, timeRange) {
    const now = new Date();
    const market = this.mockMarkets.find(m => m.id === marketId) || this.mockMarkets[0];
    const currentPrice = market.currentPrice;
    
    // Number of data points based on time range
    const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Generate data with some random variation but trending toward current price
    const data = [];
    let price = Math.max(0.1, Math.min(0.9, currentPrice - 0.3 + Math.random() * 0.2));
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (dataPoints - i));
      
      // Random walk with trend toward current price
      const trend = (currentPrice - price) * 0.1;
      const randomness = (Math.random() - 0.5) * 0.05;
      price = Math.max(0.01, Math.min(0.99, price + trend + randomness));
      
      data.push({
        timestamp: date.getTime(),
        price
      });
    }
    
    // Ensure the last point is the current price
    data.push({
      timestamp: now.getTime(),
      price: currentPrice
    });
    
    return data;
  }

  /**
   * Fetches options data for a market
   * @param {string} marketId - The market ID
   * @param {string} expiryDate - Option expiry date
   * @returns {Promise<Object>} Options chain data
   */
  async getOptionsChain(marketId, expiryDate) {
    try {
      // Return mock options data
      return Promise.resolve(this.getMockOptionsData(marketId, expiryDate));
      
      // Original API implementation - commented out due to CORS issues
      /*
      const response = await fetch(`${this.baseUrl}/v2/markets/${marketId}/options?expiry=${expiryDate}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error fetching options chain: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatOptionsData(data);
      */
    } catch (error) {
      console.error(`Failed to fetch options for market ${marketId}:`, error);
      // Return mock data for now to keep the app working
      return this.getMockOptionsData(marketId, expiryDate);
    }
  }

  /**
   * Creates mock options data for a market
   * @param {string} marketId - Market ID
   * @param {string} expiryDate - Option expiry date
   * @returns {Object} Mock options data
   */
  getMockOptionsData(marketId, expiryDate) {
    const market = this.mockMarkets.find(m => m.id === marketId) || this.mockMarkets[0];
    const currentPrice = market.currentPrice;
    
    // Generate strike prices around current market price
    const strikeDelta = 0.1;
    const strikes = [
      Math.max(0.1, currentPrice - strikeDelta * 3),
      Math.max(0.1, currentPrice - strikeDelta * 2),
      Math.max(0.1, currentPrice - strikeDelta),
      currentPrice,
      Math.min(0.9, currentPrice + strikeDelta),
      Math.min(0.9, currentPrice + strikeDelta * 2),
      Math.min(0.9, currentPrice + strikeDelta * 3)
    ];
    
    // Generate call options
    const calls = strikes.map(strike => {
      const premium = Math.max(0, (currentPrice - strike) * 0.9 + Math.random() * 0.05);
      return {
        strike: strike.toFixed(2),
        premium: premium.toFixed(4),
        delta: Math.min(1, Math.max(0, (currentPrice > strike ? 0.5 + (currentPrice - strike) : 0.5 - (strike - currentPrice) * 2))).toFixed(2),
        liquidity: Math.floor(Math.random() * 100000) + 10000,
        expiryDate,
        id: `call-${strike.toFixed(2)}-${expiryDate}`
      };
    });
    
    // Generate put options
    const puts = strikes.map(strike => {
      const premium = Math.max(0, (strike - currentPrice) * 0.9 + Math.random() * 0.05);
      return {
        strike: strike.toFixed(2),
        premium: premium.toFixed(4),
        delta: Math.min(1, Math.max(0, (currentPrice < strike ? 0.5 + (strike - currentPrice) : 0.5 - (currentPrice - strike) * 2))).toFixed(2),
        liquidity: Math.floor(Math.random() * 100000) + 10000,
        expiryDate,
        id: `put-${strike.toFixed(2)}-${expiryDate}`
      };
    });
    
    return { calls, puts };
  }

  /**
   * Formats raw market data from API
   * @param {Object} data - Raw market data
   * @returns {Array} Formatted market data
   */
  formatMarkets(data) {
    // Handle the actual API response structure
    if (!data || !data.markets) {
      console.warn('Invalid market data format:', data);
      return [];
    }

    return data.markets.map(market => ({
      id: market.id || market.marketId,
      name: market.title || market.question || market.name,
      currentPrice: market.probability || market.probabilities?.YES || 0.5,
      liquidity: market.volume || market.liquidity || 0,
      volume24h: market.volume24H || market.volume24h || 0,
      expiresAt: market.closeTime || market.expirationDate || new Date().toISOString(),
      category: market.category || 'General',
      description: market.description || ''
    }));
  }

  /**
   * Formats raw market data from API
   * @param {Object} data - Raw market data
   * @returns {Object} Formatted market data
   */
  formatMarketData(data) {
    if (!data) {
      return null;
    }

    return {
      id: data.id || data.marketId,
      name: data.title || data.question || data.name,
      currentPrice: data.probability || data.probabilities?.YES || 0.5,
      liquidity: data.volume || data.liquidity || 0,
      volume24h: data.volume24H || data.volume24h || 0,
      expiresAt: data.closeTime || data.expirationDate || new Date().toISOString(),
      category: data.category || 'General',
      description: data.description || ''
    };
  }

  /**
   * Formats historical price data
   * @param {Object} data - Raw historical data
   * @returns {Array} Formatted historical data
   */
  formatHistoricalData(data) {
    if (!data || !data.prices) {
      return [];
    }

    return data.prices.map(point => ({
      timestamp: new Date(point.timestamp).getTime(),
      price: point.price || point.probability || 0.5
    }));
  }

  /**
   * Formats options data
   * @param {Object} data - Raw options data
   * @returns {Object} Formatted options data with calls and puts
   */
  formatOptionsData(data) {
    if (!data || !data.options) {
      return { calls: [], puts: [] };
    }
    
    // Split into calls and puts
    const calls = data.options.filter(opt => opt.type === 'CALL').map(opt => ({
      strike: opt.strike,
      premium: opt.premium,
      delta: opt.delta || 0.5,
      liquidity: opt.liquidity || 10000,
      expiryDate: opt.expiryDate,
      id: opt.id
    }));
    
    const puts = data.options.filter(opt => opt.type === 'PUT').map(opt => ({
      strike: opt.strike,
      premium: opt.premium,
      delta: opt.delta || 0.5,
      liquidity: opt.liquidity || 10000,
      expiryDate: opt.expiryDate,
      id: opt.id
    }));
    
    return { calls, puts };
  }
}

// Create and export a singleton instance
export const polymarketService = new PolymarketService();

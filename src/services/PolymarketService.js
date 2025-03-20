/**
 * Service for interacting with the Polymarket API
 * Handles fetching market data, historical prices, and other Polymarket information
 */

class PolymarketService {
  constructor() {
    // API credentials (kept for reference but not used with public API)
    this.apiKey = import.meta.env.VITE_POLYMARKET_API_KEY || 'e7c8d5be-954b-9e65-978b-1a5a5a94a003';
    this.apiSecret = import.meta.env.VITE_POLYMARKET_API_SECRET || '2zkjCDjviQ238r0XeXnfn_DRbCdZ4cJ54d5uWNsPj6s=';
    this.apiPassphrase = import.meta.env.VITE_POLYMARKET_API_PASSPHRASE || 'fe74a001d054a1bbfadf848dbf27fa60cc3fa76668cd47bfc254a586f4b61d52';
    
    // API base URL - Polymarket public API
    this.baseUrl = 'https://guarded-inlet-49352.herokuapp.com/https://polymarket.com/api';
    
    // Create mock data for fallback when API fails
    this.mockMarkets = this.createMockMarkets();
    
    // Initialize a flag to track if we've logged the fallback message
    this.loggedFallback = false;
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
        description: 'Market resolves to YES if Bitcoin price is above $30,000 USD on any major exchange at the specified time.',
        polymarketId: 'will-btc-be-above-30000-on-june-30-2025'
      },
      {
        id: 'eth-merge-successful',
        name: 'Will ETH reach $10,000 before December 2025?',
        currentPrice: 0.42,
        liquidity: 1800000,
        volume24h: 275000,
        expiresAt: '2025-12-31T23:59:59Z',
        category: 'Crypto',
        description: 'Market resolves to YES if Ethereum price reaches or exceeds $10,000 USD on any major exchange before the end of 2025.',
        polymarketId: 'will-eth-reach-10000-before-december-2025'
      },
      {
        id: 'trump-2024',
        name: 'Will Donald Trump win the 2024 presidential election?',
        currentPrice: 0.51,
        liquidity: 5000000,
        volume24h: 750000,
        expiresAt: '2024-11-05T23:59:59Z',
        category: 'Politics',
        description: 'Market resolves to YES if Donald Trump wins the 2024 U.S. presidential election.',
        polymarketId: 'will-donald-trump-win-the-2024-us-presidential-election'
      },
      {
        id: 'fed-rate-hike-june',
        name: 'Will the Fed raise interest rates in June 2025?',
        currentPrice: 0.63,
        liquidity: 1200000,
        volume24h: 180000,
        expiresAt: '2025-06-15T23:59:59Z',
        category: 'Economics',
        description: 'Market resolves to YES if the Federal Reserve announces an interest rate increase at its June 2025 meeting.',
        polymarketId: 'will-fed-raise-rates-june-2025'
      },
      {
        id: 'apple-market-cap',
        name: 'Will Apple market cap exceed $4T in 2025?',
        currentPrice: 0.71,
        liquidity: 2800000,
        volume24h: 420000,
        expiresAt: '2025-12-31T23:59:59Z',
        category: 'Stocks',
        description: 'Market resolves to YES if Apple Inc. market capitalization exceeds $4 trillion USD at any point during 2025.',
        polymarketId: 'will-apple-market-cap-exceed-4t-2025'
      },
      {
        id: 'ukraine-ceasefire',
        name: 'Will there be a ceasefire in Ukraine before May?',
        currentPrice: 0.29,
        volume24h: 15500,
        liquidity: 185000,
        expiresAt: '2025-05-01T23:59:59Z',
        category: 'Politics',
        polymarketId: 'seaair-ceasefire-in-ukraine-before-may',
        description: 'This market resolves to "Yes" if there is a formal ceasefire agreement between Ukraine and Russia that is in effect before May 1, 2025, and "No" otherwise.'
      }
    ];
  }

  /**
   * Fetches available markets from Polymarket
   * @returns {Promise<Array>} Array of market data
   */
  async getMarkets() {
    try {
      // Use CORS proxy to access Polymarket API
      const response = await fetch(`${this.baseUrl}/markets?limit=20&status=open`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching markets: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully fetched Polymarket API data');
      this.loggedFallback = false; // Reset flag since API call succeeded
      return this.formatMarkets(data);
    } catch (error) {
      // Only log the error once to avoid console spam
      if (!this.loggedFallback) {
        console.log('Note: Using mock Polymarket data since API could not be reached');
        this.loggedFallback = true;
      }
      // Return mock data on error
      return this.mockMarkets;
    }
  }

  /**
   * Format raw API market data into a standardized format
   * @param {Object} data - Raw API response data
   * @returns {Array} Formatted market data
   */
  formatMarkets(data) {
    try {
      // If we have markets data, format it
      if (data && data.markets && Array.isArray(data.markets)) {
        return data.markets.map(market => ({
          id: market.id || market.slug,
          name: market.question || market.title,
          currentPrice: market.yes_price || market.probabilityOfYes || 0.5,
          liquidity: market.liquidity || 1000000,
          volume24h: market.volume24h || 100000,
          expiresAt: market.closeTime || market.expiresAt || new Date().toISOString(),
          category: market.category || 'Uncategorized',
          description: market.description || 'No description available.',
          polymarketId: market.slug || market.id
        }));
      }
      
      // If data format is unexpected, return mock data
      return this.mockMarkets;
    } catch (error) {
      // Return mock data on error
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
      const response = await fetch(`${this.baseUrl}/markets/${marketId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching market: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatMarketData(data);
    } catch (error) {
      // Find the matching mock market or return the first one
      const market = this.mockMarkets.find(m => m.id === marketId || m.polymarketId === marketId);
      return market || this.mockMarkets[0];
    }
  }

  /**
   * Format a single market's data
   * @param {Object} data - Raw API market data
   * @returns {Object} Formatted market data
   */
  formatMarketData(data) {
    try {
      if (data && data.market) {
        const market = data.market;
        return {
          id: market.id || market.slug,
          name: market.question || market.title,
          currentPrice: market.yes_price || market.probabilityOfYes || 0.5,
          liquidity: market.liquidity || 1000000,
          volume24h: market.volume24h || 100000,
          expiresAt: market.closeTime || market.expiresAt || new Date().toISOString(),
          category: market.category || 'Uncategorized',
          description: market.description || 'No description available.',
          polymarketId: market.slug || market.id
        };
      }
      
      return this.mockMarkets[0];
    } catch (error) {
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
    // For historical data, we'll use mock data
    return this.generateMockHistoricalData(marketId, timeRange);
  }

  /**
   * Generates mock historical price data
   * @param {string} marketId - The market ID
   * @param {string} timeRange - Time range (e.g., '7d', '30d')
   * @returns {Array} Array of mock historical price data points
   */
  generateMockHistoricalData(marketId, timeRange) {
    const now = new Date();
    const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    const dataPoints = [];
    
    // Find the corresponding market to get the current price
    const market = this.mockMarkets.find(m => m.id === marketId || m.polymarketId === marketId) || this.mockMarkets[0];
    const currentPrice = market.currentPrice;
    
    // Generate data points (one per day)
    for (let i = 0; i <= daysToSubtract; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate a price that trends toward the current price
      const progress = i / daysToSubtract;
      const randomVariation = (Math.random() - 0.5) * 0.1; // Random variation of ±5%
      const startingPrice = 0.4 + Math.random() * 0.2; // Random starting price between 0.4 and 0.6
      const price = startingPrice * (1 - progress) + currentPrice * progress + randomVariation;
      
      // Ensure price is between 0 and 1
      const clampedPrice = Math.max(0.01, Math.min(0.99, price));
      
      dataPoints.push({
        timestamp: date.getTime(),
        price: clampedPrice
      });
    }
    
    return dataPoints;
  }

  /**
   * Parse a Polymarket URL to extract the market ID
   * @param {string} url - Polymarket market URL
   * @returns {string|null} Market ID or null if invalid
   */
  parsePolymarketUrl(url) {
    try {
      // Handle both old and new URL formats
      // New format: https://polymarket.com/event/will-donald-trump-win-the-2024-us-presidential-e
      // Old format: https://polymarket.com/market/will-donald-trump-win-the-2024-us-presidential-e
      
      const urlObj = new URL(url);
      
      if (!urlObj.hostname.includes('polymarket.com')) {
        return null;
      }
      
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Check if the URL has enough path parts (should have at least 2)
      if (pathParts.length < 2) {
        return null;
      }
      
      // Extract market ID based on URL format
      let marketId = null;
      
      if (pathParts[0] === 'event' || pathParts[0] === 'market') {
        marketId = pathParts[1];
      }
      
      return marketId;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Gets options data for a market - uses mock data since this is not available in the public API
   * @param {string} marketId - Market ID
   * @param {string} expiryDate - Option expiry date
   * @returns {Object} Options data with calls and puts
   */
  async getOptionsChain(marketId, expiryDate) {
    // Find the market to get its current price
    const market = this.mockMarkets.find(m => m.id === marketId || m.polymarketId === marketId) || this.mockMarkets[0];
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
        strike: parseFloat(strike.toFixed(2)),
        premium: parseFloat(premium.toFixed(4)),
        delta: parseFloat(Math.min(1, Math.max(0, (currentPrice > strike ? 0.5 + (currentPrice - strike) : 0.5 - (strike - currentPrice) * 2))).toFixed(2)),
        liquidity: Math.floor(Math.random() * 100000) + 10000,
        expiryDate,
        id: `call-${strike.toFixed(2)}-${expiryDate}`
      };
    });
    
    // Generate put options
    const puts = strikes.map(strike => {
      const premium = Math.max(0, (strike - currentPrice) * 0.9 + Math.random() * 0.05);
      return {
        strike: parseFloat(strike.toFixed(2)),
        premium: parseFloat(premium.toFixed(4)),
        delta: parseFloat(Math.min(1, Math.max(0, (currentPrice < strike ? 0.5 + (strike - currentPrice) : 0.5 - (currentPrice - strike) * 2))).toFixed(2)),
        liquidity: Math.floor(Math.random() * 100000) + 10000,
        expiryDate,
        id: `put-${strike.toFixed(2)}-${expiryDate}`
      };
    });
    
    return { calls, puts };
  }
}

// Create and export a singleton instance
export const polymarketService = new PolymarketService();

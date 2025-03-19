import { ammInstance } from '../utils/amm';
import { polymarketService } from './PolymarketService';

class MarketDataService {
  constructor() {
    this.markets = [];
    this.initialized = false;
  }

  /**
   * Initialize the service with real Polymarket data
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Fetch real markets from Polymarket API
      this.markets = await polymarketService.getMarkets();
      this.initialized = true;
      console.log('MarketDataService initialized with Polymarket data');
    } catch (error) {
      console.error('Failed to initialize with Polymarket data, falling back to mock data:', error);
      this.initializeFallbackData();
    }
  }

  /**
   * Initialize with fallback mock data when API is unavailable
   */
  initializeFallbackData() {
    // Use AMM mock data as fallback
    const mockLiquidityPools = ammInstance.getLiquidityPools();
    this.markets = Object.keys(mockLiquidityPools).map(poolId => {
      const pool = mockLiquidityPools[poolId];
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(currentDate.getDate() + 90); // 90 days from now
      
      return {
        id: poolId,
        name: pool.name || `Market ${poolId}`,
        currentPrice: pool.currentPrice,
        liquidity: pool.liquidity || 1000000,
        volume24h: Math.floor(Math.random() * 250000) + 50000,
        expiresAt: expiryDate.toISOString(),
        category: 'Crypto',
        polymarketId: `mock-${poolId}`
      };
    });
    
    this.markets.push({
      id: 'trump-2024',
      name: 'Will Donald Trump win the 2024 US Presidential Election?',
      description: 'This market resolves to "Yes" if Donald Trump is declared the winner of the 2024 US Presidential Election, and "No" otherwise.',
      currentPrice: 0.47,
      volume24h: 25000,
      liquidity: 225000,
      polymarketId: 'will-donald-trump-win-the-2024-us-presidential-election'
    });
    this.markets.push({
      id: 'btc-price-30k-june',
      name: 'Will BTC be above $30,000 on June 30, 2025?',
      description: 'This market resolves to "Yes" if the price of Bitcoin is above $30,000 USD on June 30, 2025, and "No" otherwise. The reference price will be the Coinbase Pro BTC/USD price at 23:59:59 UTC.',
      currentPrice: 0.61,
      volume24h: 12500,
      liquidity: 175000,
      polymarketId: 'will-btc-be-above-30000-on-june-30-2025'
    });
    this.markets.push({
      id: 'eth-merge-successful',
      name: 'Will ETH reach $10,000 before December 2025?',
      description: 'This market resolves to "Yes" if the price of Ethereum is above $10,000 USD at any point before December 31, 2025, and "No" otherwise. The reference price will be the Coinbase Pro ETH/USD price.',
      currentPrice: 0.32,
      volume24h: 8500,
      liquidity: 120000,
      polymarketId: 'will-eth-reach-10000-before-december-2025'
    });
    this.markets.push({
      id: 'fed-rate-hike-june',
      name: 'Will the Fed raise rates in June 2025?',
      description: 'This market resolves to "Yes" if the Federal Reserve raises the federal funds rate at its June 2025 meeting, and "No" otherwise.',
      currentPrice: 0.71,
      volume24h: 18000,
      liquidity: 210000,
      polymarketId: 'will-fed-raise-rates-june-2025'
    });
    this.markets.push({
      id: 'apple-market-cap',
      name: 'Will Apple market cap exceed $4T in 2025?',
      description: 'This market resolves to "Yes" if Apple\'s market capitalization exceeds $4 trillion USD at any point during 2025, and "No" otherwise.',
      currentPrice: 0.39,
      volume24h: 9200,
      liquidity: 145000,
      polymarketId: 'will-apple-market-cap-exceed-4t-2025'
    });
    this.markets.push({
      id: 'ukraine-ceasefire',
      name: 'Will there be a ceasefire in Ukraine before May?',
      description: 'This market resolves to "Yes" if there is a formal ceasefire agreement between Ukraine and Russia that is in effect before May 1, 2025, and "No" otherwise.',
      currentPrice: 0.29,
      volume24h: 15500,
      liquidity: 185000,
      polymarketId: 'seaair-ceasefire-in-ukraine-before-may'
    });
    
    this.initialized = true;
    console.log('MarketDataService initialized with fallback data');
  }

  /**
   * Get all available markets
   * @returns {Promise<Array>} List of markets
   */
  async getMarkets() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Refresh markets from Polymarket if needed
      this.markets = await polymarketService.getMarkets();
      return this.markets;
    } catch (error) {
      console.error('Failed to fetch markets from Polymarket, using cached data:', error);
      return this.markets;
    }
  }

  /**
   * Get a specific market by ID
   * @param {string} marketId - Market ID
   * @returns {Promise<Object>} Market data
   */
  async getMarketById(marketId) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Try to get fresh data from Polymarket API
      const market = await polymarketService.getMarketById(marketId);
      return market;
    } catch (error) {
      console.error(`Failed to fetch market ${marketId} from Polymarket, using cached data:`, error);
      // Fallback to cached data
      return this.markets.find(m => m.id === marketId) || null;
    }
  }

  /**
   * Get historical price data for a market
   * @param {string} marketId - Market ID
   * @param {string} timeRange - Time range for historical data
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalPrices(marketId, timeRange = '30d') {
    try {
      // Get real historical data from Polymarket
      const historicalData = await polymarketService.getHistoricalPrices(marketId, timeRange);
      return historicalData;
    } catch (error) {
      console.error(`Failed to fetch historical prices for market ${marketId}, using generated data:`, error);
      // Generate mock historical data as fallback
      return this.generateMockHistoricalData(marketId, timeRange);
    }
  }

  /**
   * Generate mock historical data when API is unavailable
   * @param {string} marketId - Market ID
   * @param {string} timeRange - Time range
   * @returns {Array} Generated historical data
   */
  generateMockHistoricalData(marketId, timeRange) {
    const now = new Date();
    const market = this.markets.find(m => m.id === marketId);
    const currentPrice = market ? market.currentPrice : 0.5;
    
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
   * Get options data for a market
   * @param {string} marketId - Market ID
   * @param {string} expiryDate - Option expiry date
   * @returns {Promise<Object>} Options data
   */
  async getOptionsChain(marketId, expiryDate) {
    try {
      // Get real options data from Polymarket
      return await polymarketService.getOptionsChain(marketId, expiryDate);
    } catch (error) {
      console.error(`Failed to fetch options chain for market ${marketId}, using generated data:`, error);
      // Generate mock options data as fallback
      return this.generateMockOptionsChain(marketId, expiryDate);
    }
  }

  /**
   * Generate mock options chain when API is unavailable
   * @param {string} marketId - Market ID
   * @param {string} expiryDate - Option expiry date
   * @returns {Object} Generated options data
   */
  generateMockOptionsChain(marketId, expiryDate) {
    const market = this.markets.find(m => m.id === marketId);
    const currentPrice = market ? market.currentPrice : 0.5;
    
    // Generate strikes around the current market price
    const strikeDelta = 0.1;
    const baseStrikes = [
      Math.max(0.1, currentPrice - strikeDelta * 3),
      Math.max(0.1, currentPrice - strikeDelta * 2),
      Math.max(0.1, currentPrice - strikeDelta),
      currentPrice,
      Math.min(0.9, currentPrice + strikeDelta),
      Math.min(0.9, currentPrice + strikeDelta * 2),
      Math.min(0.9, currentPrice + strikeDelta * 3)
    ];
    
    // Generate options data
    const calls = baseStrikes.map(strike => {
      const moneyness = currentPrice / strike;
      const premium = Math.max(0, (currentPrice - strike) * 0.9 + Math.random() * 0.05);
      
      return {
        strike,
        premium: premium.toFixed(4),
        delta: Math.min(1, Math.max(0, 1 - (strike / currentPrice))).toFixed(2),
        gamma: (Math.random() * 0.2).toFixed(3),
        iv: (0.3 + Math.random() * 0.4).toFixed(2)
      };
    });
    
    const puts = baseStrikes.map(strike => {
      const moneyness = strike / currentPrice;
      const premium = Math.max(0, (strike - currentPrice) * 0.9 + Math.random() * 0.05);
      
      return {
        strike,
        premium: premium.toFixed(4),
        delta: Math.min(1, Math.max(0, (strike / currentPrice) - 0.5)).toFixed(2),
        gamma: (Math.random() * 0.2).toFixed(3),
        iv: (0.3 + Math.random() * 0.4).toFixed(2)
      };
    });
    
    return { calls, puts };
  }

  /**
   * Get market categories
   * @returns {Promise<Array>} List of categories
   */
  async getCategories() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Extract unique categories from markets
    const categories = [...new Set(this.markets.map(market => market.category))];
    return categories;
  }
}

export const marketDataService = new MarketDataService();

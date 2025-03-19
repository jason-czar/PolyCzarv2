// Automated Market Maker (AMM) for PolyCzar options trading
import { optionsPricingEngine } from './optionsPricing';

export class AMM {
  constructor() {
    this.liquidityPools = new Map();
    this.pricingEngine = optionsPricingEngine;
    this.userPositions = new Map(); // Map of userId -> positions array
  }

  async initialize() {
    await this.pricingEngine.initialize();
    console.log("AMM initialized");
    this.initializeDemoPositions();
    this.initializeDemoLiquidityPools(); // Initialize liquidity pools for development
    console.log("Demo liquidity pools initialized");
  }

  getPrice(optionId, optionDetails) {
    // Get the base price from the pricing engine
    const price = this.pricingEngine.getPriceForOption(optionDetails);
    
    // Apply additional AMM-specific adjustments based on pool liquidity
    const pool = this.liquidityPools.get(optionId);
    if (pool) {
      const liquidityFactor = this.calculateLiquidityFactor(pool);
      
      // Adjust the spread based on liquidity
      const halfSpread = (price.askPrice - price.bidPrice) / 2;
      const adjustedHalfSpread = halfSpread * (1 + liquidityFactor);
      
      return {
        ...price,
        bidPrice: Math.max(0, price.midPrice - adjustedHalfSpread),
        askPrice: Math.min(1, price.midPrice + adjustedHalfSpread)
      };
    }
    
    return price;
  }

  addLiquidity(optionId, amount, initialPrice = 0.5) {
    const pool = this.liquidityPools.get(optionId) || this.initializeLiquidityPool(optionId, initialPrice);
    
    pool.liquidity += amount;
    
    // Recalculate pool parameters
    pool.maxOrderSize = pool.liquidity * 0.1; // 10% of liquidity
    
    this.liquidityPools.set(optionId, pool);
    
    return {
      poolId: optionId,
      totalLiquidity: pool.liquidity,
      maxOrderSize: pool.maxOrderSize
    };
  }

  removeLiquidity(optionId, amount) {
    const pool = this.liquidityPools.get(optionId);
    if (!pool) {
      throw new Error(`No liquidity pool exists for option ${optionId}`);
    }
    
    // Cannot remove more than exists
    const amountToRemove = Math.min(amount, pool.liquidity);
    
    pool.liquidity -= amountToRemove;
    
    // Recalculate pool parameters
    pool.maxOrderSize = Math.max(pool.liquidity * 0.1, 0); // 10% of liquidity
    
    this.liquidityPools.set(optionId, pool);
    
    return {
      poolId: optionId,
      amountRemoved: amountToRemove,
      totalLiquidity: pool.liquidity,
      maxOrderSize: pool.maxOrderSize
    };
  }

  executeTrade(optionId, direction, amount) {
    const pool = this.liquidityPools.get(optionId);
    if (!pool) {
      throw new Error(`No liquidity pool exists for option ${optionId}`);
    }
    
    if (amount > pool.maxOrderSize) {
      throw new Error(`Order size exceeds maximum allowed (${pool.maxOrderSize})`);
    }
    
    // Calculate execution price with slippage
    const slippage = this.calculateSlippage(amount, pool.liquidity);
    
    let executionPrice;
    if (direction === 'buy') {
      executionPrice = pool.lastPrice.askPrice * (1 + slippage);
      executionPrice = Math.min(executionPrice, 0.99); // Cap at 99%
    } else {
      executionPrice = pool.lastPrice.bidPrice * (1 - slippage);
      executionPrice = Math.max(executionPrice, 0.01); // Floor at 1%
    }
    
    // Update pool state
    pool.lastTradeAmount = amount;
    pool.lastTradeDirection = direction;
    pool.lastTradeTimestamp = new Date();
    pool.totalVolume += amount;
    
    // Update imbalance metrics
    if (direction === 'buy') {
      pool.buyVolume += amount;
    } else {
      pool.sellVolume += amount;
    }
    
    pool.imbalanceRatio = Math.abs(pool.buyVolume - pool.sellVolume) / pool.totalVolume;
    
    this.liquidityPools.set(optionId, pool);
    
    return {
      optionId,
      direction,
      amount,
      executionPrice,
      slippage,
      timestamp: new Date()
    };
  }

  initializeLiquidityPool(optionId, initialPrice) {
    const pool = {
      liquidity: 0,
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
      imbalanceRatio: 0,
      maxOrderSize: 0,
      lastPrice: {
        bidPrice: initialPrice * 0.95,
        midPrice: initialPrice,
        askPrice: initialPrice * 1.05,
        timestamp: new Date()
      },
      lastTradeAmount: 0,
      lastTradeDirection: null,
      lastTradeTimestamp: null
    };
    
    this.liquidityPools.set(optionId, pool);
    return pool;
  }

  calculateLiquidityFactor(pool) {
    // More liquidity = tighter spreads
    const liquidityScale = Math.min(1, Math.max(0.1, pool.liquidity / 10000));
    
    // Imbalance increases spread
    const imbalanceFactor = Math.min(2, 1 + pool.imbalanceRatio * 3);
    
    // Recent volume decreases spread
    const recentActivityDiscount = pool.lastTradeTimestamp ? 
      Math.max(0.5, 1 - (new Date() - pool.lastTradeTimestamp) / (1000 * 60 * 60)) : 0;
    
    return (1 / liquidityScale) * imbalanceFactor * (1 - (recentActivityDiscount * 0.2));
  }

  calculateSlippage(orderSize, poolLiquidity) {
    // Simple slippage model: larger orders relative to liquidity create more slippage
    return Math.min(0.2, Math.pow(orderSize / poolLiquidity, 1.5) * 0.5);
  }

  // New method to get user positions with authentication
  async getUserPositions(userId = 'demo-user') {
    // If no positions exist for this user yet, initialize with demo data
    if (!this.userPositions.has(userId)) {
      return [];
    }
    
    // Get positions for specific user
    const positions = this.userPositions.get(userId);
    
    // Update current prices for each position
    return positions.map(position => {
      // Calculate current value based on market conditions
      const currentPrice = Math.random() * 0.3 + 0.2; // Demo random price between 0.2 and 0.5
      const currentValue = position.quantity * currentPrice;
      
      return {
        ...position,
        currentPrice,
        currentValue
      };
    });
  }

  // New method to close a position
  async closePosition(positionId, userId = 'demo-user') {
    if (!this.userPositions.has(userId)) {
      throw new Error(`No positions found for user ${userId}`);
    }
    
    const positions = this.userPositions.get(userId);
    const positionIndex = positions.findIndex(p => p.id === positionId);
    
    if (positionIndex === -1) {
      throw new Error(`Position ${positionId} not found`);
    }
    
    // Remove the position
    positions.splice(positionIndex, 1);
    this.userPositions.set(userId, positions);
    
    return { success: true, message: 'Position closed successfully' };
  }

  // Initialize demo liquidity pools for development purposes
  initializeDemoLiquidityPools() {
    // Define common market IDs that will be used across the application
    const marketIds = ['btc-usd', 'eth-usd', 'sol-usd', 'matic-usd', 'link-usd'];
    
    // For each market, create various option types with different strikes
    marketIds.forEach(marketId => {
      // Create CALL options at different strike prices
      [0.4, 0.5, 0.6, 0.7, 0.8].forEach(strike => {
        const callOptionId = `${marketId}-CALL-${strike}`;
        // Initialize pool with random initial price based on strike
        const initialPrice = Math.max(0.05, Math.min(0.95, Math.random() * 0.3 + (1 - strike)));
        this.initializeLiquidityPool(callOptionId, initialPrice);
        
        // Add significant liquidity (between 5000 and 15000)
        const liquidityAmount = 5000 + Math.random() * 10000;
        this.addLiquidity(callOptionId, liquidityAmount, initialPrice);
        
        // Simulate some trading activity
        const buyVolume = Math.random() * liquidityAmount * 0.3; // 0-30% of liquidity
        const sellVolume = Math.random() * liquidityAmount * 0.2; // 0-20% of liquidity
        
        const pool = this.liquidityPools.get(callOptionId);
        pool.buyVolume = buyVolume;
        pool.sellVolume = sellVolume;
        pool.totalVolume = buyVolume + sellVolume;
        pool.imbalanceRatio = Math.abs(buyVolume - sellVolume) / pool.totalVolume;
        pool.lastTradeTimestamp = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24); // Within last 24h
        
        this.liquidityPools.set(callOptionId, pool);
      });
      
      // Create PUT options at different strike prices
      [0.2, 0.3, 0.4, 0.5, 0.6].forEach(strike => {
        const putOptionId = `${marketId}-PUT-${strike}`;
        // Initialize pool with random initial price based on strike
        const initialPrice = Math.max(0.05, Math.min(0.95, Math.random() * 0.3 + strike));
        this.initializeLiquidityPool(putOptionId, initialPrice);
        
        // Add significant liquidity (between 5000 and 15000)
        const liquidityAmount = 5000 + Math.random() * 10000;
        this.addLiquidity(putOptionId, liquidityAmount, initialPrice);
        
        // Simulate some trading activity
        const buyVolume = Math.random() * liquidityAmount * 0.25; // 0-25% of liquidity
        const sellVolume = Math.random() * liquidityAmount * 0.25; // 0-25% of liquidity
        
        const pool = this.liquidityPools.get(putOptionId);
        pool.buyVolume = buyVolume;
        pool.sellVolume = sellVolume;
        pool.totalVolume = buyVolume + sellVolume;
        pool.imbalanceRatio = Math.abs(buyVolume - sellVolume) / pool.totalVolume;
        pool.lastTradeTimestamp = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24); // Within last 24h
        
        this.liquidityPools.set(putOptionId, pool);
      });
    });
    
    console.log(`Initialized ${this.liquidityPools.size} liquidity pools for development`);
  }

  // Initialize demo positions for testing
  initializeDemoPositions() {
    const demoPositions = [
      {
        id: 'pos-1',
        marketId: 'btc-usd',
        optionType: 'CALL',
        strike: 0.6,
        entryPrice: 0.25,
        quantity: 10,
        costBasis: 250,
        entryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)  // 7 days ago
      },
      {
        id: 'pos-2',
        marketId: 'eth-usd',
        optionType: 'PUT',
        strike: 0.4,
        entryPrice: 0.15,
        quantity: 5,
        costBasis: 75,
        entryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)  // 3 days ago
      }
    ];
    
    this.userPositions.set('demo-user', demoPositions);
  }

  // Get all available markets based on liquidity pools
  getAvailableMarkets() {
    const markets = new Set();
    
    // Extract unique market IDs from all option IDs in liquidity pools
    for (const optionId of this.liquidityPools.keys()) {
      const parts = optionId.split('-');
      if (parts.length >= 3) {
        const marketId = parts.slice(0, 2).join('-'); // e.g., "btc-usd"
        markets.add(marketId);
      }
    }
    
    // Convert set to array and add market details
    return Array.from(markets).map(marketId => {
      const [base, quote] = marketId.split('-');
      
      // Count how many options are available for this market
      let callOptions = 0;
      let putOptions = 0;
      let totalLiquidity = 0;
      
      this.liquidityPools.forEach((pool, optionId) => {
        if (optionId.startsWith(marketId)) {
          if (optionId.includes('-CALL-')) {
            callOptions++;
          } else if (optionId.includes('-PUT-')) {
            putOptions++;
          }
          totalLiquidity += pool.liquidity;
        }
      });
      
      // Calculate a relative popularity score based on liquidity
      const popularity = Math.min(10, Math.max(1, Math.floor(totalLiquidity / 10000)));
      
      // Generate some random price movement data for display purposes
      const currentPrice = marketId === 'btc-usd' ? 0.65 : 
                           marketId === 'eth-usd' ? 0.45 : 
                           Math.random() * 0.4 + 0.3; // Between 0.3 and 0.7
      
      const dailyChange = (Math.random() * 10 - 5) / 100; // -5% to +5%
      
      return {
        id: marketId,
        name: `${base.toUpperCase()}/${quote.toUpperCase()}`,
        base: base.toUpperCase(),
        quote: quote.toUpperCase(),
        currentPrice,
        dailyChange,
        callOptions,
        putOptions,
        popularity,
        totalLiquidity,
        volumeLast24h: totalLiquidity * (Math.random() * 0.2 + 0.05) // 5-25% of liquidity
      };
    }).sort((a, b) => b.popularity - a.popularity); // Sort by popularity
  }

  // Get all options available for a specific market
  getMarketOptions(marketId) {
    const options = [];
    
    this.liquidityPools.forEach((pool, optionId) => {
      if (optionId.startsWith(marketId)) {
        const parts = optionId.split('-');
        if (parts.length >= 3) {
          const optionType = parts[2]; // "CALL" or "PUT"
          const strike = parseFloat(parts[3]);
          
          options.push({
            id: optionId,
            marketId,
            optionType,
            strike,
            bidPrice: pool.lastPrice.bidPrice,
            askPrice: pool.lastPrice.askPrice,
            midPrice: pool.lastPrice.midPrice,
            liquidity: pool.liquidity,
            volume24h: pool.totalVolume * (Math.random() * 0.5 + 0.2), // Random recent volume
            impliedProbability: pool.lastPrice.midPrice,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days in the future
          });
        }
      }
    });
    
    // Sort by strike price
    return options.sort((a, b) => a.strike - b.strike);
  }
}

// Create and export singleton instance
export const ammInstance = new AMM();

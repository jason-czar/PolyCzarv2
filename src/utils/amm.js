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
}

// Create and export singleton instance
export const ammInstance = new AMM();

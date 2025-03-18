// Core options pricing utility based on the Modified Black-Scholes model for binary options

export class OptionsPricingEngine {
  constructor() {
    this.pricingModel = new BlackScholesBinaryModel();
    this.historicalDataService = new HistoricalDataService();
    this.volatilityService = new VolatilityService(this.historicalDataService);
    this.marketMonitor = new MarketMonitor();
    this.listeners = [];
  }

  async initialize() {
    await this.historicalDataService.initialize();
    this.marketMonitor.addListener(this.handleMarketUpdate.bind(this));
  }

  handleMarketUpdate(marketId, data, updateType) {
    this.volatilityService.updateVolatilityEstimate(marketId);
    this.notifyListeners(marketId, updateType);
  }

  getPriceForOption(optionDetails) {
    const {
      marketId,
      currentPrice, // Current probability (0-1)
      strike, // Strike probability (0-100)
      expiry, // Expiration date
      type, // 'call' or 'put'
    } = optionDetails;

    // Calculate time to expiry
    const timeToExpiry = this.calculateTimeToExpiry(expiry);

    // Get volatility from service
    const volatility = this.volatilityService.getDynamicVolatility(
      marketId,
      timeToExpiry
    );

    // Get risk-free rate (could be dynamically fetched)
    const riskFreeRate = 0.05;

    // Calculate liquidity factor
    const liquidityFactor = 0.1; // Simplified; would come from AMM

    // Calculate price using the model
    return this.pricingModel.calculatePrice({
      currentProbability: currentPrice * 100, // Convert to percentage
      strikeProbability: strike,
      timeToExpiry,
      volatility,
      riskFreeRate,
      optionType: type,
      liquidityFactor
    });
  }

  calculateTimeToExpiry(expiryDate) {
    const currentDate = new Date();
    const expiryDateTime = new Date(expiryDate);
    const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;

    return Math.max(0, (expiryDateTime - currentDate) / millisecondsPerYear);
  }

  subscribeToUpdates(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(marketId, updateType) {
    for (const listener of this.listeners) {
      listener(marketId, updateType);
    }
  }
}

export class BlackScholesBinaryModel {
  calculatePrice(params) {
    const {
      currentProbability,  // Current probability (0-100)
      strikeProbability,   // Strike probability (0-100)
      timeToExpiry,        // Time to expiry in years
      volatility,          // Annualized volatility
      riskFreeRate,        // Risk-free rate
      optionType,          // 'call' or 'put'
      liquidityFactor      // Factor to adjust spread based on liquidity
    } = params;

    // Convert probabilities to prices (0-1 range)
    const currentPrice = currentProbability / 100;
    const strikePrice = strikeProbability / 100;
    
    // Calculate d1 and d2 parameters
    const { d1, d2 } = this.calculateD1D2({
      currentPrice,
      strikePrice,
      timeToExpiry,
      volatility,
      riskFreeRate
    });

    // Calculate the binary option price using the modified Black-Scholes formula
    let midPrice;
    if (optionType.toLowerCase() === 'call') {
      midPrice = Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2);
    } else { // put
      midPrice = Math.exp(-riskFreeRate * timeToExpiry) * (1 - this.normalCDF(d2));
    }

    // Adjust price for binary option (0-1 outcome)
    midPrice = Math.max(0, Math.min(1, midPrice));

    // Calculate spread based on liquidity and volatility
    const spread = liquidityFactor * volatility * Math.sqrt(timeToExpiry);
    const halfSpread = spread / 2;

    // Calculate bid and ask prices
    const bidPrice = Math.max(0, midPrice - halfSpread);
    const askPrice = Math.min(1, midPrice + halfSpread);

    // Calculate greeks
    const delta = this.calculateDelta(d1, optionType);
    const gamma = this.calculateGamma(d1, currentPrice, volatility, timeToExpiry);
    const theta = this.calculateTheta(d1, d2, currentPrice, strikePrice, 
                                    volatility, riskFreeRate, timeToExpiry, optionType);
    const vega = this.calculateVega(d1, currentPrice, timeToExpiry);

    return {
      midPrice,
      bidPrice,
      askPrice,
      timestamp: new Date(),
      delta,
      gamma,
      theta,
      vega
    };
  }

  calculateD1D2(params) {
    const { currentPrice, strikePrice, timeToExpiry, volatility, riskFreeRate } = params;
    
    // Handle edge cases
    if (timeToExpiry <= 0) return { d1: 0, d2: 0 };
    if (volatility <= 0) return { d1: 0, d2: 0 };
    
    // In binary options context, we need to adapt the Black-Scholes formula
    // For prediction markets, the "price" is actually the probability
    const d1 = (Math.log(currentPrice / strikePrice) + 
        (riskFreeRate + (volatility * volatility) / 2) * timeToExpiry) / 
        (volatility * Math.sqrt(timeToExpiry));
        
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
    
    return { d1, d2 };
  }

  normalCDF(x) {
    // Approximation of the cumulative distribution function of the standard normal distribution
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    
    const t = 1 / (1 + p * x);
    const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1 + sign * erf);
  }

  normalPDF(x) {
    // Probability density function of the standard normal distribution
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }
  
  // Greek calculations
  calculateDelta(d1, optionType) {
    return optionType.toLowerCase() === 'call' ? 
      this.normalCDF(d1) : 
      this.normalCDF(d1) - 1;
  }
  
  calculateGamma(d1, price, volatility, timeToExpiry) {
    return this.normalPDF(d1) / (price * volatility * Math.sqrt(timeToExpiry));
  }
  
  calculateVega(d1, price, timeToExpiry) {
    return price * this.normalPDF(d1) * Math.sqrt(timeToExpiry) / 100; // Divided by 100 for percentage
  }
  
  calculateTheta(d1, d2, price, strike, volatility, rate, timeToExpiry, optionType) {
    const t1 = -price * this.normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry));
    
    let t2;
    if (optionType.toLowerCase() === 'call') {
      t2 = -rate * strike * Math.exp(-rate * timeToExpiry) * this.normalCDF(d2);
    } else {
      t2 = rate * strike * Math.exp(-rate * timeToExpiry) * this.normalCDF(-d2);
    }
    
    return (t1 + t2) / 365; // Convert to daily theta
  }
}

export class HistoricalDataService {
  constructor() {
    this.dbName = "polyczar_historical_data";
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await this.openDatabase();
      console.log("Historical data service initialized");
    } catch (error) {
      console.error("Failed to initialize historical data service:", error);
    }
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for market data
        if (!db.objectStoreNames.contains("marketData")) {
          const store = db.createObjectStore("marketData", { keyPath: "id", autoIncrement: true });
          store.createIndex("marketId", "marketId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async storeDataPoint(marketId, dataPoint) {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["marketData"], "readwrite");
      const store = transaction.objectStore("marketData");
      
      const record = {
        marketId,
        price: dataPoint.price,
        volume: dataPoint.volume,
        timestamp: dataPoint.timestamp || new Date()
      };
      
      const request = store.add(record);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getHistoricalData(marketId, days = 30) {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["marketData"], "readonly");
      const store = transaction.objectStore("marketData");
      const index = store.index("marketId");
      
      // Calculate the date from 'days' ago
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Get all records for the market ID
      const request = index.getAll(marketId);
      
      request.onsuccess = (event) => {
        const allData = event.target.result;
        // Filter for data points after the cutoff date
        const filteredData = allData.filter(item => 
          new Date(item.timestamp) >= cutoffDate
        );
        
        resolve(filteredData);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async clearOldData(olderThanDays = 90) {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["marketData"], "readwrite");
      const store = transaction.objectStore("marketData");
      const index = store.index("timestamp");
      
      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Use a cursor to iterate through and delete old records
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
}

export class VolatilityService {
  constructor(historicalDataService) {
    this.historicalDataService = historicalDataService;
    this.volatilityCache = new Map();
  }

  async calculateVolatility(marketId, method = 'historical') {
    // Get historical data for the market
    const historicalData = await this.historicalDataService.getHistoricalData(marketId, 30);
    
    if (!historicalData || historicalData.length < 2) {
      return 0.3; // Default volatility if not enough data
    }
    
    switch (method) {
      case 'historical':
        return this.calculateHistoricalVolatility(historicalData);
      case 'ewma':
        return this.calculateEWMAVolatility(historicalData);
      default:
        return this.calculateHistoricalVolatility(historicalData);
    }
  }

  calculateHistoricalVolatility(data) {
    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Calculate log returns
    const returns = [];
    for (let i = 1; i < sortedData.length; i++) {
      const currentPrice = sortedData[i].price;
      const previousPrice = sortedData[i-1].price;
      
      // Handle edge cases for prediction market prices
      if (currentPrice <= 0 || previousPrice <= 0) continue;
      
      const logReturn = Math.log(currentPrice / previousPrice);
      returns.push(logReturn);
    }
    
    if (returns.length < 2) return 0.3; // Default if not enough return data
    
    // Calculate variance of returns
    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (returns.length - 1);
    
    // Annualize volatility (assuming daily data)
    const annualizedVol = Math.sqrt(variance * 365);
    
    return Math.min(Math.max(annualizedVol, 0.1), 1.0); // Bound between 10% and 100%
  }
  
  calculateEWMAVolatility(data) {
    // Exponentially Weighted Moving Average volatility
    // This gives more weight to recent observations
    const lambda = 0.94; // Decay factor, typical for daily data
    
    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Calculate log returns
    const returns = [];
    for (let i = 1; i < sortedData.length; i++) {
      const logReturn = Math.log(sortedData[i].price / sortedData[i-1].price);
      returns.push(logReturn);
    }
    
    if (returns.length < 2) return 0.3; // Default if not enough return data
    
    // Initialize variance with sample variance of first few returns
    let variance = returns.slice(0, Math.min(5, returns.length))
      .reduce((sum, val) => sum + val * val, 0) / returns.length;
    
    // Apply EWMA formula
    for (let i = 0; i < returns.length; i++) {
      variance = lambda * variance + (1 - lambda) * returns[i] * returns[i];
    }
    
    // Annualize volatility (assuming daily data)
    const annualizedVol = Math.sqrt(variance * 365);
    
    return Math.min(Math.max(annualizedVol, 0.1), 1.0); // Bound between 10% and 100%
  }

  getDynamicVolatility(marketId, timeToExpiry) {
    // Check if we have cached volatility
    if (this.volatilityCache.has(marketId)) {
      const cachedVol = this.volatilityCache.get(marketId);
      return this.applyTermStructure(cachedVol, timeToExpiry);
    }
    
    // If not cached, use a default and update async
    this.updateVolatilityEstimate(marketId);
    return this.applyTermStructure(0.3, timeToExpiry); // Default volatility
  }

  applyTermStructure(baseVol, timeToExpiry) {
    // Adjust volatility based on time to expiry
    // This is a simplified term structure model
    if (timeToExpiry <= 0) return baseVol;
    
    // Short term: higher vol, long term: lower vol
    if (timeToExpiry < 0.1) { // Less than ~1 month
      return baseVol * (1 + (0.1 - timeToExpiry) * 3); // Increase for short term
    } else if (timeToExpiry > 0.5) { // More than 6 months
      return baseVol * (1 - Math.min(0.3, (timeToExpiry - 0.5) * 0.3)); // Decrease for long term
    }
    
    return baseVol;
  }

  async updateVolatilityEstimate(marketId) {
    try {
      const volatility = await this.calculateVolatility(marketId);
      this.volatilityCache.set(marketId, volatility);
      return volatility;
    } catch (error) {
      console.error("Error updating volatility:", error);
      return 0.3; // Default on error
    }
  }
}

export class MarketMonitor {
  constructor() {
    this.markets = new Map();
    this.pollingIntervals = new Map();
    this.listeners = [];
  }

  startMonitoring(marketId, interval = 30000) { // Default 30 seconds
    if (this.pollingIntervals.has(marketId)) {
      return; // Already monitoring
    }
    
    // Initial fetch
    this.fetchAndUpdate(marketId);
    
    // Set up polling
    const intervalId = setInterval(() => {
      this.fetchAndUpdate(marketId);
    }, interval);
    
    this.pollingIntervals.set(marketId, intervalId);
  }

  stopMonitoring(marketId) {
    if (this.pollingIntervals.has(marketId)) {
      clearInterval(this.pollingIntervals.get(marketId));
      this.pollingIntervals.delete(marketId);
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  async fetchAndUpdate(marketId) {
    try {
      // In a real implementation, this would call an API service
      // For now, we'll simulate with mock data
      const marketData = await this.fetchMockMarketData(marketId);
      
      const previousData = this.markets.get(marketId);
      this.markets.set(marketId, marketData);
      
      // Determine update type
      let updateType = 'regular';
      if (previousData && Math.abs(marketData.price - previousData.price) > 0.05) {
        updateType = 'significant-change';
      }
      
      this.notifyListeners(marketId, marketData, updateType);
    } catch (error) {
      console.error(`Error fetching market data for ${marketId}:`, error);
    }
  }

  notifyListeners(marketId, data, updateType) {
    for (const listener of this.listeners) {
      listener(marketId, data, updateType);
    }
  }
  
  // Mock method for simulation - in real app, would be replaced by API calls
  async fetchMockMarketData(marketId) {
    // Generate semi-random market data for simulation
    const now = new Date();
    const basePrice = this.markets.has(marketId) 
      ? this.markets.get(marketId).price
      : 0.5; // Start at 50% if no previous data
    
    // Simulate small price movements
    const randomChange = (Math.random() - 0.5) * 0.03; // +/- 3% max change
    const newPrice = Math.max(0.01, Math.min(0.99, basePrice + randomChange));
    
    const volume = Math.floor(Math.random() * 1000) + 100;
    
    return {
      marketId,
      price: newPrice,
      volume,
      timestamp: now
    };
  }
}

// Create and export singleton instances
export const optionsPricingEngine = new OptionsPricingEngine();

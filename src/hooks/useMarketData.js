import { useState, useEffect, useCallback } from 'react';
import { marketDataService } from '../services/MarketDataService';

export function useMarketData(marketId) {
  const [market, setMarket] = useState(null);
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    if (!marketId) return;
    
    setLoading(true);
    try {
      const marketData = await marketDataService.getMarketData(marketId);
      setMarket(marketData);
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  // Fetch historical price data
  const fetchHistoricalPrices = useCallback(async (days = 30) => {
    if (!marketId) return;
    
    try {
      const priceData = await marketDataService.getHistoricalPrices(marketId, days);
      setHistoricalPrices(priceData);
    } catch (err) {
      console.error('Error fetching historical prices:', err);
      setHistoricalPrices([]);
    }
  }, [marketId]);

  // Initial data loading
  useEffect(() => {
    if (marketId) {
      fetchMarketData();
      fetchHistoricalPrices();
    }
  }, [marketId, fetchMarketData, fetchHistoricalPrices]);

  // Set up polling for price updates
  useEffect(() => {
    if (!marketId) return;
    
    const intervalId = setInterval(() => {
      fetchMarketData();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [marketId, fetchMarketData]);

  return {
    market,
    historicalPrices,
    loading,
    error,
    refreshMarket: fetchMarketData,
    refreshHistoricalPrices: fetchHistoricalPrices
  };
}

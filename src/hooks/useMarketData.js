import { useState, useEffect, useCallback } from 'react';
import { marketDataService } from '../services/MarketDataService';

export function useMarketData(marketId) {
  const [market, setMarket] = useState(null);
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    if (!marketId) return;
    
    setLoading(true);
    try {
      const marketData = await marketDataService.getMarketById(marketId);
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
  const fetchHistoricalPrices = useCallback(async (range = '30d') => {
    if (!marketId) return;
    
    try {
      const priceData = await marketDataService.getHistoricalPrices(marketId, range);
      setHistoricalPrices(priceData);
      setTimeRange(range);
    } catch (err) {
      console.error('Error fetching historical prices:', err);
      setHistoricalPrices([]);
    }
  }, [marketId]);

  // Initial data loading
  useEffect(() => {
    if (marketId) {
      fetchMarketData();
      fetchHistoricalPrices(timeRange);
    }
  }, [marketId, fetchMarketData, fetchHistoricalPrices, timeRange]);

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
    timeRange,
    setTimeRange: (range) => fetchHistoricalPrices(range),
    refreshMarket: fetchMarketData
  };
}

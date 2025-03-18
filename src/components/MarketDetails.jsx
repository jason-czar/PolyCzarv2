import React, { useState, useEffect } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import OptionChain from './OptionChain';
import MarketChart from './MarketChart';

const MarketDetails = ({ marketId, selectedDate }) => {
  const { market, historicalPrices, loading, error, refreshMarket } = useMarketData(marketId);
  const [timeRange, setTimeRange] = useState('30d');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-5/6"></div>
            </div>
          </div>
        </div>
        
        <div className="h-80 animate-pulse bg-gray-200 dark:bg-polyDark-lighter rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-card" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors duration-150 shadow-option hover:shadow-md"
          onClick={refreshMarket}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="text-center py-8 bg-white dark:bg-polyDark rounded-lg shadow-card">
        <p className="text-gray-500 dark:text-gray-400">Select a market to view details</p>
      </div>
    );
  }

  // Format expiry date
  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-polyDark rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {market.name}
          </h3>
          <div className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300 flex flex-wrap gap-3">
            <div>Current probability: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{(market.currentPrice * 100).toFixed(2)}%</span></div>
            <div className="text-gray-300 dark:text-gray-600">•</div>
            <div>24h Volume: <span className="font-semibold">${market.volume24h.toLocaleString()}</span></div>
            <div className="text-gray-300 dark:text-gray-600">•</div>
            <div>Liquidity: <span className="font-semibold">${market.liquidity.toLocaleString()}</span></div>
            <div className="text-gray-300 dark:text-gray-600">•</div>
            <div>Expires: <span className="font-semibold">{formatExpiryDate(market.expiresAt)}</span></div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4 flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</h4>
            <div className="flex rounded-md shadow-sm" role="group">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`py-1 px-3 text-xs font-medium transition-colors duration-150 ${
                    timeRange === range
                      ? 'bg-polyIndigo-600 dark:bg-polyIndigo-700 text-white'
                      : 'bg-white dark:bg-polyDark-lighter text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${range === '7d' ? 'rounded-l-md' : ''} ${range === '90d' ? 'rounded-r-md' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <MarketChart 
            marketId={marketId} 
            historicalPrices={historicalPrices} 
            timeRange={timeRange}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-polyDark rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Option Chain
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Options expire on {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'selected date'}
          </p>
        </div>
        
        <OptionChain 
          marketId={marketId} 
          selectedDate={selectedDate} 
          currentPrice={market.currentPrice}
        />
      </div>
    </div>
  );
};

export default MarketDetails;

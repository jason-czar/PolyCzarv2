import React, { useEffect, useState } from 'react';
import { optionsPricingEngine } from '../utils/optionsPricing';
import { ammInstance } from '../utils/amm';
import { marketDataService } from '../services/MarketDataService';

const OptionChain = ({ marketId, selectedDate, currentPrice = 0.5 }) => {
  const [optionsData, setOptionsData] = useState({ calls: [], puts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await ammInstance.initialize();
        await loadOptions();
      } catch (err) {
        console.error("Error initializing options chain:", err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    // When market ID or date changes, reload options
    loadOptions();
    
    // Flash UI for significant changes
    const intervalId = setInterval(() => {
      loadOptions(false); // Silent refresh without loading indicator
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [marketId, selectedDate, currentPrice]);

  const loadOptions = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      // Format date for API call
      const expiryDate = selectedDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get options chain from Polymarket API
      const options = await marketDataService.getOptionsChain(marketId, expiryDate);
      setOptionsData(options);
      setError(null);
    } catch (error) {
      console.error("Failed to load options:", error);
      setError("Failed to load options. Please try again later.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleBuy = (option, type) => {
    try {
      // In a real implementation, this would connect to your trading API
      console.log(`Buy ${type} option with strike ${option.strike}`);
      
      // Flash UI to simulate a trade
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
      
      // In a real app, you would update the UI, show a confirmation, etc.
    } catch (error) {
      console.error('Failed to execute buy:', error);
      alert('Failed to execute buy: ' + error.message);
    }
  };

  const handleSell = (option, type) => {
    try {
      // In a real implementation, this would connect to your trading API
      console.log(`Sell ${type} option with strike ${option.strike}`);
      
      // Flash UI to simulate a trade
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
      
      // In a real app, you would update the UI, show a confirmation, etc.
    } catch (error) {
      console.error('Failed to execute sell:', error);
      alert('Failed to execute sell: ' + error.message);
    }
  };

  // For styling the cells based on price changes
  const getPriceClass = () => {
    return showFlash ? 'bg-yellow-100 dark:bg-yellow-900 transition-colors duration-500' : '';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-1/4"></div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-polyDark-lighter rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-polyDark-lighter rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
            onClick={() => loadOptions()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:p-6 overflow-x-auto">
      {/* CALLS Table */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calls</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-polyDark-lighter">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strike</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Premium</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IV</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-polyDark-lighter divide-y divide-gray-200 dark:divide-gray-700">
              {optionsData.calls && optionsData.calls.length > 0 ? (
                optionsData.calls.map((option, index) => (
                  <tr key={`call-${index}`} className={getPriceClass()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {(option.strike * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${parseFloat(option.premium).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {option.delta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {option.iv || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors duration-150 shadow-option hover:shadow-md"
                          onClick={() => handleBuy(option, 'call')}
                        >
                          Buy
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors duration-150 shadow-option hover:shadow-md"
                          onClick={() => handleSell(option, 'call')}
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No call options available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PUTS Table */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puts</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-polyDark-lighter">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strike</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Premium</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IV</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-polyDark-lighter divide-y divide-gray-200 dark:divide-gray-700">
              {optionsData.puts && optionsData.puts.length > 0 ? (
                optionsData.puts.map((option, index) => (
                  <tr key={`put-${index}`} className={getPriceClass()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {(option.strike * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${parseFloat(option.premium).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {option.delta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {option.iv || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors duration-150 shadow-option hover:shadow-md"
                          onClick={() => handleBuy(option, 'put')}
                        >
                          Buy
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors duration-150 shadow-option hover:shadow-md"
                          onClick={() => handleSell(option, 'put')}
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No put options available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptionChain;

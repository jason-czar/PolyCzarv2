import React, { useEffect, useState } from 'react';
import { optionsPricingEngine } from '../utils/optionsPricing';
import { ammInstance } from '../utils/amm';

const OptionChain = ({ marketId, selectedDate, currentPrice = 0.5 }) => {
  const [options, setOptions] = useState([]);
  const [optionPrices, setOptionPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await optionsPricingEngine.initialize();
      await ammInstance.initialize();
      await loadOptions();
    };

    initialize();
  }, []);

  useEffect(() => {
    // When market ID or date changes, reload options
    loadOptions();
    
    // Subscribe to market updates
    const unsubscribe = optionsPricingEngine.subscribeToUpdates((updatedMarketId, updateType) => {
      if (updatedMarketId === marketId) {
        // Update prices
        updatePrices();
        
        // Flash UI for significant changes
        if (updateType === 'significant-change') {
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 1000);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [marketId, selectedDate, currentPrice]);

  const loadOptions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll generate sample options
      const generatedOptions = generateSampleOptions(marketId, selectedDate, currentPrice);
      setOptions(generatedOptions);
      await updatePrices(generatedOptions);
    } catch (error) {
      console.error("Failed to load options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrices = async (optionsList = options) => {
    const prices = {};
    
    for (const option of optionsList) {
      try {
        const price = ammInstance.getPrice(option.id, {
          marketId: option.marketId,
          currentPrice: option.currentPrice,
          strike: option.strike,
          expiry: option.expiry,
          type: option.type
        });
        
        prices[option.id] = price;
      } catch (error) {
        console.error(`Failed to get price for option ${option.id}:`, error);
      }
    }
    
    setOptionPrices(prices);
  };

  const handleBuy = (option) => {
    try {
      const result = ammInstance.executeTrade(option.id, 'buy', 1);
      console.log('Buy executed:', result);
      // In a real app, you would update the UI, show a confirmation, etc.
      updatePrices();
    } catch (error) {
      console.error('Failed to execute buy:', error);
      alert('Failed to execute buy: ' + error.message);
    }
  };

  const handleSell = (option) => {
    try {
      const result = ammInstance.executeTrade(option.id, 'sell', 1);
      console.log('Sell executed:', result);
      // In a real app, you would update the UI, show a confirmation, etc.
      updatePrices();
    } catch (error) {
      console.error('Failed to execute sell:', error);
      alert('Failed to execute sell: ' + error.message);
    }
  };

  // Helper to generate sample option data for demo
  const generateSampleOptions = (marketId, expiry, marketPrice = 0.5) => {
    // Use the passed marketPrice or fallback to 0.5
    const currentPrice = marketPrice;
    const strikes = [30, 40, 50, 60, 70];
    const options = [];
    
    for (const strike of strikes) {
      // Call option
      options.push({
        id: `${marketId}-call-${strike}`,
        marketId,
        currentPrice,
        strike,
        expiry,
        type: 'call',
        description: `${strike}% Call`
      });
      
      // Put option
      options.push({
        id: `${marketId}-put-${strike}`,
        marketId,
        currentPrice,
        strike,
        expiry,
        type: 'put',
        description: `${strike}% Put`
      });
    }
    
    return options;
  };

  // For styling the cells based on price changes
  const getPriceClass = (option, type) => {
    const price = optionPrices[option.id];
    if (!price) return '';
    
    return showFlash ? 'bg-yellow-100 dark:bg-yellow-900 transition-colors duration-500' : '';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-card">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-polyDark-lighter">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Option
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Bid
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Ask
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Delta
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-polyDark divide-y divide-gray-200 dark:divide-gray-700">
          {options.map((option) => (
            <tr key={option.id} className="hover:bg-gray-50 dark:hover:bg-polyDark-lighter transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {option.description}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 ${getPriceClass(option, 'bid')}`}>
                {optionPrices[option.id] ? (optionPrices[option.id].bidPrice * 100).toFixed(2) + '%' : '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 ${getPriceClass(option, 'ask')}`}>
                {optionPrices[option.id] ? (optionPrices[option.id].askPrice * 100).toFixed(2) + '%' : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {optionPrices[option.id] ? optionPrices[option.id].delta.toFixed(2) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBuy(option)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs shadow-option transition-all duration-150 hover:shadow-md"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleSell(option)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs shadow-option transition-all duration-150 hover:shadow-md"
                  >
                    Sell
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionChain;

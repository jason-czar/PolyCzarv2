import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ammInstance } from '../utils/amm';
import { marketDataService } from '../services/MarketDataService';

const Portfolio = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [pnl, setPnl] = useState(0);

  useEffect(() => {
    // Only load portfolio if user is authenticated
    if (isLoaded && isSignedIn) {
      loadPortfolio();
      
      // Set up interval to refresh portfolio data
      const intervalId = setInterval(() => {
        loadPortfolio(false); // Don't show loading indicator for auto-refresh
      }, 30000);
      
      return () => clearInterval(intervalId);
    } else if (isLoaded && !isSignedIn) {
      // If user is not signed in but auth has loaded, set loading to false
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const loadPortfolio = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // In a real app, this would come from a backend service using the user ID
      // For demo purposes, we'll use our AMM instance to get the positions
      const userId = user?.id || 'demo-user';
      const userPositions = await ammInstance.getUserPositions(userId);
      
      // Fetch current market data for each position
      const positionsWithMarketData = await Promise.all(
        userPositions.map(async (position) => {
          try {
            const marketData = await marketDataService.getMarketData(position.marketId);
            return {
              ...position,
              marketName: marketData.name,
              currentMarketPrice: marketData.currentPrice
            };
          } catch (error) {
            console.error(`Failed to get market data for ${position.marketId}:`, error);
            return {
              ...position,
              marketName: 'Unknown Market',
              currentMarketPrice: 0.5
            };
          }
        })
      );
      
      setPositions(positionsWithMarketData);
      
      // Calculate portfolio value and P&L
      const value = positionsWithMarketData.reduce((total, pos) => total + pos.currentValue, 0);
      const profitLoss = positionsWithMarketData.reduce((total, pos) => total + (pos.currentValue - pos.costBasis), 0);
      
      setPortfolioValue(value);
      setPnl(profitLoss);
    } catch (error) {
      console.error("Failed to load portfolio:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      const userId = user?.id || 'demo-user';
      await ammInstance.closePosition(positionId, userId);
      await loadPortfolio();
    } catch (error) {
      console.error(`Failed to close position ${positionId}:`, error);
      alert('Failed to close position: ' + error.message);
    }
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format percentage values
  const formatPercentage = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  // Determine CSS classes for profit/loss display
  const getPnlClasses = (value) => {
    return value >= 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 bg-gray-200 dark:bg-polyDark-lighter rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-polyDark-lighter rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-polyDark rounded-lg shadow-card p-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Total Value</h2>
          <p className="text-3xl font-bold mt-2">{formatCurrency(portfolioValue)}</p>
        </div>
        
        <div className="bg-white dark:bg-polyDark rounded-lg shadow-card p-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Profit/Loss</h2>
          <p className={`text-3xl font-bold mt-2 ${getPnlClasses(pnl)}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-polyDark rounded-lg shadow-card p-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Active Positions</h2>
          <p className="text-3xl font-bold mt-2">{positions.length}</p>
        </div>
      </div>
      
      {/* Positions Table */}
      <div className="bg-white dark:bg-polyDark rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Your Positions</h2>
        </div>
        
        {positions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any open positions yet.</p>
            <Link 
              to="/markets" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-polyIndigo-600 hover:bg-polyIndigo-700 transition-colors duration-150"
            >
              Explore Markets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-polyDark-lighter">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Market
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Option
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entry Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    P&L
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-polyDark divide-y divide-gray-200 dark:divide-gray-700">
                {positions.map((position) => (
                  <tr key={position.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/markets/${position.marketId}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 hover:dark:text-indigo-300">
                        {position.marketName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {position.optionType} {formatPercentage(position.strike)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatPercentage(position.entryPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatPercentage(position.currentPrice)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnlClasses(position.currentValue - position.costBasis)}`}>
                      {formatCurrency(position.currentValue - position.costBasis)} ({((position.currentValue / position.costBasis - 1) * 100).toFixed(2)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleClosePosition(position.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors duration-150"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => loadPortfolio()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-polyDark-lighter hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Portfolio;

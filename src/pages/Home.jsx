import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [marketUrl, setMarketUrl] = useState('');
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  const handleMarketUrlChange = (e) => {
    setMarketUrl(e.target.value);
    setSearchError('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (!marketUrl.trim()) {
      setSearchError('Please enter a Polymarket URL');
      return;
    }
    
    // Extract market ID from URL
    try {
      let marketId = null;
      console.log('Attempting to parse URL:', marketUrl);
      
      // Try simple string-based parsing first
      if (marketUrl.includes('polymarket.com/market/')) {
        const urlParts = marketUrl.split('polymarket.com/market/');
        if (urlParts.length > 1) {
          marketId = urlParts[1].split('?')[0].split('/')[0].trim();
          console.log('Extracted market ID using string split:', marketId);
        }
      } 
      
      // If that fails, try URL parsing
      if (!marketId && marketUrl.includes('polymarket.com')) {
        try {
          // Add protocol if missing
          let urlToProcess = marketUrl;
          if (!urlToProcess.startsWith('http')) {
            urlToProcess = 'https://' + urlToProcess;
          }
          
          const url = new URL(urlToProcess);
          console.log('Successfully parsed URL object:', url.toString());
          
          const pathParts = url.pathname.split('/');
          console.log('Path parts:', pathParts);
          
          const marketIndex = pathParts.indexOf('market');
          if (marketIndex !== -1 && pathParts.length > marketIndex + 1) {
            marketId = pathParts[marketIndex + 1];
            console.log('Extracted market ID using URL parsing:', marketId);
          }
        } catch (urlError) {
          console.error('Error creating URL object:', urlError.message);
          // Continue with other parsing methods
        }
      }
      
      // Last resort - try to extract any slug-like part
      if (!marketId) {
        const slugMatch = marketUrl.match(/[a-z0-9-]+$/);
        if (slugMatch && slugMatch[0]) {
          marketId = slugMatch[0];
          console.log('Extracted potential market ID using regex:', marketId);
        }
      }
      
      if (!marketId) {
        console.error('No market ID could be extracted from URL:', marketUrl);
        throw new Error('Could not extract market ID from URL');
      }
      
      console.log('Final extracted market ID:', marketId);
      
      // For mock data, map to one of our existing IDs
      const mockIdMap = {
        // Common Polymarket IDs mapped to our mock IDs
        'will-donald-trump-win-the-2024-us-presidential-election': 'trump-2024',
        'trump-2024-presidential-election': 'trump-2024',
        'donald-trump-2024': 'trump-2024',
        'will-btc-be-above-30000-on-june-30-2025': 'btc-price-30k-june',
        'btc-30k-june-2025': 'btc-price-30k-june',
        'bitcoin-30k': 'btc-price-30k-june',
        'will-eth-reach-10000-before-december-2025': 'eth-merge-successful',
        'ethereum-10k': 'eth-merge-successful',
        'will-fed-raise-rates-june-2025': 'fed-rate-hike-june',
        'fed-rates-june': 'fed-rate-hike-june',
        'will-apple-market-cap-exceed-4t-2025': 'apple-market-cap',
        'apple-4t': 'apple-market-cap'
      };
      
      // Try to find exact match
      let finalMarketId = mockIdMap[marketId];
      
      // If no exact match, try to find a partial match
      if (!finalMarketId) {
        console.log('No exact match found, trying partial matches');
        for (const [key, value] of Object.entries(mockIdMap)) {
          if (key.includes(marketId) || marketId.includes(key)) {
            finalMarketId = value;
            console.log('Found partial match:', key, '->', value);
            break;
          }
        }
      }
      
      // Default fallback if still no match
      if (!finalMarketId) {
        console.log('No matches found, using default fallback');
        finalMarketId = 'btc-price-30k-june';
      }
      
      console.log('Navigating to market with ID:', finalMarketId);
      
      // Navigate to market details
      navigate(`/markets/${finalMarketId}`);
      
    } catch (error) {
      console.error('Error parsing Polymarket URL:', error.message);
      setSearchError('Invalid Polymarket URL format. Please enter a valid market URL');
    }
  };

  return (
    <div className="w-full py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="block">Welcome to</span>
          <span className="block text-indigo-600 dark:text-indigo-400">PolyCzar</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Advanced options pricing and trading for prediction markets. 
          Analyze, trade, and manage your portfolio with our powerful tools.
        </p>
        
        {/* Search Box for Polymarket URLs */}
        <div className="mt-8 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="market-url"
                name="market-url"
                type="text"
                className="w-full py-3 pl-10 pr-4 text-gray-300 bg-gray-900 rounded-l-lg focus:outline-none focus:ring-0 border-0"
                placeholder="Paste Polymarket URL"
                value={marketUrl}
                onChange={handleMarketUrlChange}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center h-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          {searchError && (
            <p className="mt-2 text-sm text-red-500 dark:text-red-400">{searchError}</p>
          )}
        </div>
        
        <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center">
          <div className="rounded-md shadow">
            <Link
              to="/markets"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Explore Markets
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to="/portfolio"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-indigo-600 dark:text-indigo-400 text-xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Advanced Analysis</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Utilize our modified Black-Scholes model to price options for binary outcomes, with volatility and delta calculations.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-indigo-600 dark:text-indigo-400 text-xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Liquidity Pools</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Automated Market Maker (AMM) manages liquidity and facilitates trades with minimal slippage.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-indigo-600 dark:text-indigo-400 text-xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Instant Trading</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Buy and sell options with one click, with real-time pricing and portfolio updates.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Get Started Today
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          No signup required. Jump right in and start exploring the markets.
        </p>
      </div>
    </div>
  );
};

export default Home;

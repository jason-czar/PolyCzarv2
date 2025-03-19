import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marketDataService } from '../services/MarketDataService';
import MarketDetails from '../components/MarketDetails';
import PolymarketEmbed from '../components/PolymarketEmbed';

const Markets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [polymarketId, setPolymarketId] = useState('seaair-ceasefire-in-ukraine-before-may');
  const navigate = useNavigate();
  const { marketId } = useParams();

  useEffect(() => {
    fetchMarkets();
  }, []);
  
  // Handle direct navigation to a market via URL parameter
  useEffect(() => {
    if (marketId && markets.length > 0) {
      setSelectedMarket(marketId);
      
      // Find corresponding Polymarket ID
      const market = markets.find(m => m.id === marketId);
      if (market && market.polymarketId) {
        setPolymarketId(market.polymarketId);
      }
    }
  }, [marketId, markets]);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const marketsList = await marketDataService.getMarkets();
      setMarkets(marketsList);
      
      // If there are markets and none selected, select the first one
      if (marketsList.length > 0 && !selectedMarket) {
        setSelectedMarket(marketsList[0].id);
        if (marketsList[0].polymarketId) {
          setPolymarketId(marketsList[0].polymarketId);
        }
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketSelect = (marketId) => {
    setSelectedMarket(marketId);
    // Find the corresponding Polymarket ID
    const market = markets.find(m => m.id === marketId);
    if (market && market.polymarketId) {
      setPolymarketId(market.polymarketId);
    } else {
      // Default Polymarket ID if none specified for this market
      setPolymarketId('seaair-ceasefire-in-ukraine-before-may');
    }
    
    // Update URL without navigating
    window.history.pushState(null, '', `/markets/${marketId}`);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Generate dates for the dropdown
  const generateExpiryDates = () => {
    const dates = [];
    const today = new Date();
    
    // Add dates for the next 10 weeks (every Friday)
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      // Find the next Friday
      date.setDate(date.getDate() + ((5 + 7 - date.getDay()) % 7) + (i * 7));
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    // Add end of quarter dates
    const quarters = [2, 5, 8, 11]; // March, June, September, December
    const year = today.getFullYear();
    
    quarters.forEach(month => {
      const quarterEnd = new Date(year, month, 0);
      // Only add if it's in the future
      if (quarterEnd > today) {
        dates.push({
          value: quarterEnd.toISOString().split('T')[0],
          label: `${quarterEnd.toLocaleDateString('en-US', { month: 'short' })} Quarterly`
        });
      }
    });
    
    // Add year-end date
    const yearEnd = new Date(year, 11, 31);
    dates.push({
      value: yearEnd.toISOString().split('T')[0],
      label: `${year} Year-End`
    });
    
    return dates.sort((a, b) => a.value.localeCompare(b.value));
  };

  return (
    <div className="w-full py-8">
      <h1 className="text-2xl font-bold mb-6">Markets</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Market List */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Available Markets</h2>
            </div>
            
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {markets.map((market) => (
                  <li
                    key={market.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 
                      ${selectedMarket === market.id ? 'bg-indigo-50 dark:bg-indigo-900' : ''}`}
                    onClick={() => handleMarketSelect(market.id)}
                  >
                    <div className="font-medium">{market.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Current: {(market.currentPrice * 100).toFixed(2)}%
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Expiry Date Selection */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Option Expiry Date</h2>
            </div>
            <div className="p-4">
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {generateExpiryDates().map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Market Details and Polymarket Embed */}
        <div className="lg:w-3/4">
          {selectedMarket ? (
            <>
              {/* Polymarket Embed */}
              <PolymarketEmbed marketId={polymarketId} />
              
              {/* PolyCzar Market Details */}
              <MarketDetails 
                marketId={selectedMarket} 
                selectedDate={selectedDate}
              />
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a market to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Markets;

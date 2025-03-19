import React, { useEffect, useRef } from 'react';

const PolymarketEmbed = ({ marketId, showVolume = true, showChart = false }) => {
  const containerRef = useRef(null);
  const embedCreated = useRef(false);

  useEffect(() => {
    // Only load the script once
    if (!document.querySelector('script[src*="@polymarket/embeds"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@polymarket/embeds@latest/dist/index.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Create the embed component when the script is loaded
    const timer = setInterval(() => {
      if (window.customElements && window.customElements.get('polymarket-market-embed') && !embedCreated.current) {
        createEmbed();
        embedCreated.current = true;
        clearInterval(timer);
      }
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Update the embed when marketId changes
  useEffect(() => {
    if (window.customElements && window.customElements.get('polymarket-market-embed')) {
      createEmbed();
    }
  }, [marketId]);

  const createEmbed = () => {
    if (!containerRef.current) return;

    // Clear previous embed
    containerRef.current.innerHTML = '';
    
    // Create new embed element
    const embed = document.createElement('polymarket-market-embed');
    embed.setAttribute('market', marketId || 'seaair-ceasefire-in-ukraine-before-may');
    embed.setAttribute('volume', showVolume.toString());
    embed.setAttribute('chart', showChart.toString());
    embed.setAttribute('theme', 'dark');
    
    containerRef.current.appendChild(embed);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Polymarket Data</h2>
      </div>
      <div className="p-2" ref={containerRef}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    </div>
  );
};

export default PolymarketEmbed;

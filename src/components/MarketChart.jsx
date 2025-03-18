import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketChart = ({ marketId, historicalPrices, timeRange = '30d' }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (!historicalPrices || historicalPrices.length === 0) {
      return;
    }

    const labels = historicalPrices.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const prices = historicalPrices.map(item => item.price * 100); 

    let chartTitle = 'Market Price History';
    switch (timeRange) {
      case '7d':
        chartTitle = '7-Day Price History';
        break;
      case '30d':
        chartTitle = '30-Day Price History';
        break;
      case '90d':
        chartTitle = '90-Day Price History';
        break;
      default:
        chartTitle = 'Price History';
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: chartTitle,
          color: 'rgba(255, 255, 255, 0.87)',
          font: {
            size: 16,
            weight: 'normal'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `Price: ${context.parsed.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: function(value) {
              return `${value}%`;
            },
            color: 'rgba(255, 255, 255, 0.6)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#4f46e5', 
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          fill: true,
          tension: 0.2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#4f46e5',
          borderWidth: 2
        }
      ]
    };

    setChartOptions(options);
    setChartData(data);
  }, [historicalPrices, timeRange]);

  if (!historicalPrices || historicalPrices.length === 0) {
    return (
      <div className="flex justify-center items-center h-80 bg-gray-800 rounded-lg">
        <div className="text-gray-400">No historical data available</div>
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-800 rounded-lg p-4">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default MarketChart;

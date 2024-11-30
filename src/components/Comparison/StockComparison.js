import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createChart } from 'lightweight-charts';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const ComparisonContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 20px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 20px;
`;

const StockComparison = () => {
  const [stocks, setStocks] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);
  const [metrics, setMetrics] = useState({});

  const addStock = async (symbol) => {
    try {
      const data = await yahooFinanceService.getHistoricalData(symbol);
      setStocks([...stocks, { symbol, data }]);
      
      // Fetch metrics
      const response = await fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics`
      );
      const metricsData = await response.json();
      setMetrics(prev => ({
        ...prev,
        [symbol]: metricsData.quoteSummary.result[0]
      }));
    } catch (error) {
      console.error('Error adding stock for comparison:', error);
    }
  };

  useEffect(() => {
    if (!stocks.length) return;

    // Create chart
    const chart = createChart(document.getElementById('comparisonChart'), {
      width: document.getElementById('comparisonChart').clientWidth,
      height: 400,
      layout: {
        background: { color: '#1C1C28' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
    });

    // Add lines for each stock
    stocks.forEach((stock, index) => {
      const colors = ['#2962FF', '#FF6D00', '#2E7D32', '#C2185B'];
      const lineSeries = chart.addLineSeries({
        color: colors[index % colors.length],
        title: stock.symbol,
      });
      
      // Normalize data to percentage change
      const firstPrice = stock.data[0].close;
      const normalizedData = stock.data.map(item => ({
        time: item.time,
        value: ((item.close - firstPrice) / firstPrice) * 100
      }));
      
      lineSeries.setData(normalizedData);
    });

    setChartInstance(chart);

    return () => {
      chart.remove();
    };
  }, [stocks]);

  return (
    <ComparisonContainer>
      <h2>Stock Comparison</h2>
      <div>
        <input
          placeholder="Add stock symbol"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addStock(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>

      <ChartContainer id="comparisonChart" />

      <MetricsGrid>
        {Object.entries(metrics).map(([symbol, data]) => (
          <div key={symbol}>
            <h3>{symbol}</h3>
            <div>P/E: {data.financialData.trailingPE?.raw}</div>
          </div>
        ))}
      </MetricsGrid>
    </ComparisonContainer>
  );
};

export default StockComparison; 
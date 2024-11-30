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

const StockInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 200px;
  margin-bottom: 20px;
`;

const ExchangeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  margin-left: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const StockComparison = () => {
  const [stocks, setStocks] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [exchange, setExchange] = useState('NSE');

  const addStock = async (symbol) => {
    try {
      console.log('Fetching data for symbol:', symbol);
      const data = await yahooFinanceService.getHistoricalData(symbol.toUpperCase(), exchange);
      
      if (data && data.length > 0) {
        const fullSymbol = `${symbol.toUpperCase()}.${exchange}`;
        setStocks(prevStocks => [...prevStocks, { symbol: fullSymbol, data }]);
        
        setMetrics(prev => ({
          ...prev,
          [fullSymbol]: {
            lastPrice: data[data.length - 1].close,
            change: ((data[data.length - 1].close - data[0].close) / data[0].close * 100).toFixed(2)
          }
        }));
      } else {
        alert(`No data available for ${symbol} on ${exchange}. Please check if the symbol is correct.`);
      }
    } catch (error) {
      console.error('Error adding stock for comparison:', error);
      alert(`Error fetching data for ${symbol}. Please check if the symbol is correct.`);
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
      
      // Add safety check for data
      if (stock.data && stock.data.length > 0) {
        // Normalize data to percentage change
        const firstPrice = stock.data[0].close;
        const normalizedData = stock.data.map(item => ({
          time: item.time,
          value: ((item.close - firstPrice) / firstPrice) * 100
        })).filter(item => item.value != null); // Filter out any null values
        
        lineSeries.setData(normalizedData);
      }
    });

    setChartInstance(chart);

    return () => {
      chart.remove();
    };
  }, [stocks]);

  return (
    <ComparisonContainer>
      <h2>Indian Stock Comparison</h2>
      <InputContainer>
        <StockInput
          placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addStock(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <ExchangeSelect
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
        >
          <option value="NS">NSE</option>
          <option value="BSE">BSE</option>
        </ExchangeSelect>
      </InputContainer>

      <ChartContainer id="comparisonChart" />

      <MetricsGrid>
        {Object.entries(metrics).map(([symbol, data]) => (
          <div key={symbol}>
            <h3>{symbol}</h3>
            <div>Last Price: ₹{data.lastPrice?.toFixed(2)}</div>
            <div>Change: {data.change}%</div>
          </div>
        ))}
      </MetricsGrid>
    </ComparisonContainer>
  );
};

export default StockComparison; 
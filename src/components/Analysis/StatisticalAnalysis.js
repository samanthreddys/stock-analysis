import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AnalysisContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.grid};
  border-radius: 4px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.grid};
`;

const MetricCard = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
`;

const StatisticalAnalysis = ({ symbol, exchange = 'NSE' }) => {
  const [analysis, setAnalysis] = useState(null);

  const calculateStatistics = (prices) => {
    // Calculate returns
    const returns = prices.slice(1).map((price, i) => 
      (price - prices[i]) / prices[i]
    );

    // Mean return
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

    // Standard deviation
    const variance = returns.reduce((a, b) => 
      a + Math.pow(b - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Sharpe ratio (assuming risk-free rate of 5%)
    const riskFreeRate = 0.05;
    const sharpeRatio = (meanReturn - riskFreeRate) / stdDev;

    // Maximum drawdown
    let maxDrawdown = 0;
    let peak = prices[0];
    prices.forEach(price => {
      if (price > peak) peak = price;
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    return {
      meanReturn: meanReturn * 100,
      stdDev: stdDev * 100,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      volatility: stdDev * Math.sqrt(252) * 100 // Annualized volatility
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.${exchange}?interval=1d&range=1y`
        );
        const data = await response.json();
        const prices = data.chart.result[0].indicators.quote[0].close;
        const stats = calculateStatistics(prices);
        setAnalysis(stats);
      } catch (error) {
        console.error('Error fetching data for analysis:', error);
      }
    };

    fetchData();
  }, [symbol, exchange]);

  if (!analysis) return <div>Loading analysis...</div>;

  return (
    <AnalysisContainer>
      <h3>Statistical Analysis</h3>
      <MetricsGrid>
        <MetricCard>
          <h4>Annual Return</h4>
          <div>{analysis.meanReturn.toFixed(2)}%</div>
        </MetricCard>
        <MetricCard>
          <h4>Volatility</h4>
          <div>{analysis.volatility.toFixed(2)}%</div>
        </MetricCard>
        <MetricCard>
          <h4>Sharpe Ratio</h4>
          <div>{analysis.sharpeRatio.toFixed(2)}</div>
        </MetricCard>
        <MetricCard>
          <h4>Maximum Drawdown</h4>
          <div>{analysis.maxDrawdown.toFixed(2)}%</div>
        </MetricCard>
      </MetricsGrid>
    </AnalysisContainer>
  );
};

export default StatisticalAnalysis; 
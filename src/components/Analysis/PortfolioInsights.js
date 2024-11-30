import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const InsightsContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const StockCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
`;

const InsightItem = styled.div`
  margin: 10px 0;
  padding: 8px;
  background: ${props => props.sentiment === 'positive' ? 'rgba(0, 200, 5, 0.1)' : 
    props.sentiment === 'negative' ? 'rgba(255, 59, 48, 0.1)' : 'transparent'};
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
`;

const PortfolioInsights = ({ portfolio }) => {
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);

  const analyzeStock = async (stock) => {
    try {
      // Fetch comprehensive stock data
      const quote = await yahooFinanceService.getStockQuote(stock.symbol);
      const historicalData = await yahooFinanceService.getHistoricalData(stock.symbol);
      
      // Calculate key metrics
      const currentPrice = quote.regularMarketPrice;
      const priceChange = currentPrice - stock.avgPrice;
      const percentageChange = (priceChange / stock.avgPrice) * 100;
      
      // Calculate technical indicators
      const sma50 = calculateSMA(historicalData, 50);
      const sma200 = calculateSMA(historicalData, 200);
      const rsi = calculateRSI(historicalData);
      
      // Generate insights
      const stockInsights = {
        performance: {
          value: percentageChange,
          insight: `${percentageChange > 0 ? 'Gained' : 'Lost'} ${Math.abs(percentageChange).toFixed(2)}% since purchase`,
          sentiment: percentageChange > 0 ? 'positive' : 'negative'
        },
        technical: {
          value: currentPrice,
          insight: generateTechnicalInsight(currentPrice, sma50, sma200, rsi),
          sentiment: currentPrice > sma50 ? 'positive' : 'negative'
        },
        risk: {
          value: calculateVolatility(historicalData),
          insight: generateRiskInsight(historicalData),
          sentiment: 'neutral'
        },
        action: {
          recommendation: generateRecommendation(currentPrice, sma50, sma200, rsi),
          sentiment: 'neutral'
        }
      };

      return stockInsights;
    } catch (error) {
      console.error(`Error analyzing ${stock.symbol}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true);
      const allInsights = {};
      
      for (const stock of portfolio) {
        allInsights[stock.symbol] = await analyzeStock(stock);
      }
      
      setInsights(allInsights);
      setLoading(false);
    };

    generateInsights();
  }, [portfolio]);

  if (loading) {
    return <LoadingSpinner>Analyzing portfolio...</LoadingSpinner>;
  }

  return (
    <InsightsContainer>
      <h2>Portfolio Insights</h2>
      
      {portfolio.map(stock => (
        <StockCard key={stock.symbol}>
          <h3>{stock.symbol}</h3>
          
          {insights[stock.symbol] && (
            <>
              <InsightItem sentiment={insights[stock.symbol].performance.sentiment}>
                <strong>Performance: </strong>
                {insights[stock.symbol].performance.insight}
              </InsightItem>
              
              <InsightItem sentiment={insights[stock.symbol].technical.sentiment}>
                <strong>Technical Analysis: </strong>
                {insights[stock.symbol].technical.insight}
              </InsightItem>
              
              <InsightItem sentiment={insights[stock.symbol].risk.sentiment}>
                <strong>Risk Assessment: </strong>
                {insights[stock.symbol].risk.insight}
              </InsightItem>
              
              <InsightItem sentiment={insights[stock.symbol].action.sentiment}>
                <strong>Recommendation: </strong>
                {insights[stock.symbol].action.recommendation}
              </InsightItem>
            </>
          )}
        </StockCard>
      ))}
    </InsightsContainer>
  );
};

// Helper functions for technical analysis
const calculateSMA = (data, period) => {
  // Implementation of Simple Moving Average calculation
};

const calculateRSI = (data) => {
  // Implementation of RSI calculation
};

const calculateVolatility = (data) => {
  // Implementation of volatility calculation
};

const generateTechnicalInsight = (currentPrice, sma50, sma200, rsi) => {
  // Generate technical analysis insight based on indicators
};

const generateRiskInsight = (data) => {
  // Generate risk assessment based on volatility and other factors
};

const generateRecommendation = (currentPrice, sma50, sma200, rsi) => {
  // Generate trading recommendation based on technical indicators
};

export default PortfolioInsights; 
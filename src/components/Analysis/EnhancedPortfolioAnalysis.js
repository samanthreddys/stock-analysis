import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';

const AnalysisContainer = styled.div`
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid ${props => {
    if (props.trend > 0) return props.theme.colors.profit;
    if (props.trend < 0) return props.theme.colors.loss;
    return props.theme.colors.neutral;
  }};
`;

const StockAnalysis = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 15px;
`;

const StockCard = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 20px;
  border-radius: 4px;
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
`;

const EnhancedPortfolioAnalysis = ({ portfolio }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    analyzePortfolio(portfolio);
  }, [portfolio]);

  const analyzePortfolio = (data) => {
    // Calculate portfolio metrics
    const totalValue = data.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalInvestment = data.reduce((sum, stock) => sum + (stock.avgPrice * stock.quantity), 0);
    const totalPnL = data.reduce((sum, stock) => sum + stock.pnl, 0);
    const pnlPercentage = (totalPnL / totalInvestment) * 100;
    
    // Calculate day's movement
    const dayChange = data.reduce((sum, stock) => sum + (stock.currentValue * (stock.dayChange / 100)), 0);
    
    // Risk analysis
    const stocksAnalysis = data.map(stock => ({
      ...stock,
      riskLevel: calculateRiskLevel(stock),
      recommendation: generateRecommendation(stock),
      potentialTarget: calculatePriceTarget(stock)
    }));

    // Sort stocks by various metrics
    const topPerformers = [...stocksAnalysis].sort((a, b) => b.netChange - a.netChange).slice(0, 3);
    const underperformers = [...stocksAnalysis].sort((a, b) => a.netChange - b.netChange).slice(0, 3);

    setAnalysis({
      summary: {
        totalValue,
        totalInvestment,
        totalPnL,
        pnlPercentage,
        dayChange,
        dayChangePercent: (dayChange / totalValue) * 100
      },
      stocks: stocksAnalysis,
      topPerformers,
      underperformers
    });
  };

  const calculateRiskLevel = (stock) => {
    // Risk calculation based on volatility and price movement
    const volatility = Math.abs(stock.netChange);
    if (volatility > 10) return 'High';
    if (volatility > 5) return 'Medium';
    return 'Low';
  };

  const generateRecommendation = (stock) => {
    const pnlPercent = (stock.pnl / (stock.avgPrice * stock.quantity)) * 100;
    
    if (pnlPercent <= -10) return 'Consider averaging down';
    if (pnlPercent >= 20) return 'Consider booking partial profits';
    return 'Hold position';
  };

  const calculatePriceTarget = (stock) => {
    // Simple price target calculation
    const currentPrice = stock.ltp;
    const momentum = stock.netChange / 100;
    return currentPrice * (1 + momentum);
  };

  if (!analysis) return <div>Loading analysis...</div>;

  return (
    <AnalysisContainer>
      <h2>Portfolio Analysis</h2>
      
      <SummaryGrid>
        <MetricCard trend={analysis.summary.pnlPercentage}>
          <h3>Total Value</h3>
          <div>₹{analysis.summary.totalValue.toLocaleString('en-IN')}</div>
          <div>P&L: {analysis.summary.pnlPercentage.toFixed(2)}%</div>
        </MetricCard>
        
        <MetricCard trend={analysis.summary.dayChangePercent}>
          <h3>Day's Change</h3>
          <div>₹{analysis.summary.dayChange.toLocaleString('en-IN')}</div>
          <div>{analysis.summary.dayChangePercent.toFixed(2)}%</div>
        </MetricCard>
        
        <MetricCard>
          <h3>Investment</h3>
          <div>₹{analysis.summary.totalInvestment.toLocaleString('en-IN')}</div>
        </MetricCard>
      </SummaryGrid>

      <StockAnalysis>
        <h3>Top Performers</h3>
        {analysis.topPerformers.map(stock => (
          <StockCard key={stock.symbol}>
            <h4>{stock.symbol}</h4>
            <div>Change: {stock.netChange.toFixed(2)}%</div>
            <div>P&L: ₹{stock.pnl.toLocaleString('en-IN')}</div>
            <div>Risk Level: {stock.riskLevel}</div>
            <div>Recommendation: {stock.recommendation}</div>
            <div>Potential Target: ₹{stock.potentialTarget.toFixed(2)}</div>
          </StockCard>
        ))}

        <h3>Underperformers</h3>
        {analysis.underperformers.map(stock => (
          <StockCard key={stock.symbol}>
            <h4>{stock.symbol}</h4>
            <div>Change: {stock.netChange.toFixed(2)}%</div>
            <div>P&L: ₹{stock.pnl.toLocaleString('en-IN')}</div>
            <div>Risk Level: {stock.riskLevel}</div>
            <div>Recommendation: {stock.recommendation}</div>
            <div>Potential Target: ₹{stock.potentialTarget.toFixed(2)}</div>
          </StockCard>
        ))}
      </StockAnalysis>

      <ActionButton onClick={() => window.print()}>
        Export Analysis Report
      </ActionButton>
    </AnalysisContainer>
  );
};

export default EnhancedPortfolioAnalysis; 
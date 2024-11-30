import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AnalyticsContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  padding: 15px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PortfolioAnalytics = ({ holdings }) => {
  const [analytics, setAnalytics] = useState({
    totalValue: 0,
    dailyChange: 0,
    sectorAllocation: [],
    riskMetrics: {},
    performance: {}
  });

  useEffect(() => {
    const calculateAnalytics = async () => {
      try {
        let totalValue = 0;
        let dailyChange = 0;
        const sectorData = {};

        // Calculate portfolio metrics
        for (const holding of holdings) {
          const value = holding.quantity * holding.avgPrice;
          totalValue += value;

          // Group by sector
          const sector = holding.sector || 'Other';
          sectorData[sector] = (sectorData[sector] || 0) + value;
        }

        // Format sector allocation for pie chart
        const sectorAllocation = Object.entries(sectorData).map(([name, value]) => ({
          name,
          value: (value / totalValue) * 100
        }));

        // Calculate risk metrics
        const riskMetrics = {
          beta: calculatePortfolioBeta(holdings),
          sharpeRatio: calculateSharpeRatio(holdings),
          volatility: calculateVolatility(holdings)
        };

        setAnalytics({
          totalValue,
          dailyChange,
          sectorAllocation,
          riskMetrics,
          performance: {
            daily: dailyChange,
            weekly: calculatePerformance(holdings, 7),
            monthly: calculatePerformance(holdings, 30),
            yearly: calculatePerformance(holdings, 365)
          }
        });
      } catch (error) {
        console.error('Error calculating analytics:', error);
      }
    };

    calculateAnalytics();
  }, [holdings]);

  return (
    <AnalyticsContainer>
      <h2>Portfolio Analytics</h2>
      
      <MetricsGrid>
        <MetricCard>
          <h3>Total Value</h3>
          <div>₹{analytics.totalValue.toFixed(2)}</div>
        </MetricCard>
        <MetricCard>
          <h3>Daily Change</h3>
          <div style={{ color: analytics.dailyChange >= 0 ? '#00C805' : '#FF3B30' }}>
            {analytics.dailyChange > 0 ? '+' : ''}{analytics.dailyChange.toFixed(2)}%
          </div>
        </MetricCard>
        <MetricCard>
          <h3>Portfolio Beta</h3>
          <div>{analytics.riskMetrics.beta?.toFixed(2) || 'N/A'}</div>
        </MetricCard>
        <MetricCard>
          <h3>Sharpe Ratio</h3>
          <div>{analytics.riskMetrics.sharpeRatio?.toFixed(2) || 'N/A'}</div>
        </MetricCard>
      </MetricsGrid>

      <ChartContainer>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={analytics.sectorAllocation}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {analytics.sectorAllocation.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsContainer>
  );
};

export default PortfolioAnalytics; 
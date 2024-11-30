import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.grid};
  padding: ${props => props.theme.spacing.grid};
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.grid};
  border-radius: 4px;
`;

const MetricLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.sizes.small};
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.sizes.body};
  font-weight: 500;
`;

const formatLargeNumber = (num) => {
  if (num >= 1.0e+9) {
    return (num / 1.0e+9).toFixed(2) + 'B';
  } else if (num >= 1.0e+6) {
    return (num / 1.0e+6).toFixed(2) + 'M';
  } else if (num >= 1.0e+3) {
    return (num / 1.0e+3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

const FinancialMetrics = ({ symbol, exchange = 'NSE' }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}.${exchange}?modules=financialData,defaultKeyStatistics`
        );
        const data = await response.json();
        setMetrics(data.quoteSummary.result[0]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, [symbol, exchange]);

  if (!metrics) return <div>Loading metrics...</div>;

  const { financialData, defaultKeyStatistics } = metrics;

  return (
    <MetricsContainer>
      <MetricCard>
        <MetricLabel>Market Cap</MetricLabel>
        <MetricValue>₹{formatLargeNumber(financialData.marketCap.raw)}</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>P/E Ratio</MetricLabel>
        <MetricValue>{financialData.trailingPE?.raw?.toFixed(2) || 'N/A'}</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>52 Week High</MetricLabel>
        <MetricValue>₹{financialData.fiftyTwoWeekHigh.raw.toFixed(2)}</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>52 Week Low</MetricLabel>
        <MetricValue>₹{financialData.fiftyTwoWeekLow.raw.toFixed(2)}</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>Volume</MetricLabel>
        <MetricValue>{formatLargeNumber(financialData.volume.raw)}</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>Beta</MetricLabel>
        <MetricValue>{defaultKeyStatistics.beta?.raw?.toFixed(2) || 'N/A'}</MetricValue>
      </MetricCard>
    </MetricsContainer>
  );
};

export default FinancialMetrics; 
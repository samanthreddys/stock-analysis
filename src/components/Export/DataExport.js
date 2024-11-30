import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const ExportButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const DataExport = ({ symbol, exchange = 'NSE' }) => {
  const exportToCSV = async (period = '1y') => {
    try {
      // Fetch historical data
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.${exchange}?interval=1d&range=${period}`
      );
      const data = await response.json();
      
      // Format data for CSV
      const csvRows = [
        ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'], // Headers
      ];

      const quotes = data.chart.result[0];
      const timestamps = quotes.timestamp;
      const { open, high, low, close, volume } = quotes.indicators.quote[0];

      timestamps.forEach((timestamp, index) => {
        csvRows.push([
          format(new Date(timestamp * 1000), 'yyyy-MM-dd'),
          open[index].toFixed(2),
          high[index].toFixed(2),
          low[index].toFixed(2),
          close[index].toFixed(2),
          volume[index]
        ]);
      });

      // Create CSV content
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${symbol}_${period}_history.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div>
      <ExportButton onClick={() => exportToCSV('1mo')}>Export 1 Month Data</ExportButton>
      <ExportButton onClick={() => exportToCSV('1y')}>Export 1 Year Data</ExportButton>
      <ExportButton onClick={() => exportToCSV('5y')}>Export 5 Year Data</ExportButton>
    </div>
  );
};

export default DataExport; 
import React, { useState } from 'react';
import styled from 'styled-components';
import Papa from 'papaparse';

const ImportContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.theme.colors.primary};
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.loss};
  margin-top: 10px;
`;

const PortfolioImport = ({ onImportSuccess }) => {
  const [error, setError] = useState('');

  const validateCSV = (results) => {
    const requiredColumns = [
      'Instrument',
      'Qty',
      'Avg. cost',
      'LTP',
      'Cur. val',
      'P&L',
      'Net chg.',
      'Day chg.'
    ];
    
    const headers = results.meta.fields;
    
    // Check for required columns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate data
    results.data.forEach((row, index) => {
      if (!row.Instrument) throw new Error(`Missing Instrument at row ${index + 1}`);
      if (isNaN(row.Qty) || row.Qty <= 0) {
        throw new Error(`Invalid Quantity at row ${index + 1}`);
      }
      if (isNaN(row['Avg. cost']) || row['Avg. cost'] <= 0) {
        throw new Error(`Invalid Average Cost at row ${index + 1}`);
      }
    });

    return true;
  };

  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          validateCSV(results);
          
          // Transform data to portfolio format
          const portfolio = results.data.map(row => ({
            symbol: row.Instrument,
            quantity: Number(row.Qty),
            avgPrice: Number(row['Avg. cost']),
            ltp: Number(row.LTP),
            currentValue: Number(row['Cur. val']),
            pnl: Number(row['P&L']),
            netChange: Number(row['Net chg.']),
            dayChange: Number(row['Day chg.'])
          }));

          onImportSuccess(portfolio);
          setError('');
        } catch (err) {
          setError(err.message);
        }
      },
      error: (err) => {
        setError('Error parsing CSV file: ' + err.message);
      }
    });
  };

  return (
    <ImportContainer>
      <h2>Import Portfolio</h2>
      <DropZone
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          handleFileUpload(file);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          Drop your CSV file here or click to upload
        </label>
      </DropZone>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <div>
        <h3>Expected CSV Format:</h3>
        <pre>
          {`Instrument,Qty,Avg. cost,LTP,Cur. val,P&L,Net chg.,Day chg.
RELIANCE,10,2500.50,2600.00,26000.00,995.00,3.98,1.25
TCS,5,3400.75,3450.25,17251.25,247.50,1.45,0.75`}
        </pre>
        <ul>
          <li>Instrument: Stock symbol</li>
          <li>Qty: Number of shares</li>
          <li>Avg. cost: Purchase price per share</li>
          <li>LTP: Last traded price</li>
          <li>Cur. val: Current value (Qty * LTP)</li>
          <li>P&L: Profit/Loss</li>
          <li>Net chg.: Net percentage change</li>
          <li>Day chg.: Day's percentage change</li>
        </ul>
      </div>
    </ImportContainer>
  );
};

export default PortfolioImport; 
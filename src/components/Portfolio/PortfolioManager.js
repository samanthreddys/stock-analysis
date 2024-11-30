import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const PortfolioContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const PortfolioTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.background};
  }
`;

const AddHoldingForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 4px;
`;

const Button = styled.button`
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

const PortfolioManager = () => {
  const [holdings, setHoldings] = useState([]);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    quantity: '',
    avgPrice: ''
  });

  useEffect(() => {
    // Load portfolio from localStorage
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      setHoldings(JSON.parse(savedPortfolio));
    }
  }, []);

  useEffect(() => {
    // Save portfolio to localStorage
    localStorage.setItem('portfolio', JSON.stringify(holdings));
  }, [holdings]);

  const addHolding = async (e) => {
    e.preventDefault();
    try {
      // Validate symbol
      const quote = await yahooFinanceService.getStockQuote(newHolding.symbol);
      if (!quote) throw new Error('Invalid symbol');

      setHoldings([...holdings, {
        ...newHolding,
        quantity: Number(newHolding.quantity),
        avgPrice: Number(newHolding.avgPrice)
      }]);

      setNewHolding({ symbol: '', quantity: '', avgPrice: '' });
    } catch (error) {
      console.error('Error adding holding:', error);
      alert('Invalid stock symbol');
    }
  };

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.avgPrice);
    }, 0);
  };

  return (
    <PortfolioContainer>
      <h2>Portfolio Manager</h2>
      
      <AddHoldingForm onSubmit={addHolding}>
        <Input
          placeholder="Stock Symbol"
          value={newHolding.symbol}
          onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
        />
        <Input
          placeholder="Quantity"
          type="number"
          value={newHolding.quantity}
          onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
        />
        <Input
          placeholder="Average Price"
          type="number"
          value={newHolding.avgPrice}
          onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
        />
        <Button type="submit">Add Holding</Button>
      </AddHoldingForm>
      
      <PortfolioTable>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Average Price</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(holding => (
            <tr key={holding.symbol}>
              <td>{holding.symbol}</td>
              <td>{holding.quantity}</td>
              <td>{holding.avgPrice}</td>
              <td>{holding.quantity * holding.avgPrice}</td>
            </tr>
          ))}
        </tbody>
      </PortfolioTable>
      
      <h3>Total Portfolio Value: {calculatePortfolioValue()}</h3>
    </PortfolioContainer>
  );
};

export default PortfolioManager; 
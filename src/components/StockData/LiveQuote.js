import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const QuoteContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.grid};
  border-radius: 4px;
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.sizes.heading};
  color: ${props => props.change >= 0 ? props.theme.colors.gain : props.theme.colors.loss};
`;

const Change = styled.div`
  font-size: ${props => props.theme.typography.sizes.body};
  color: ${props => props.change >= 0 ? props.theme.colors.gain : props.theme.colors.loss};
`;

const LiveQuote = ({ symbol, exchange = 'NSE' }) => {
  const [quoteData, setQuoteData] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchQuote = async () => {
      try {
        const data = await yahooFinanceService.getStockQuote(symbol, exchange);
        setQuoteData(data);
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    };

    // Initial fetch
    fetchQuote();

    // Set up polling every 5 seconds during market hours
    intervalId = setInterval(() => {
      if (yahooFinanceService.isMarketOpen()) {
        fetchQuote();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [symbol, exchange]);

  if (!quoteData) return <div>Loading...</div>;

  const {
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent
  } = quoteData;

  return (
    <QuoteContainer>
      <Price change={regularMarketChange}>
        ₹{regularMarketPrice.toFixed(2)}
      </Price>
      <Change change={regularMarketChange}>
        {regularMarketChange > 0 ? '+' : ''}
        {regularMarketChange.toFixed(2)} ({regularMarketChangePercent.toFixed(2)}%)
      </Change>
    </QuoteContainer>
  );
};

export default LiveQuote; 
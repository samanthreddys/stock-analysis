import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const SearchContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 4px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const SymbolLookup = ({ onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const searchSymbols = async (query) => {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${query}&lang=en&region=IN&quotesCount=10`
      );
      const data = await response.json();
      return data.quotes.filter(quote => quote.quoteType === 'EQUITY');
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        const results = await searchSymbols(searchTerm);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search for Indian stocks (e.g., RELIANCE, TCS)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((item) => (
            <SuggestionItem
              key={item.symbol}
              onClick={() => {
                onSymbolSelect(item);
                setSearchTerm('');
                setSuggestions([]);
              }}
            >
              {item.symbol} - {item.shortname || item.longname}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </SearchContainer>
  );
};

export default SymbolLookup; 
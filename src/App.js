import React from 'react';
import { ThemeProvider } from 'styled-components';
import StockComparison from './components/Comparison/StockComparison';
import { theme } from './config/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <StockComparison />
      </div>
    </ThemeProvider>
  );
}

export default App; 
const API_BASE_URL = 'http://localhost:5000/api';

const yahooFinanceService = {
  formatSymbol: (symbol) => {
    return symbol.toUpperCase().trim();
  },

  getHistoricalData: async (symbol) => {
    try {
      const formattedSymbol = yahooFinanceService.formatSymbol(symbol);
      const response = await fetch(`${API_BASE_URL}/stock/${formattedSymbol}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      return result.data.map(item => ({
        time: Math.floor(new Date(item.date).getTime() / 1000),
        close: item.close
      }));

    } catch (error) {
      console.error('Error fetching Indian stock data:', error);
      alert(error.message);
      return [];
    }
  }
};

export default yahooFinanceService; 
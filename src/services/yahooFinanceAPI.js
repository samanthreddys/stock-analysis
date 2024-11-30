class YahooFinanceService {
  constructor() {
    this.baseUrl = 'https://query1.finance.yahoo.com/v8/finance';
  }

  // Helper to format Indian stock symbols
  formatIndianSymbol(symbol, exchange = 'NSE') {
    // NSE symbols end with .NS, BSE with .BO
    const suffix = exchange.toUpperCase() === 'NSE' ? '.NS' : '.BO';
    return `${symbol}${suffix}`;
  }

  async getStockQuote(symbol, exchange = 'NSE') {
    try {
      const formattedSymbol = this.formatIndianSymbol(symbol, exchange);
      const response = await fetch(`${this.baseUrl}/quote?symbols=${formattedSymbol}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching Indian stock quote:', error);
      throw error;
    }
  }

  async getIndianMarketStatus() {
    try {
      // Using ^NSEI (Nifty 50) to check market status
      const response = await fetch(`${this.baseUrl}/quote?symbols=^NSEI`);
      const data = await response.json();
      return {
        isMarketOpen: data.marketState === "REGULAR",
        lastUpdated: new Date(data.regularMarketTime * 1000),
        nifty50Value: data.regularMarketPrice
      };
    } catch (error) {
      console.error('Error fetching market status:', error);
      throw error;
    }
  }

  async getIndianIndices() {
    try {
      // Fetch major Indian indices
      const indices = ['^NSEI', '^BSESN', '^CNXBANK', '^CNXAUTO'];
      const response = await fetch(`${this.baseUrl}/quote?symbols=${indices.join(',')}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching Indian indices:', error);
      throw error;
    }
  }
}

export default new YahooFinanceService(); 
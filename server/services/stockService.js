// Default Indian stock symbols to track
const DEFAULT_SYMBOLS = [
  { symbol: '^BSESN', name: 'BSE Sensex', price: 72500, change: 250, changePercent: 0.35 },
  { symbol: '^NSEI', name: 'Nifty 50', price: 22500, change: 80, changePercent: 0.36 },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2950, change: 15, changePercent: 0.51 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 4250, change: -25, changePercent: -0.58 },
  { symbol: 'INFY.NS', name: 'Infosys', price: 1850, change: 12, changePercent: 0.65 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1650, change: -8, changePercent: -0.48 },
  { symbol: 'ITC.NS', name: 'ITC Limited', price: 425, change: 3, changePercent: 0.71 }
];

// Lazy load yahoo-finance2 to handle ESM/CJS compatibility
let yahooFinanceInstance = null;
let yahooFinanceLoaded = false;

async function loadYahooFinance() {
  if (yahooFinanceLoaded) return yahooFinanceInstance;

  try {
    const yf = await import('yahoo-finance2');
    yahooFinanceInstance = yf.default || yf;
    yahooFinanceLoaded = true;
    return yahooFinanceInstance;
  } catch (error) {
    console.error('Failed to load yahoo-finance2:', error.message);
    yahooFinanceLoaded = true;
    return null;
  }
}

/**
 * Get market summary for top Indian stocks
 * @returns {Array} Array of stock data objects
 */
async function getMarketSummary() {
  const symbols = [
    { symbol: '^BSESN', name: 'BSE Sensex' },
    { symbol: '^NSEI', name: 'Nifty 50' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'ITC.NS', name: 'ITC Limited' },
    { symbol: 'WIPRO.NS', name: 'Wipro' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' }
  ];

  try {
    const yahooFinance = await loadYahooFinance();
    if (!yahooFinance || !yahooFinance.quote) {
      throw new Error('Yahoo finance module failed to load');
    }

    const results = await Promise.allSettled(
      symbols.map(async ({ symbol, name }) => {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol,
          name,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          previousClose: quote.regularMarketPreviousClose
        };
      })
    );

    return results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

  } catch (error) {
    console.error('Market Summary Error:', error);
    // Return mock data on complete failure using the requested symbols
    return symbols.map(stock => ({
      ...stock,
      price: 1000 + Math.random() * 500,
      change: (Math.random() - 0.5) * 50,
      changePercent: (Math.random() - 0.5) * 5,
      high: 1500,
      low: 1000,
      volume: 1000000,
    }));
  }
}

/**
 * Get quote for a specific stock symbol
 * @param {String} symbol - Stock symbol (e.g., 'RELIANCE.NS')
 * @returns {Object} Formatted stock data
 */
async function getQuote(symbol) {
  try {
    const yahooFinance = await loadYahooFinance();

    if (!yahooFinance || !yahooFinance.quote) {
      // Return mock data
      const mockStock = DEFAULT_SYMBOLS.find(s => s.symbol === symbol) || DEFAULT_SYMBOLS[0];
      return {
        ...mockStock,
        price: mockStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: mockStock.change.toFixed(2),
        changePercent: mockStock.changePercent.toFixed(2),
        changePositive: mockStock.change >= 0,
        high: (mockStock.price * 1.02).toFixed(2),
        low: (mockStock.price * 0.98).toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        updatedAt: new Date().toISOString()
      };
    }

    const quote = await yahooFinance.quote(symbol);
    return formatStockData(quote);
  } catch (error) {
    console.error(`Quote Error for ${symbol}:`, error.message);
    // Return mock data on error
    const mockStock = DEFAULT_SYMBOLS.find(s => s.symbol === symbol) || DEFAULT_SYMBOLS[0];
    return {
      ...mockStock,
      price: mockStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: mockStock.change.toFixed(2),
      changePercent: mockStock.changePercent.toFixed(2),
      changePositive: mockStock.change >= 0,
      high: (mockStock.price * 1.02).toFixed(2),
      low: (mockStock.price * 0.98).toFixed(2),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Get detailed info for a specific stock symbol (richer than getQuote)
 * @param {String} symbol - Stock symbol (e.g., 'RELIANCE.NS')
 * @returns {Object} Detailed stock data including fundamentals
 */
async function getStockDetail(symbol) {
  try {
    const yahooFinance = await loadYahooFinance();

    if (!yahooFinance || !yahooFinance.quote) {
      const mockStock = DEFAULT_SYMBOLS.find(s => s.symbol === symbol) || DEFAULT_SYMBOLS[0];
      return buildMockDetail(mockStock);
    }

    const quote = await yahooFinance.quote(symbol, {
      fields: [
        'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
        'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketVolume',
        'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
        'marketCap', 'trailingPE', 'dividendYield',
        'shortName', 'longName', 'symbol',
        'sector', 'industry', 'currency'
      ]
    });

    if (!quote) {
      const mockStock = DEFAULT_SYMBOLS.find(s => s.symbol === symbol) || DEFAULT_SYMBOLS[0];
      return buildMockDetail(mockStock);
    }

    const change = quote.regularMarketChange || 0;
    const changePercent = quote.regularMarketChangePercent || 0;
    const price = quote.regularMarketPrice || 0;

    return {
      symbol: quote.symbol,
      name: getStockName(quote),
      price: formatCurrency(price),
      change: formatCurrency(change),
      changePercent: formatPercentage(changePercent),
      changePositive: change >= 0,
      high: formatCurrency(quote.regularMarketDayHigh || 0),
      low: formatCurrency(quote.regularMarketDayLow || 0),
      volume: quote.regularMarketVolume || 0,
      weekHigh52: formatCurrency(quote.fiftyTwoWeekHigh || 0),
      weekLow52: formatCurrency(quote.fiftyTwoWeekLow || 0),
      marketCap: quote.marketCap || null,
      peRatio: quote.trailingPE ? quote.trailingPE.toFixed(2) : null,
      dividendYield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
      sector: quote.sector || null,
      industry: quote.industry || null,
      currency: quote.currency || 'INR',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Stock Detail Error for ${symbol}:`, error.message);
    const mockStock = DEFAULT_SYMBOLS.find(s => s.symbol === symbol) || DEFAULT_SYMBOLS[0];
    return buildMockDetail(mockStock);
  }
}

/**
 * Build mock detail object from a default stock
 * @param {Object} mockStock
 * @returns {Object}
 */
function buildMockDetail(mockStock) {
  return {
    symbol: mockStock.symbol,
    name: mockStock.name,
    price: formatCurrency(mockStock.price),
    change: formatCurrency(mockStock.change),
    changePercent: formatPercentage(mockStock.changePercent),
    changePositive: mockStock.change >= 0,
    high: formatCurrency(mockStock.price * 1.02),
    low: formatCurrency(mockStock.price * 0.98),
    volume: Math.floor(Math.random() * 1000000) + 500000,
    weekHigh52: formatCurrency(mockStock.price * 1.15),
    weekLow52: formatCurrency(mockStock.price * 0.85),
    marketCap: null,
    peRatio: null,
    dividendYield: null,
    sector: null,
    industry: null,
    currency: 'INR',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Format raw Yahoo Finance data to consistent structure
 * @param {Object} quote - Raw quote data from Yahoo Finance
 * @returns {Object} Formatted stock data
 */
function formatStockData(quote) {
  if (!quote) return null;

  const change = quote.regularMarketChange || 0;
  const changePercent = quote.regularMarketChangePercent || 0;
  const price = quote.regularMarketPrice || 0;

  return {
    symbol: quote.symbol,
    name: getStockName(quote),
    price: formatCurrency(price),
    change: formatCurrency(change),
    changePercent: formatPercentage(changePercent),
    changePositive: change >= 0,
    high: formatCurrency(quote.regularMarketDayHigh || 0),
    low: formatCurrency(quote.regularMarketDayLow || 0),
    volume: quote.regularMarketVolume || 0,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get human-readable stock name
 * @param {Object} quote - Yahoo Finance quote object
 * @returns {String} Stock name
 */
function getStockName(quote) {
  const nameMap = {
    '^BSESN': 'BSE Sensex',
    '^NSEI': 'Nifty 50',
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy Services',
    'INFY.NS': 'Infosys',
    'HDFCBANK.NS': 'HDFC Bank',
    'ITC.NS': 'ITC Limited'
  };

  return nameMap[quote.symbol] || quote.shortName || quote.longName || quote.symbol;
}

/**
 * Format number as Indian currency
 * @param {Number} value - Number to format
 * @returns {String} Formatted currency string
 */
function formatCurrency(value) {
  if (value === null || value === undefined) return '0.00';

  // Handle large numbers (indices)
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return value.toFixed(2);
}

/**
 * Format percentage value
 * @param {Number} value - Percentage value
 * @returns {String} Formatted percentage
 */
function formatPercentage(value) {
  if (value === null || value === undefined) return '0.00';
  return (value).toFixed(2);
}

/**
 * Search for stocks by query
 * @param {String} query - Search query
 * @returns {Array} Array of matching stocks
 */
async function searchStocks(query) {
  try {
    const yahooFinance = await loadYahooFinance();

    if (!yahooFinance || !yahooFinance.search) {
      return [];
    }

    const results = await yahooFinance.search(query);
    return results.quotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname || quote.symbol,
      exchange: quote.exchange,
      type: quote.quoteType
    }));
  } catch (error) {
    console.error('Stock Search Error:', error);
    return [];
  }
}

module.exports = {
  getMarketSummary,
  getQuote,
  getStockDetail,
  searchStocks
};

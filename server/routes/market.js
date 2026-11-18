const express = require('express');
const stockService = require('../services/stockService');
const schemeService = require('../services/schemeService');

const router = express.Router();

/**
 * GET /api/market/update
 * Get market summary with top Indian stocks
 */
router.get('/update', async (req, res, next) => {
  try {
    const marketData = await stockService.getMarketSummary();
    res.json({
      success: true,
      data: {
        market: marketData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/market/quote/:symbol
 * Get single stock quote (basic)
 */
router.get('/quote/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Stock symbol is required' });
    }

    const quote = await stockService.getQuote(symbol);
    if (!quote) {
      return res.status(404).json({ success: false, message: `Could not fetch data for symbol: ${symbol}` });
    }

    res.json({ success: true, data: { quote } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/market/stock/:symbol
 * Get detailed info for an individual stock including fundamentals
 * Example: GET /api/market/stock/RELIANCE.NS
 */
router.get('/stock/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Stock symbol is required' });
    }

    const detail = await stockService.getStockDetail(symbol);
    if (!detail) {
      return res.status(404).json({ success: false, message: `Could not fetch detail for symbol: ${symbol}` });
    }

    res.json({ success: true, data: { stock: detail } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/market/schemes/search?q=query
 * Search mutual fund schemes by name
 * Example: GET /api/market/schemes/search?q=HDFC
 */
router.get('/schemes/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const schemes = await schemeService.searchSchemes(q.trim());
    res.json({ success: true, data: { schemes } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/market/scheme/:schemeCode
 * Get detailed info for an individual mutual fund scheme
 * Example: GET /api/market/scheme/119551
 */
router.get('/scheme/:schemeCode', async (req, res, next) => {
  try {
    const { schemeCode } = req.params;
    if (!schemeCode) {
      return res.status(400).json({ success: false, message: 'Scheme code is required' });
    }

    const scheme = await schemeService.getSchemeDetail(schemeCode);
    if (!scheme) {
      return res.status(404).json({ success: false, message: `Could not fetch data for scheme code: ${schemeCode}` });
    }

    res.json({ success: true, data: { scheme } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

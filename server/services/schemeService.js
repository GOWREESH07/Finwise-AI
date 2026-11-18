const https = require('https');

const MFAPI_BASE = 'https://api.mfapi.in';

/**
 * Make a GET request to mfapi.in
 * @param {String} path - URL path
 * @returns {Promise<Object>} Parsed JSON response
 */
function mfapiGet(path) {
  return new Promise((resolve, reject) => {
    const url = `${MFAPI_BASE}${path}`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse mfapi response'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get detailed info for a mutual fund scheme
 * @param {String|Number} schemeCode - AMFI scheme code
 * @returns {Object} Scheme details with NAV history
 */
async function getSchemeDetail(schemeCode) {
  try {
    const data = await mfapiGet(`/mf/${schemeCode}`);

    if (!data || !data.meta) {
      return null;
    }

    const latestNav = data.data && data.data.length > 0 ? data.data[0] : null;
    const previousNav = data.data && data.data.length > 1 ? data.data[1] : null;

    let navChange = null;
    let navChangePercent = null;
    let navChangePositive = false;

    if (latestNav && previousNav) {
      const current = parseFloat(latestNav.nav);
      const previous = parseFloat(previousNav.nav);
      navChange = (current - previous).toFixed(4);
      navChangePercent = (((current - previous) / previous) * 100).toFixed(2);
      navChangePositive = current >= previous;
    }

    // Get up to 30 days of NAV history
    const navHistory = (data.data || []).slice(0, 30).map((entry) => ({
      date: entry.date,
      nav: parseFloat(entry.nav).toFixed(4)
    }));

    return {
      schemeCode: data.meta.scheme_code,
      schemeName: data.meta.scheme_name,
      fundHouse: data.meta.fund_house,
      schemeType: data.meta.scheme_type,
      schemeCategory: data.meta.scheme_category,
      schemeNavName: data.meta.scheme_nav_name,
      latestNav: latestNav ? parseFloat(latestNav.nav).toFixed(4) : null,
      navDate: latestNav ? latestNav.date : null,
      navChange,
      navChangePercent,
      navChangePositive,
      navHistory,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Scheme Detail Error for ${schemeCode}:`, error.message);
    return null;
  }
}

/**
 * Search mutual fund schemes by name
 * @param {String} query - Search query
 * @returns {Array} Matching schemes with code and name
 */
async function searchSchemes(query) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const allSchemes = await mfapiGet('/mf');

    if (!Array.isArray(allSchemes)) {
      return [];
    }

    const q = query.trim().toLowerCase();
    const results = allSchemes
      .filter((scheme) =>
        scheme.schemeName && scheme.schemeName.toLowerCase().includes(q)
      )
      .slice(0, 20)
      .map((scheme) => ({
        schemeCode: scheme.schemeCode,
        schemeName: scheme.schemeName
      }));

    return results;
  } catch (error) {
    console.error('Scheme Search Error:', error.message);
    return [];
  }
}

module.exports = {
  getSchemeDetail,
  searchSchemes
};

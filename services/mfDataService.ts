
const BASE_URL = 'https://api.mfapi.in/mf';

export interface MFAPIResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: {
    date: string;
    nav: string;
  }[];
}

export interface MFSearchItem {
  schemeCode: number;
  schemeName: string;
}

/**
 * Searches for funds across the entire Indian MF database
 */
export const searchFunds = async (query: string): Promise<MFSearchItem[]> => {
  if (!query || query.length < 3) return [];
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

/**
 * Fetches current NAV and historical data for a specific fund scheme.
 * Calculated CAGR based on fetched data.
 */
export const fetchLiveFundData = async (schemeCode: string | number) => {
  try {
    const response = await fetch(`${BASE_URL}/${schemeCode}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const json: MFAPIResponse = await response.json();
    
    if (!json.data || json.data.length === 0) return null;

    const currentNav = parseFloat(json.data[0].nav);
    
    // Calculate 1 Year Return (Approx 252 trading days)
    const nav1yAgo = json.data[252] ? parseFloat(json.data[252].nav) : parseFloat(json.data[json.data.length - 1].nav);
    const returns1y = ((currentNav - nav1yAgo) / nav1yAgo) * 100;

    // Calculate 3 Year Return (Approx 756 trading days)
    const nav3yAgo = json.data[756] ? parseFloat(json.data[756].nav) : null;
    let returns3y = 0;
    if (nav3yAgo) {
      returns3y = (Math.pow(currentNav / nav3yAgo, 1 / 3) - 1) * 100;
    }

    return {
      meta: json.meta,
      currentNav,
      returns1y: parseFloat(returns1y.toFixed(2)),
      returns3y: parseFloat(returns3y.toFixed(2)),
      lastUpdated: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error(`Error fetching fund ${schemeCode}:`, error);
    return null;
  }
};

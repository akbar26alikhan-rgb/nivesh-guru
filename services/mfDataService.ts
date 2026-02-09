
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

const calculateCAGR = (currentNav: number, pastNav: number, years: number) => {
  if (!pastNav || pastNav <= 0) return 0;
  const cagr = (Math.pow(currentNav / pastNav, 1 / years) - 1) * 100;
  return parseFloat(cagr.toFixed(2));
};

export const fetchLiveFundData = async (schemeCode: string | number) => {
  try {
    const response = await fetch(`${BASE_URL}/${schemeCode}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const json: MFAPIResponse = await response.json();
    
    if (!json.data || json.data.length === 0) return null;

    const currentNav = parseFloat(json.data[0].nav);
    
    // Returns calculation (Approx 252 trading days per year)
    const getNavAtYear = (years: number) => {
      const index = Math.min(Math.round(years * 252), json.data.length - 1);
      return parseFloat(json.data[index].nav);
    };

    const nav1y = getNavAtYear(1);
    const nav3y = getNavAtYear(3);
    const nav5y = getNavAtYear(5);
    const nav10y = getNavAtYear(10);

    return {
      meta: json.meta,
      currentNav,
      returns: {
        '1y': ((currentNav - nav1y) / nav1y) * 100,
        '3y': calculateCAGR(currentNav, nav3y, 3),
        '5y': calculateCAGR(currentNav, nav5y, 5),
        '10y': calculateCAGR(currentNav, nav10y, 10),
      },
      lastUpdated: new Date().toLocaleTimeString(),
      history: json.data.slice(0, 252).reverse().map(d => ({
        date: d.date,
        nav: parseFloat(d.nav)
      }))
    };
  } catch (error) {
    console.error(`Error fetching fund ${schemeCode}:`, error);
    return null;
  }
};

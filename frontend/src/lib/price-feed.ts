const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

const COIN_IDS = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'L1X': 'l1x',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network'
};

export interface PriceData {
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export async function getTokenPrices(symbols: string[]): Promise<Record<string, PriceData>> {
  try {
    const ids = symbols
      .map(symbol => COIN_IDS[symbol as keyof typeof COIN_IDS])
      .filter(Boolean)
      .join(',');

    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currency=usd&include_24hr_change=true&include_last_updated_at=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }

    const data = await response.json();
    
    const prices: Record<string, PriceData> = {};
    
    for (const symbol of symbols) {
      const id = COIN_IDS[symbol as keyof typeof COIN_IDS];
      if (id && data[id]) {
        prices[symbol] = {
          current_price: data[id].usd,
          price_change_percentage_24h: data[id].usd_24h_change,
          last_updated: new Date(data[id].last_updated_at * 1000).toISOString()
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
}

export async function subscribeToTokenPrices(
  symbols: string[],
  onUpdate: (prices: Record<string, PriceData>) => void,
  interval = 60000 // 1 minute by default
): Promise<() => void> {
  let timeoutId: NodeJS.Timeout;

  const updatePrices = async () => {
    try {
      const prices = await getTokenPrices(symbols);
      onUpdate(prices);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
    timeoutId = setTimeout(updatePrices, interval);
  };

  // Initial update
  await updatePrices();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
} 
export interface Token {
  symbol: string
  name: string
  price: number
  change24h: number
  allocation: number
  amount: number
  value: number
}

export interface PortfolioData {
  totalValue: number
  change24h: number
  tokens: Token[]
  performance: {
    date: string
    value: number
  }[]
}

export const mockTokens: Token[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 65000,
    change24h: 2.5,
    allocation: 40,
    amount: 0.5,
    value: 32500
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3500,
    change24h: 1.8,
    allocation: 30,
    amount: 5,
    value: 17500
  },
  {
    symbol: 'L1X',
    name: 'L1X Token',
    price: 100,
    change24h: 5.2,
    allocation: 20,
    amount: 100,
    value: 10000
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1,
    change24h: 0.1,
    allocation: 10,
    amount: 5000,
    value: 5000
  }
]

export const mockPerformance = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-02-01', value: 52000 },
  { date: '2024-03-01', value: 51000 },
  { date: '2024-04-01', value: 55000 },
  { date: '2024-05-01', value: 60000 },
  { date: '2024-06-01', value: 65000 }
]

export const mockPortfolio: PortfolioData = {
  totalValue: 65000,
  change24h: 2.5,
  tokens: mockTokens,
  performance: mockPerformance
}

export const mockTransactions = [
  {
    type: 'buy',
    symbol: 'BTC',
    amount: 0.1,
    value: 6500,
    date: '2024-06-01T10:00:00Z'
  },
  {
    type: 'sell',
    symbol: 'ETH',
    amount: 1,
    value: 3500,
    date: '2024-06-01T09:30:00Z'
  },
  {
    type: 'buy',
    symbol: 'L1X',
    amount: 50,
    value: 5000,
    date: '2024-06-01T09:00:00Z'
  }
] 
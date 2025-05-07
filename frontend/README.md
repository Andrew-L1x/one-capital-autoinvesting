# One Capital Frontend

A Web3 frontend application for One Capital, a crypto-native investment automation platform.

## Features

- 🏠 Modern, responsive UI with Tailwind CSS
- 🔐 Wallet connection (MetaMask, WalletConnect)
- 📊 Portfolio management and analytics
- 🔄 Auto-rebalancing functionality
- 📈 Asset allocation builder
- 🥧 Interactive portfolio visualization

## Tech Stack

- Next.js 14
- Tailwind CSS
- shadcn/ui
- Wagmi + Viem
- Recharts
- TypeScript

## Prerequisites

- Node.js 18+ and npm
- MetaMask or other Web3 wallet
- WalletConnect Project ID (for WalletConnect integration)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/one-capital-frontend.git
   cd one-capital-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your WalletConnect Project ID to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── auth/           # Authentication page
│   ├── dashboard/      # Dashboard page
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # UI components
│   └── providers.tsx  # App providers
└── lib/               # Utility functions
    ├── utils.ts       # Helper functions
    └── wagmi.ts       # Wagmi configuration
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
#!/bin/bash

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local file..."
  cat > .env.local << EOL
# WalletConnect Project ID (required for WalletConnect integration)
# Get your project ID at https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Custom RPC URLs for different networks
# NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
# NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
EOL
  echo ".env.local file created successfully!"
else
  echo ".env.local file already exists. Skipping creation."
fi

echo "Please update the WalletConnect project ID in .env.local" 
#!/bin/bash

# Install dependencies
npm install

# Create necessary directories
mkdir -p public/images
mkdir -p scripts

# Download logo images
curl -o public/images/logo.png "https://caf75d3d002d76b7b4abee04b291692a.cdn.bubble.io/f1746495349792x845900971652345300/one-capital-high-resolution-logo.png"
curl -o public/images/logo-icon.png "https://caf75d3d002d76b7b4abee04b291692a.cdn.bubble.io/f1746495349792x845900971652345300/one-capital-high-resolution-logo-%20picture.png"

# Download wallet icons
curl -o public/images/metamask.svg "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
curl -o public/images/walletconnect.svg "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
curl -o public/images/l1x-wallet.svg "https://raw.githubusercontent.com/l1x-protocol/l1x-wallet/main/assets/logo.svg"
curl -o public/images/google.svg "https://raw.githubusercontent.com/google/material-design-icons/master/src/action/account_circle/materialicons/24px.svg"
curl -o public/images/twitter.svg "https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f426.svg"
curl -o public/images/email.svg "https://raw.githubusercontent.com/google/material-design-icons/master/src/communication/email/materialicons/24px.svg"

# Set up environment variables
bash scripts/setup-env.sh

echo "Setup complete! Please update the WalletConnect project ID in .env.local"
echo "You can now start the development server with 'npm run dev'" 
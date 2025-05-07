const fs = require('fs');
const path = require('path');

async function main() {
    // Read the deployment output
    const deploymentOutput = process.argv[2];
    if (!deploymentOutput) {
        console.error('Please provide the deployment output');
        process.exit(1);
    }

    // Parse the addresses from the deployment output
    const addresses = {
        PORTFOLIO_FACTORY_ADDRESS: deploymentOutput.match(/PortfolioFactory deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        L1X_BRIDGE_ADDRESS: "0x0000000000000000000000000000000000000001", // Placeholder address
        DEX_ROUTER_ADDRESS: deploymentOutput.match(/L1XSwapper deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        MOCK_TOKEN1_ADDRESS: deploymentOutput.match(/MockToken1 deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        MOCK_TOKEN2_ADDRESS: deploymentOutput.match(/MockToken2 deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        PORTFOLIO_ADDRESS: deploymentOutput.match(/Portfolio deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        AUTOBALANCER_ADDRESS: deploymentOutput.match(/AutoBalancer deployed to: (0x[a-fA-F0-9]{40})/)?.[1],
        L1X_SWAPPER_ADDRESS: deploymentOutput.match(/L1XSwapper deployed to: (0x[a-fA-F0-9]{40})/)?.[1]
    };

    // Read existing .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.log('Creating new .env file');
    }

    // Update or add addresses
    for (const [key, value] of Object.entries(addresses)) {
        if (value) {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        }
    }

    // Write back to .env file
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('Contract addresses saved to .env file');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 
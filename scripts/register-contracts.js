const { execSync } = require('child_process');

const SEPOLIA_GATEWAY = 'f650162af059734523e4be23ec5bab9a5b878f57';
const BSC_GATEWAY = '77d046d7d733672d44ea2df53a1663b6cf453432';
const SWAP_CONTRACT = 'a6d647bee74d5a54ef2c4bbac1fb813172bc53e1';
const EVENT_TOPIC = '5c6877990d83003ae27cf7c8f1a9d622868080df757847943133b78663358e42';

function registerContract(sourceChain, gatewayAddress, sourceAddress, destinationAddress) {
    const args = {
        destination_contract_address: destinationAddress,
        source_contract_address: sourceAddress,
        source_chain: sourceChain,
        event_filters: [EVENT_TOPIC]
    };

    const escapedArgs = JSON.stringify(args).replace(/"/g, '\\"');
    const command = `l1x-cli-beta contract call ${gatewayAddress} register_new_source --args "${escapedArgs}" --endpoint https://v2-testnet-rpc.l1x.foundation --fee_limit 100000 --from 9630daab83d613727900d8eb7b6fd4a1f08bf379`;

    try {
        console.log(`Registering ${sourceChain} contract...`);
        console.log('Command:', command);
        const output = execSync(command, { encoding: 'utf-8' });
        console.log(`Successfully registered ${sourceChain} contract:`, output);
    } catch (error) {
        console.error(`Error registering ${sourceChain} contract:`, error.message);
    }
}

// Register Sepolia contract
registerContract('sepolia', SEPOLIA_GATEWAY, SWAP_CONTRACT, SWAP_CONTRACT);

// Register BSC contract
registerContract('bsc', BSC_GATEWAY, SWAP_CONTRACT, SWAP_CONTRACT); 
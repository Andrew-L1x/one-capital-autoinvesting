const { execSync } = require('child_process');

const GATEWAY_ADDRESS = 'f650162af059734523e4be23ec5bab9a5b878f57';
const RPC_ENDPOINT = 'https://v2-testnet-rpc.l1x.foundation';

function checkContract() {
    const payload = {
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [
            `0x${GATEWAY_ADDRESS}`,
            'latest'
        ],
        id: 1
    };

    const command = `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' ${RPC_ENDPOINT}`;

    try {
        console.log('Checking contract...');
        console.log('Command:', command);
        const output = execSync(command, { encoding: 'utf-8' });
        console.log('Response:', output);
    } catch (error) {
        console.error('Error checking contract:', error.message);
    }
}

checkContract(); 
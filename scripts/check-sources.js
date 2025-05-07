const { execSync } = require('child_process');

const REGISTRY_ADDRESS = 'b97f1a3708ae6d7df6ada0c695ce29e8acef954e';
const RPC_ENDPOINT = 'https://v2-testnet-rpc.l1x.foundation';

function checkSources() {
    const payload = {
        jsonrpc: '2.0',
        method: 'l1x_call',
        params: [{
            to: REGISTRY_ADDRESS,
            data: {
                function: 'get_sources_from',
                args: {
                    from_index: '0'
                }
            }
        }],
        id: 1
    };

    const escapedPayload = JSON.stringify(payload).replace(/'/g, "'\\''");
    const command = `curl -X POST -H "Content-Type: application/json" -d '${escapedPayload}' ${RPC_ENDPOINT}`;

    try {
        console.log('Checking sources...');
        console.log('Command:', command);
        const output = execSync(command, { encoding: 'utf-8' });
        console.log('Response:', output);
    } catch (error) {
        console.error('Error checking sources:', error.message);
    }
}

checkSources(); 
$registryAddress = 'b97f1a3708ae6d7df6ada0c695ce29e8acef954e'
$rpcEndpoint = 'https://v2-testnet-rpc.l1x.foundation'

$payload = @{
    jsonrpc = '2.0'
    method = 'eth_call'
    params = @(
        @{
            to = $registryAddress
            data = @{
                function = 'get_sources_from'
                args = @{
                    from_index = '0'
                }
            }
        },
        'latest'
    )
    id = 1
} | ConvertTo-Json -Depth 10

Write-Host "Checking sources..."
Write-Host "Payload: $payload"

$response = Invoke-WebRequest -Uri $rpcEndpoint -Method Post -Body $payload -ContentType "application/json"
Write-Host "Response: $($response.Content)" 
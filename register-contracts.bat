@echo off
echo Registering Sepolia contract...
l1x-cli-beta contract call 0xf650162aF059734523E4Be23Ec5bAB9a5b878f57 register_new_source --args "{\"destination_contract_address\":\"0x577bf04ce3c9930B85432baae2Bd04bF0A4F5013\",\"source_contract_address\":\"0x577bf04ce3c9930B85432baae2Bd04bF0A4F5013\",\"source_chain\":\"sepolia\",\"event_filters\":[\"0x5c6877990d83003ae27cf7c8f1a9d622868080df757847943133b78663358e42\"]}" --endpoint https://rpc.testnet.layeronex.net --fee_limit 100000 --from 0x9630daab83d613727900d8eb7b6fd4a1f08bf379

echo.
echo Registering BSC contract...
l1x-cli-beta contract call 0x77d046D7d733672D44eA2Df53a1663b6CF453432 register_new_source --args "{\"destination_contract_address\":\"0x577bf04ce3c9930B85432baae2Bd04bF0A4F5013\",\"source_contract_address\":\"0x577bf04ce3c9930B85432baae2Bd04bF0A4F5013\",\"source_chain\":\"bsc\",\"event_filters\":[\"0x5c6877990d83003ae27cf7c8f1a9d622868080df757847943133b78663358e42\"]}" --endpoint https://rpc.testnet.layeronex.net --fee_limit 100000 --from 0x9630daab83d613727900d8eb7b6fd4a1f08bf379 
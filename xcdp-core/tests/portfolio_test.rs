use l1x_sdk::{
    types::{Address, Balance},
    address_balance, transfer_to,
};
use xcdp_core::wallet::WalletManager;
use std::path::PathBuf;

#[tokio::test]
async fn test_wallet_creation() {
    let mut wallet_manager = WalletManager::new();
    let result = wallet_manager.create_wallet("test_password").await;
    assert!(result.is_ok());
    
    let wallet_info = result.unwrap();
    assert!(wallet_info.balance >= Balance::from(0));
}

#[tokio::test]
async fn test_wallet_loading() {
    let mut wallet_manager = WalletManager::new();
    let path = PathBuf::from("test_wallet.json");
    let result = wallet_manager.load_wallet(&path, "test_password").await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_balance_check() {
    let mut wallet_manager = WalletManager::new();
    let wallet = wallet_manager.create_wallet("test_password").await.unwrap();
    let balance = wallet_manager.get_balance().await;
    assert!(balance.is_ok());
    assert_eq!(balance.unwrap(), wallet.balance);
}

#[tokio::test]
async fn test_transaction_sending() {
    let mut wallet_manager = WalletManager::new();
    let wallet = wallet_manager.create_wallet("test_password").await.unwrap();
    
    // Create a test recipient address
    let recipient = Address::try_from("test_recipient".as_bytes()).unwrap();
    let amount = Balance::from(100);
    
    // Should fail if trying to send more than balance
    let result = wallet_manager.send_transaction(&recipient, amount).await;
    assert!(result.is_err() || wallet.balance >= amount);
}

#[tokio::test]
async fn test_portfolio_integration() {
    let mut wallet_manager = WalletManager::new();
    let wallet = wallet_manager.create_wallet("test_password").await.unwrap();
    
    // Test portfolio creation
    // TODO: Add portfolio contract integration tests once the contract is deployed
    // This should test:
    // 1. Portfolio creation
    // 2. Asset allocation
    // 3. Rebalancing
    // 4. Cross-chain transfers
} 
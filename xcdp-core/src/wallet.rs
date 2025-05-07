use l1x_sdk::{
    types::{Address, Balance},
    address_balance, transfer_to,
};
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletInfo {
    pub address: Address,
    pub balance: Balance,
}

pub struct WalletManager {
    wallet: Option<Address>,
}

impl WalletManager {
    pub fn new() -> Self {
        Self { wallet: None }
    }

    pub async fn create_wallet(&mut self, password: &str) -> Result<WalletInfo, String> {
        // For now, we'll create a simple address from the password
        let address = Address::try_from(password.as_bytes())
            .map_err(|e| format!("Failed to create address: {}", e))?;
        self.wallet = Some(address.clone());

        let balance = address_balance(&address);

        Ok(WalletInfo {
            address,
            balance,
        })
    }

    pub async fn load_wallet(&mut self, path: &Path, password: &str) -> Result<WalletInfo, String> {
        // For now, we'll load the address from the password
        let address = Address::try_from(password.as_bytes())
            .map_err(|e| format!("Failed to create address: {}", e))?;
        self.wallet = Some(address.clone());

        let balance = address_balance(&address);

        Ok(WalletInfo {
            address,
            balance,
        })
    }

    pub async fn get_balance(&self) -> Result<Balance, String> {
        if let Some(address) = &self.wallet {
            Ok(address_balance(address))
        } else {
            Err("Wallet not initialized".to_string())
        }
    }

    pub async fn send_transaction(&self, to: &Address, amount: Balance) -> Result<(), String> {
        if let Some(address) = &self.wallet {
            let balance = address_balance(address);
            if balance < amount {
                return Err("Insufficient funds".to_string());
            }
            transfer_to(to, amount);
            Ok(())
        } else {
            Err("Wallet not initialized".to_string())
        }
    }
} 
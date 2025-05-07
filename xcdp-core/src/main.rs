use std::path::PathBuf;
use clap::{Parser, Subcommand};
use xcdp_core::wallet::WalletManager;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new wallet
    Create {
        /// Password for the wallet
        #[arg(short, long)]
        password: String,
    },
    /// Load an existing wallet
    Load {
        /// Path to the wallet file
        #[arg(short, long)]
        path: PathBuf,
        /// Password for the wallet
        #[arg(short, long)]
        password: String,
    },
    /// Get wallet balance
    Balance,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let mut wallet_manager = WalletManager::new();

    match cli.command {
        Commands::Create { password } => {
            let wallet_info = wallet_manager.create_wallet(&password).await?;
            println!("Wallet created successfully!");
            println!("Address: {}", wallet_info.address);
            println!("Balance: {}", wallet_info.balance);
        }
        Commands::Load { path, password } => {
            let wallet_info = wallet_manager.load_wallet(&path, &password).await?;
            println!("Wallet loaded successfully!");
            println!("Address: {}", wallet_info.address);
            println!("Balance: {}", wallet_info.balance);
        }
        Commands::Balance => {
            let balance = wallet_manager.get_balance().await?;
            println!("Current balance: {}", balance);
        }
    }

    Ok(())
} 
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('Compiling smart contracts...');

  // Create artifacts directory if it doesn't exist
  const artifactsDir = join(__dirname, '../artifacts');
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }

  try {
    // Compile contracts using hardhat
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log('Compilation successful!');
  } catch (error) {
    console.error('Compilation failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 
const { Wallet } = require("ethers");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

function existingKey() {
  if (!fs.existsSync(envPath)) return "";
  const match = fs.readFileSync(envPath, "utf8").match(/^DEPLOYER_PRIVATE_KEY=(.+)$/m);
  return match ? match[1].trim() : "";
}

async function main() {
  const current = existingKey();
  if (current) {
    const wallet = new Wallet(current);
    console.log("Using existing deployer:", wallet.address);
    return;
  }

  const wallet = Wallet.createRandom();
  const line = `DEPLOYER_PRIVATE_KEY=${wallet.privateKey}\n`;
  fs.appendFileSync(envPath, line, { encoding: "utf8" });
  console.log("Created throwaway deployer:", wallet.address);
  console.log("Private key saved to contracts/.env (gitignored).");
  console.log("Fund this address with testnet ETH:");
  console.log("  https://faucet.testnet.chain.robinhood.com");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

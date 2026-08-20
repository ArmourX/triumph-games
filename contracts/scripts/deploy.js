const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const REGISTRY = "0x000000006551c19487814612e58FE06813775758";
const SALT = hre.ethers.ZeroHash;
const BASE_URI = (process.env.BASE_URI || "https://triumph-games.vercel.app/assets/erc6551/").replace(/\/?$/, "/");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Network:", network.name, "chainId", chainId);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  if (chainId !== 46630) {
    throw new Error(`Expected Robinhood testnet chain ID 46630, got ${chainId}`);
  }
  if (balance === 0n) {
    throw new Error(
      `Deployer ${deployer.address} has 0 ETH. Fund it at https://faucet.testnet.chain.robinhood.com then re-run.`
    );
  }

  const Account = await hre.ethers.getContractFactory("ERC6551Account");
  const accountImpl = await Account.deploy();
  await accountImpl.waitForDeployment();
  const accountImplAddress = await accountImpl.getAddress();
  console.log("ERC6551Account implementation:", accountImplAddress);

  const NFT = await hre.ethers.getContractFactory("Tester001");
  const nft = await NFT.deploy(BASE_URI, deployer.address);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("Tester001:", nftAddress);

  const mintTx = await nft.mint(deployer.address);
  await mintTx.wait();
  const tokenId = 1n;
  console.log("Minted tokenId:", tokenId.toString(), "to", deployer.address);

  const registry = await hre.ethers.getContractAt("IERC6551Registry", REGISTRY);
  const createTx = await registry.createAccount(
    accountImplAddress,
    SALT,
    chainId,
    nftAddress,
    tokenId
  );
  await createTx.wait();

  const tba = await registry.account(accountImplAddress, SALT, chainId, nftAddress, tokenId);
  console.log("Token-bound account:", tba);

  const itemsBaseURI = `${BASE_URI}items/`;
  const Items = await hre.ethers.getContractFactory("Tester001Items");
  const items = await Items.deploy(itemsBaseURI, deployer.address);
  await items.waitForDeployment();
  const itemsAddress = await items.getAddress();
  console.log("Tester001Items:", itemsAddress);

  const packTx = await items.mintStarterPack(tba);
  await packTx.wait();
  console.log("Minted starter inventory to TBA");

  const seedTx = await deployer.sendTransaction({
    to: tba,
    value: hre.ethers.parseEther("0.0001"),
  });
  await seedTx.wait();
  console.log("Seeded TBA with 0.0001 ETH");

  const deployment = {
    status: "deployed",
    message: "Contracts deployed on Robinhood testnet.",
    network: "robinhood-testnet",
    chainId,
    baseURI: BASE_URI,
    rpc: "https://rpc.testnet.chain.robinhood.com",
    explorer: "https://explorer.testnet.chain.robinhood.com",
    deployer: deployer.address,
    registry: REGISTRY,
    salt: SALT,
    nft: nftAddress,
    tokenId: tokenId.toString(),
    tokenURI: `${BASE_URI}${tokenId}.json`,
    image: `${BASE_URI}hero/trainer.png`,
    accountImplementation: accountImplAddress,
    tokenBoundAccount: tba,
    items: itemsAddress,
    itemsBaseURI: itemsBaseURI,
    starterInventory: [
      { id: 1, name: "Potion", amount: 5 },
      { id: 2, name: "Pokeball", amount: 10 },
      { id: 3, name: "Pokegold", amount: 100 },
      { id: 4, name: "Rare Candy", amount: 3 },
    ],
    mintedTo: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const repoRoot = path.join(__dirname, "..", "..");
  const outPaths = [
    path.join(__dirname, "..", "deployments", "robinhood-testnet.json"),
    path.join(repoRoot, "assets", "erc6551", "deployment.json"),
  ];
  for (const outPath of outPaths) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
    console.log("Wrote", outPath);
  }

  console.log("\nExplorer");
  console.log("  NFT:", `https://explorer.testnet.chain.robinhood.com/address/${nftAddress}`);
  console.log("  Account impl:", `https://explorer.testnet.chain.robinhood.com/address/${accountImplAddress}`);
  console.log("  Items:", `https://explorer.testnet.chain.robinhood.com/address/${itemsAddress}`);
  console.log("  TBA:", `https://explorer.testnet.chain.robinhood.com/address/${tba}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

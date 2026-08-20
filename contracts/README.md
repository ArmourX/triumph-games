# Tester001 ERC-6551 (Robinhood Chain Testnet)

ERC-721 `Tester001` collection whose tokens each get an [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) token-bound account. Starter inventory is minted via `Tester001Items` (ERC-1155).

## Network

| Property | Value |
| --- | --- |
| Network | Robinhood Chain Testnet |
| Chain ID | `46630` |
| RPC | `https://rpc.testnet.chain.robinhood.com` |
| Explorer | https://explorer.testnet.chain.robinhood.com |
| Canonical registry | `0x000000006551c19487814612e58FE06813775758` |
| Faucet | https://faucet.testnet.chain.robinhood.com |

## Deploy

```bash
cd contracts
npm install
npm run wallet
```

Fund the printed deployer address from the faucet, then deploy using the test Vercel URL as metadata host:

```bash
# Preview URL from: npx vercel deploy --yes
BASE_URI=https://your-preview.vercel.app/assets/erc6551/ npm run deploy:rh-testnet
```

Addresses are written to `deployments/robinhood-testnet.json` and `assets/erc6551/deployment.json` (shown on `/erc6551-test.html`).

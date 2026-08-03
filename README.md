# Arc Split Pay

Build a React web app called SplitArc — a USDC split payment app that runs on Arc Testnet (a Layer-1 blockchain by Circle). The app lets a user connect their wallet, enter a USDC amount, add recipient wallet addresses, choose equal split or custom percentages, and send to all recipients in one go.
Tech stack:

React + Vite
wagmi v2 + viem for wallet connection and transactions
@circle-fin/app-kit and @circle-fin/adapter-viem-v2 for sending USDC
Tailwind CSS for styling

Arc Testnet config (add this as a custom chain in wagmi):

Chain name: Arc Testnet
Chain ID: 5042002
RPC URL: https://rpc.testnet.arc.network
Currency symbol: USDC
Block explorer: https://testnet.arcscan.app
USDC contract: 0x3600000000000000000000000000000000000000 (ERC-20, 6 decimals)

App features:

Wallet bar at top — shows connected wallet address (truncated) and USDC balance. "Connect Wallet" button if not connected. Use wagmi's useConnect and useBalance hooks.
Amount input — user types total USDC amount to send. Show "USDC" badge next to the input.
Split mode toggle — two buttons: "Equal split" and "Custom %". Default to Equal split.
Recipients section — user adds up to 10 wallet addresses. Each row has: address input field, calculated amount (equal split) or percentage input (custom mode), and a remove button. Start with 2 empty rows. "Add recipient" button to add more.
Summary card — shows: total amount, number of recipients, amount per wallet (equal) or breakdown (custom), estimated gas fee (~0.01 USDC), and network name (Arc Testnet).
Split & Send button — when clicked, loops through recipients and calls kit.send() from @circle-fin/app-kit for each address with the correct USDC amount. Use Arc_Testnet as the chain param. Show a loading state while sending.
Success screen — after all sends complete, show each recipient address, amount sent, and a link to the transaction on https://testnet.arcscan.app/tx/[txHash].
Error handling — show clear error messages if wallet not connected, amount is empty, addresses are invalid, or transaction fails.

Design:

Clean, minimal, white card-based UI
Green accent color (#1D9E75) for primary actions and USDC amounts
"Arc Testnet" badge in the header so users know they're on testnet
Mobile-friendly, max width 480px centered
No dark mode needed for now

Important notes:

USDC on Arc uses 6 decimals on the ERC-20 interface
Gas is also paid in USDC on Arc (not ETH)
App Kit's kit.send() handles the actual transfer — pass { from: { adapter, chain: "Arc_Testnet" }, to: recipientAddress, amount: "X.XX", token: "USDC" }
Use createViemAdapterFromPrivateKey or the wagmi adapter depending on what App Kit supports for browser wallets

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://splitarc.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d5ac7572-76f6-4c36-a066-a8e03b7b4977).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

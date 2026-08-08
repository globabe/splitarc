# SplitArc

Split USDC to anyone, instantly. Built on Arc Testnet.

## What is SplitArc?

SplitArc is a stablecoin-native split payment app built on Arc — 
Circle's stablecoin-native L1 blockchain. One transaction fans out 
USDC or EURC to multiple recipients simultaneously, with every split 
named and logged permanently onchain.

## Features

- Split USDC or EURC to up to 20 recipients in one transaction
- Name your splits — Team Dinner, Salaries, Family
- Address book — save contacts with friendly names, no more copy-pasting addresses
- Split history — every past split saved, repeat with one click
- Templates — save recurring split configurations for reuse
- Multi-stablecoin — USDC and EURC supported natively
- Built-in faucet link for testnet tokens
- Dark and light mode

## Smart Contract

Deployed and verified on Arc Testnet

| Item | Detail |
|------|--------|
| Contract Address | `0xe838875225a7896c75Bab8cE169Ad657fF317bf7` |
| Network | Arc Testnet (Chain ID: 5042002) |
| Verification | Verified on Sourcify |
| Explorer | [View on ArcScan](https://testnet.arcscan.app/address/0xe838875225a7896c75Bab8cE169Ad657fF317bf7) |

## Tech Stack

- **Blockchain:** Arc Testnet
- **Smart Contract:** Solidity 0.8.20
- **Frontend:** React + Vite + Tailwind CSS
- **Wallet:** wagmi v2 + viem
- **Deployment:** Lovable
- **Contract Verification:** Sourcify

## Token Addresses (Arc Testnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x3600000000000000000000000000000000000000` | 6 |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 |

## How It Works

1. Connect your EVM wallet (MetaMask, Rabby)
2. Enter a split name and total amount
3. Add recipients from your address book or paste addresses
4. Choose equal split or custom percentages
5. Hit Split & Send — one transaction, everyone gets paid

## Roadmap

- Cross-chain splits via Circle CCTP
- Recurring scheduled splits via Chainlink Automation
- Social/email login via Privy
- Address book sync across devices

## Live App

[splitarc.lovable.app](https://splitarc.lovable.app)

## Built With

- [Arc](https://arc.io) — stablecoin-native L1 by Circle
- [Circle](https://circle.com) — USDC and EURC infrastructure
- [Lovable](https://lovable.dev) — frontend development

## License

MIT

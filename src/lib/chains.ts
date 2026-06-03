export type ChainKey = "arc" | "ethereum" | "solana" | "base";

export type ChainInfo = {
  key: ChainKey;
  name: string;
  shortName: string;
  /** App Kit chain identifier */
  kitChain: string;
  explorerTx: (hash: string) => string;
  explorerName: string;
  /** Emoji icon used as a lightweight chain logo */
  icon: string;
  color: string;
  /** True if this chain is Arc (native, instant). False = bridged via CCTP. */
  isArc: boolean;
};

export const CHAINS: Record<ChainKey, ChainInfo> = {
  arc: {
    key: "arc",
    name: "Arc Testnet",
    shortName: "Arc",
    kitChain: "Arc_Testnet",
    explorerTx: (h) => `https://testnet.arcscan.app/tx/${h}`,
    explorerName: "ArcScan",
    icon: "◆",
    color: "#1D9E75",
    isArc: true,
  },
  ethereum: {
    key: "ethereum",
    name: "Ethereum Sepolia",
    shortName: "Ethereum",
    kitChain: "Ethereum_Sepolia",
    explorerTx: (h) => `https://sepolia.etherscan.io/tx/${h}`,
    explorerName: "Etherscan",
    icon: "Ξ",
    color: "#627EEA",
    isArc: false,
  },
  solana: {
    key: "solana",
    name: "Solana Devnet",
    shortName: "Solana",
    kitChain: "Solana_Devnet",
    explorerTx: (h) => `https://explorer.solana.com/tx/${h}?cluster=devnet`,
    explorerName: "Solana Explorer",
    icon: "◎",
    color: "#9945FF",
    isArc: false,
  },
  base: {
    key: "base",
    name: "Base Sepolia",
    shortName: "Base",
    kitChain: "Base_Sepolia",
    explorerTx: (h) => `https://sepolia.basescan.org/tx/${h}`,
    explorerName: "BaseScan",
    icon: "B",
    color: "#0052FF",
    isArc: false,
  },
};

// Solana temporarily disabled — uses base58 addresses which need separate handling.
export const CHAIN_LIST: ChainInfo[] = [
  CHAINS.arc,
  CHAINS.ethereum,
  CHAINS.base,
];

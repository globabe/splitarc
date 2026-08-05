export type TokenKey = "usdc" | "eurc" | "cirbtc";

export type TokenInfo = {
  key: TokenKey;
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  color: string;
  /** Faucet URL, when one exists */
  faucet?: string;
};

export const TOKENS: Record<TokenKey, TokenInfo> = {
  usdc: {
    key: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    icon: "$",
    color: "#2775CA",
    faucet: "https://faucet.circle.com",
  },
  eurc: {
    key: "eurc",
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x3700000000000000000000000000000000000000",
    decimals: 6,
    icon: "€",
    color: "#1D9E75",
    faucet: "https://faucet.circle.com",
  },
  cirbtc: {
    key: "cirbtc",
    symbol: "cirBTC",
    name: "Circle Bitcoin",
    address: "0x3800000000000000000000000000000000000000",
    decimals: 8,
    icon: "₿",
    color: "#F7931A",
  },
};

export const TOKEN_LIST: TokenInfo[] = [TOKENS.usdc, TOKENS.eurc, TOKENS.cirbtc];

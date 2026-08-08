export type TokenKey = "usdc" | "eurc";

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
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    icon: "€",
    color: "#1D9E75",
    faucet: "https://faucet.circle.com",
  },
};

export const TOKEN_LIST: TokenInfo[] = [TOKENS.usdc, TOKENS.eurc];

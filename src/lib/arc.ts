import { defineChain } from "viem";

export const ARC_TESTNET_ID = 5042002;
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
export const USDC_DECIMALS = 6;
export const EXPLORER_URL = "https://testnet.arcscan.app";

export const arcTestnet = defineChain({
  id: ARC_TESTNET_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: EXPLORER_URL },
  },
  testnet: true,
});

import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_split_config",
  title: "Get SplitArc config",
  description:
    "Return the SplitArc smart contract address, USDC token address, and Arc Testnet chain info used by this app.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const config = {
      chain: {
        name: "Arc Testnet",
        chainId: 5042002,
        rpcUrl: "https://rpc.testnet.arc.network",
        explorer: "https://testnet.arcscan.app",
      },
      splitArcContract: "0xe838875225a7896c75Bab8cE169Ad657fF317bf7",
      usdc: {
        address: "0x3600000000000000000000000000000000000000",
        decimals: 6,
        symbol: "USDC",
      },
      supportedRecipientChains: [
        { key: "arc", name: "Arc Testnet", mode: "native" },
        { key: "ethereum", name: "Ethereum Sepolia", mode: "cctp-bridged" },
        { key: "base", name: "Base Sepolia", mode: "cctp-bridged" },
      ],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(config, null, 2) }],
      structuredContent: config,
    };
  },
});

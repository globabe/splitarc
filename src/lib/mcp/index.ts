import { defineMcp } from "@lovable.dev/mcp-js";
import getSplitConfig from "./tools/get-split-config";
import calculateSplit from "./tools/calculate-split";

export default defineMcp({
  name: "splitarc-mcp",
  title: "SplitArc MCP",
  version: "0.1.0",
  instructions:
    "Tools for SplitArc, a USDC split-payment app on Arc Testnet. Use `get_split_config` to fetch contract and chain details, and `calculate_split` to preview per-recipient USDC amounts for equal or custom-percentage splits before sending.",
  tools: [getSplitConfig, calculateSplit],
});

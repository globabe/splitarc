import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const USDC_DECIMALS = 6;

function toBaseUnits(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = (frac + "0".repeat(USDC_DECIMALS)).slice(0, USDC_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(fracPadded || "0");
}

function fromBaseUnits(units: bigint): string {
  const s = units.toString().padStart(USDC_DECIMALS + 1, "0");
  const whole = s.slice(0, -USDC_DECIMALS);
  const frac = s.slice(-USDC_DECIMALS).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

export default defineTool({
  name: "calculate_split",
  title: "Calculate split amounts",
  description:
    "Compute per-recipient USDC amounts for a split. Mode 'equal' divides totalAmount evenly across recipients (remainder goes to the first recipient). Mode 'custom' uses percentages that must sum to 100. Returns human-readable USDC amounts and 6-decimal base units.",
  inputSchema: {
    totalAmount: z
      .string()
      .describe("Total USDC amount as a decimal string, e.g. '100' or '12.5'."),
    recipients: z
      .array(z.string())
      .min(1)
      .max(50)
      .describe("Recipient wallet addresses (order preserved)."),
    mode: z.enum(["equal", "custom"]).describe("Split mode."),
    percentages: z
      .array(z.number())
      .optional()
      .describe("Required when mode='custom'. Must be same length as recipients and sum to 100."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ totalAmount, recipients, mode, percentages }) => {
    try {
      const total = toBaseUnits(totalAmount);
      let amounts: bigint[];

      if (mode === "equal") {
        const base = total / BigInt(recipients.length);
        const remainder = total - base * BigInt(recipients.length);
        amounts = recipients.map((_, i) => (i === 0 ? base + remainder : base));
      } else {
        if (!percentages || percentages.length !== recipients.length) {
          throw new Error("percentages must match recipients length");
        }
        const sum = percentages.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.0001) {
          throw new Error(`percentages must sum to 100, got ${sum}`);
        }
        amounts = percentages.map((p) => (total * BigInt(Math.round(p * 10000))) / 1000000n);
        const distributed = amounts.reduce((a, b) => a + b, 0n);
        amounts[0] += total - distributed;
      }

      const rows = recipients.map((address, i) => ({
        address,
        amountUsdc: fromBaseUnits(amounts[i]),
        amountBaseUnits: amounts[i].toString(),
      }));

      const result = {
        totalAmount: fromBaseUnits(total),
        totalBaseUnits: total.toString(),
        mode,
        recipients: rows,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: (err as Error).message }],
        isError: true,
      };
    }
  },
});

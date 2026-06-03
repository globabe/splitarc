import { createFileRoute } from "@tanstack/react-router";
import SplitArcApp from "@/components/SplitArcApp";

export const Route = createFileRoute("/app")({
  component: SplitArcApp,
  head: () => ({
    meta: [
      { title: "SplitArc — USDC split payments on Arc Testnet" },
      {
        name: "description",
        content:
          "Split a USDC payment across multiple wallets in one go on Arc Testnet.",
      },
    ],
  }),
});

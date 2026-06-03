import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "SplitArc — Split USDC to anyone, instantly" },
      {
        name: "description",
        content:
          "Pay your team, split bills, distribute revenue — all in one onchain transaction. Powered by Arc and Circle.",
      },
    ],
  }),
});

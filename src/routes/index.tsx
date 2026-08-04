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
      { property: "og:title", content: "SplitArc — Split USDC to anyone, instantly" },
      { property: "og:description", content: "Pay your team, split bills, distribute revenue — all in one onchain transaction. Powered by Arc and Circle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

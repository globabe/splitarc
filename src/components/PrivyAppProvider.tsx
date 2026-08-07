import { PrivyProvider } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { arcTestnet } from "@/lib/arc";

type AppTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => undefined,
});

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function PrivyAppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("splitarc:theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => {
          const next = current === "light" ? "dark" : "light";
          window.localStorage.setItem("splitarc:theme", next);
          return next;
        }),
    }),
    [theme],
  );

  return (
    <PrivyProvider
      appId="cmseiknvo00p80ckzbvlm3a1u"
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme,
          accentColor: "#1D9E75",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        supportedChains: [arcTestnet],
        defaultChain: arcTestnet,
      }}
    >
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </PrivyProvider>
  );
}
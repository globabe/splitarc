import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { getWagmiConfig } from "@/lib/wagmi";

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

export function AppProviders({ children }: { children: ReactNode }) {
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
    <WagmiProvider config={getWagmiConfig()}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </WagmiProvider>
  );
}

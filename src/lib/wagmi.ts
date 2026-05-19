import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "./arc";

let _config: ReturnType<typeof createConfig> | null = null;

export function getWagmiConfig() {
  if (_config) return _config;
  _config = createConfig({
    chains: [arcTestnet],
    connectors: [injected()],
    transports: {
      [arcTestnet.id]: http(),
    },
  });
  return _config;
}

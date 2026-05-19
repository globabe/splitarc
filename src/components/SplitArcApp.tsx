import { useEffect, useMemo, useState } from "react";
import {
  WagmiProvider,
  useAccount,
  useReadContract,
  useConnect,
  useDisconnect,
  useConnectorClient,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAddress, type EIP1193Provider } from "viem";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { getWagmiConfig } from "@/lib/wagmi";
import {
  ARC_TESTNET_ID,
  EXPLORER_URL,
  USDC_ADDRESS,
  USDC_DECIMALS,
  arcTestnet,
} from "@/lib/arc";

type Mode = "equal" | "custom";

type Recipient = {
  id: string;
  address: string;
  percent: string; // only used in custom mode
};

type SendResult = {
  address: string;
  amount: string;
  txHash?: string;
  error?: string;
};

const ACCENT = "#1D9E75";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function truncate(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="#1D9E75" />
      <path
        d="M18 26V16M18 16L12 10M18 16L24 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Logo />
        <div className="leading-tight">
          <div className="font-bold text-lg text-neutral-900">SplitArc</div>
          <div className="text-xs text-neutral-500">USDC split payments</div>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
      >
        Arc Testnet
      </span>
    </div>
  );
}

function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const onWrongChain = isConnected && chainId !== ARC_TESTNET_ID;

  const { data: balanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !onWrongChain, refetchInterval: 10_000 },
  });
  const balance =
    typeof balanceRaw === "bigint" ? formatUnits(balanceRaw, USDC_DECIMALS) : undefined;

  const injectedConnector = connectors.find((c) => c.type === "injected") ?? connectors[0];

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isPending || !injectedConnector}
        className="w-full rounded-xl px-4 py-3 font-semibold text-white transition active:scale-[.98] disabled:opacity-60"
        style={{ backgroundColor: ACCENT }}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs text-neutral-500">Connected</span>
        <span className="font-mono text-sm text-neutral-900">{truncate(address)}</span>
      </div>
      <div className="flex items-center gap-2">
        {onWrongChain ? (
          <button
            type="button"
            onClick={() => switchChain({ chainId: ARC_TESTNET_ID })}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800"
          >
            Switch to Arc
          </button>
        ) : (
          <div className="text-right">
            <div className="text-xs text-neutral-500">Balance</div>
            <div className="text-sm font-semibold" style={{ color: ACCENT }}>
              {balance ? Number(balance).toFixed(2) : "0.00"} USDC
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1"
          title="Disconnect"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useConnectorClient({ chainId: ARC_TESTNET_ID });

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Mode>("equal");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: uid(), address: "", percent: "50" },
    { id: uid(), address: "", percent: "50" },
  ]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = parseFloat(amount || "0") || 0;
  const validRecipients = recipients.filter((r) => r.address.trim().length > 0);
  const equalShare = validRecipients.length > 0 ? totalAmount / validRecipients.length : 0;

  const percentTotal = useMemo(
    () => recipients.reduce((s, r) => s + (parseFloat(r.percent || "0") || 0), 0),
    [recipients],
  );

  function addRecipient() {
    if (recipients.length >= 10) return;
    setRecipients((rs) => [...rs, { id: uid(), address: "", percent: "0" }]);
  }
  function removeRecipient(id: string) {
    setRecipients((rs) => (rs.length <= 1 ? rs : rs.filter((r) => r.id !== id)));
  }
  function updateRecipient(id: string, patch: Partial<Recipient>) {
    setRecipients((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function amountFor(r: Recipient): number {
    if (mode === "equal") return equalShare;
    const pct = parseFloat(r.percent || "0") || 0;
    return (totalAmount * pct) / 100;
  }

  async function handleSend() {
    setError(null);
    setResults(null);

    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (chainId !== ARC_TESTNET_ID) {
      setError("Switch your wallet to Arc Testnet to continue.");
      return;
    }
    if (!walletClient) {
      setError("Wallet not ready yet — try again in a second.");
      return;
    }
    if (totalAmount <= 0) {
      setError("Enter a total amount greater than zero.");
      return;
    }
    if (validRecipients.length === 0) {
      setError("Add at least one recipient address.");
      return;
    }
    for (const r of validRecipients) {
      if (!isAddress(r.address.trim())) {
        setError(`Invalid wallet address: ${r.address}`);
        return;
      }
    }
    if (mode === "custom" && Math.round(percentTotal * 100) !== 100 * 100) {
      setError(`Custom percentages must total 100% (currently ${percentTotal}%).`);
      return;
    }

    setSending(true);
    try {
      const provider = walletClient.transport as unknown as EIP1193Provider;
      const adapter = await createViemAdapterFromProvider({ provider });
      const kit = new AppKit();

      const out: SendResult[] = [];
      for (const r of validRecipients) {
        const amt = amountFor(r).toFixed(USDC_DECIMALS);
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await kit.send({
            from: { adapter, chain: "Arc_Testnet" } as never,
            to: r.address.trim(),
            amount: amt,
            token: "USDC",
          });
          out.push({
            address: r.address.trim(),
            amount: amt,
            txHash: result?.txHash ?? result?.hash,
          });
        } catch (e) {
          out.push({
            address: r.address.trim(),
            amount: amt,
            error: e instanceof Error ? e.message : String(e),
          });
        }
        setResults([...out]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error sending transactions.");
    } finally {
      setSending(false);
    }
  }

  if (results) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-2xl"
            style={{ backgroundColor: ACCENT }}
          >
            ✓
          </div>
          <h2 className="mt-3 text-lg font-bold text-neutral-900">Split complete</h2>
          <p className="text-sm text-neutral-500">
            Sent to {results.length} recipient{results.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.address} className="rounded-xl border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-neutral-900">{truncate(r.address)}</span>
                <span className="font-semibold text-sm" style={{ color: ACCENT }}>
                  {r.amount} USDC
                </span>
              </div>
              {r.txHash ? (
                <a
                  href={`${EXPLORER_URL}/tx/${r.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-neutral-500 break-all"
                >
                  View on Arcscan →
                </a>
              ) : (
                <div className="text-xs text-red-600 break-words">{r.error}</div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setResults(null);
            setAmount("");
          }}
          className="w-full rounded-xl px-4 py-3 font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          New split
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WalletBar />

      {/* Amount */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3">
        <label className="text-xs text-neutral-500">Total amount</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="flex-1 text-2xl font-bold text-neutral-900 outline-none bg-transparent"
            style={{ color: amount ? ACCENT : undefined }}
          />
          <span
            className="text-xs font-bold px-2 py-1 rounded-md"
            style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
          >
            USDC
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
        {(["equal", "custom"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              mode === m ? "bg-white shadow text-neutral-900" : "text-neutral-500"
            }`}
          >
            {m === "equal" ? "Equal split" : "Custom %"}
          </button>
        ))}
      </div>

      {/* Recipients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Recipients ({recipients.length}/10)
          </h3>
          <button
            type="button"
            onClick={addRecipient}
            disabled={recipients.length >= 10}
            className="text-xs font-semibold disabled:opacity-40"
            style={{ color: ACCENT }}
          >
            + Add recipient
          </button>
        </div>

        {recipients.map((r, i) => {
          const calc = amountFor(r);
          return (
            <div key={r.id} className="rounded-xl border border-neutral-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  placeholder={`Wallet address #${i + 1}`}
                  value={r.address}
                  onChange={(e) => updateRecipient(r.id, { address: e.target.value })}
                  className="flex-1 font-mono text-xs outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => removeRecipient(r.id)}
                  className="text-neutral-400 hover:text-red-500 text-sm"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                {mode === "custom" ? (
                  <div className="flex items-center gap-1">
                    <input
                      inputMode="decimal"
                      value={r.percent}
                      onChange={(e) =>
                        updateRecipient(r.id, { percent: e.target.value.replace(/[^\d.]/g, "") })
                      }
                      className="w-14 text-sm font-semibold outline-none bg-neutral-50 rounded px-2 py-0.5 text-neutral-900"
                    />
                    <span className="text-xs text-neutral-500">%</span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">Equal share</span>
                )}
                <span className="text-sm font-semibold" style={{ color: ACCENT }}>
                  {calc.toFixed(2)} USDC
                </span>
              </div>
            </div>
          );
        })}
        {mode === "custom" && (
          <div className="text-xs text-right text-neutral-500">
            Total:{" "}
            <span
              className={
                Math.round(percentTotal * 100) === 100 * 100
                  ? "text-neutral-900 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
              {percentTotal}%
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-sm space-y-1.5">
        <Row label="Total" value={`${totalAmount.toFixed(2)} USDC`} accent />
        <Row label="Recipients" value={String(validRecipients.length)} />
        {mode === "equal" && validRecipients.length > 0 && (
          <Row label="Per wallet" value={`${equalShare.toFixed(2)} USDC`} />
        )}
        <Row label="Est. gas" value="~0.01 USDC" />
        <Row label="Network" value="Arc Testnet" />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !isConnected}
        className="w-full rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-[.98] disabled:opacity-50"
        style={{ backgroundColor: ACCENT }}
      >
        {sending ? "Sending…" : `Split & Send`}
      </button>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span
        className={accent ? "font-bold" : "text-neutral-900 font-medium"}
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default function SplitArcApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [{ config, queryClient }] = useState(() => ({
    config: getWagmiConfig(),
    queryClient: new QueryClient(),
  }));

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-neutral-50 px-4 py-6 flex justify-center">
          <div className="w-full max-w-[480px]">
            <Header />
            <App />
            <p className="mt-6 text-center text-xs text-neutral-400">
              Arc Testnet · Chain ID {arcTestnet.id}
            </p>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

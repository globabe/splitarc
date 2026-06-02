import { useEffect, useMemo, useState } from "react";
import {
  WagmiProvider,
  useAccount,
  useReadContract,
  useConnect,
  useDisconnect,
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
  USDC_ADDRESS,
  USDC_DECIMALS,
  arcTestnet,
} from "@/lib/arc";
import { CHAINS, CHAIN_LIST, type ChainKey, type ChainInfo } from "@/lib/chains";

type Mode = "equal" | "custom";

type Recipient = {
  id: string;
  address: string;
  percent: string;
  chain: ChainKey;
};

type SendResult = {
  address: string;
  amount: string;
  chain: ChainKey;
  txHash?: string;
  error?: string;
};

const ACCENT = "#1D9E75";
const ACCENT_TINT = "#E1F5EE";
const BG = "#F5F5F5";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function truncate(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill={ACCENT} />
      {/* Split / fork arrow: single stem branching into two outward arrows */}
      <path
        d="M20 30 V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 22 L13 15 M20 22 L27 15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Arrowheads */}
      <path
        d="M13 15 L13 11 M13 15 L17 15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M27 15 L27 11 M27 15 L23 15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 12.5L10 17.5L19 7.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="font-bold text-xl text-neutral-900">SplitArc</div>
            <div className="text-xs text-neutral-500">USDC split payments</div>
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: ACCENT_TINT, color: ACCENT }}
        >
          Arc Testnet
        </span>
      </div>
      {children}
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
        className="w-full rounded-2xl px-5 py-3.5 font-semibold text-white transition active:scale-[.98] disabled:opacity-60 shadow-sm"
        style={{ backgroundColor: ACCENT }}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: ACCENT_TINT }}
        >
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">
            Wallet
          </span>
          <span className="font-mono text-sm text-neutral-900 truncate">{truncate(address)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
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
            <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">
              Balance
            </div>
            <div className="text-sm font-bold" style={{ color: ACCENT }}>
              {balance ? Number(balance).toFixed(2) : "0.00"} USDC
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-neutral-300 hover:text-neutral-600 text-base leading-none px-1"
          title="Disconnect"
          aria-label="Disconnect wallet"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function App() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();

  const { data: balanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && chainId === ARC_TESTNET_ID, refetchInterval: 10_000 },
  });
  const balanceStr =
    typeof balanceRaw === "bigint" ? formatUnits(balanceRaw, USDC_DECIMALS) : undefined;

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Mode>("equal");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: uid(), address: "", percent: "50", chain: "arc" },
    { id: uid(), address: "", percent: "50", chain: "arc" },
  ]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const totalAmount = parseFloat(amount || "0") || 0;
  const validRecipients = recipients.filter((r) => r.address.trim().length > 0);
  const equalShare = validRecipients.length > 0 ? totalAmount / validRecipients.length : 0;

  const percentTotal = useMemo(
    () => recipients.reduce((s, r) => s + (parseFloat(r.percent || "0") || 0), 0),
    [recipients],
  );

  function addRecipient() {
    if (recipients.length >= 10) return;
    setRecipients((rs) => [...rs, { id: uid(), address: "", percent: "0", chain: "arc" }]);
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
    if (!connector) {
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
      // Solana uses base58 addresses; only validate EVM addresses here.
      const chainInfo = CHAINS[r.chain];
      if (chainInfo.key !== "solana" && !isAddress(r.address.trim())) {
        setError(`Invalid wallet address for ${chainInfo.name}: ${r.address}`);
        return;
      }
    }
    if (mode === "custom" && Math.round(percentTotal * 100) !== 100 * 100) {
      setError(`Custom percentages must total 100% (currently ${percentTotal}%).`);
      return;
    }

    setSending(true);
    try {
      const provider = (await connector.getProvider()) as EIP1193Provider;
      const adapter = await createViemAdapterFromProvider({ provider });
      const kit = new AppKit();

      const out: SendResult[] = [];
      for (const r of validRecipients) {
        const amt = amountFor(r).toFixed(USDC_DECIMALS);
        const chainInfo = CHAINS[r.chain];
        try {
          // For Arc recipients: direct kit.send() on Arc Testnet.
          // For other chains: route via Circle's CCTP bridge by setting the
          // destination chain on the send call — App Kit handles the burn/mint.
          const sendPayload = chainInfo.isArc
            ? {
                from: { adapter, chain: "Arc_Testnet" },
                to: r.address.trim(),
                amount: amt,
                token: "USDC",
              }
            : {
                from: { adapter, chain: "Arc_Testnet" },
                to: { address: r.address.trim(), chain: chainInfo.kitChain },
                amount: amt,
                token: "USDC",
                route: "cctp" as const,
              };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await kit.send(sendPayload as never);
          out.push({
            address: r.address.trim(),
            amount: amt,
            chain: r.chain,
            txHash: result?.txHash ?? result?.hash,
          });
        } catch (e) {
          out.push({
            address: r.address.trim(),
            amount: amt,
            chain: r.chain,
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
      <div className="rounded-3xl p-6 space-y-6" style={{ backgroundColor: ACCENT_TINT }}>
        <style>{`
          @keyframes check-draw {
            0% { stroke-dashoffset: 60; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes check-pop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .check-path {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: check-draw 0.6s ease-out 0.2s forwards;
          }
          .check-circle {
            animation: check-pop 0.5s ease-out forwards;
          }
        `}</style>
        <div className="text-center pt-4">
          <div
            className="check-circle mx-auto h-24 w-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: ACCENT, boxShadow: `0 10px 30px -10px ${ACCENT}80` }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="check-path"
                d="M5 12.5L10 17.5L19 7.5"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">Split Complete!</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Sent USDC to {results.length} recipient{results.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-3">
          {results.map((r, i) => {
            const chainInfo = CHAINS[r.chain];
            return (
              <div
                key={r.address + i}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
                      style={{ backgroundColor: chainInfo.color }}
                      title={chainInfo.name}
                    >
                      {chainInfo.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-sm text-neutral-900 truncate">
                        {truncate(r.address)}
                      </span>
                      <ChainBadge chain={chainInfo} />
                    </div>
                  </div>
                  <span className="font-bold text-base shrink-0" style={{ color: ACCENT }}>
                    {r.amount} USDC
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                  {r.txHash ? (
                    <>
                      <a
                        href={chainInfo.explorerTx(r.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border transition active:scale-[.98] hover:shadow-sm"
                        style={{ color: ACCENT, borderColor: "#C7E9DC" }}
                      >
                        View on {chainInfo.explorerName} →
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(r.txHash!);
                          setCopiedTx(r.txHash!);
                          setTimeout(() => setCopiedTx((c) => (c === r.txHash ? null : c)), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border transition active:scale-[.98] hover:shadow-sm"
                        style={{ color: ACCENT, borderColor: "#C7E9DC" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {copiedTx === r.txHash ? "Copied!" : "Copy tx hash"}
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-red-600 break-words">{r.error}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            setResults(null);
            setAmount("");
            setCopiedTx(null);
          }}
          className="w-full rounded-2xl px-5 py-4 font-semibold text-white transition active:scale-[.98] shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          New Split
        </button>
      </div>
    );
  }

  const canSend = isConnected && totalAmount > 0 && !sending;

  return (
    <div className="space-y-5">
      <WalletBar />

      {/* Hero amount */}
      <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-7 shadow-sm">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-2">
            Total to split
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-[60%] text-5xl font-bold text-center outline-none bg-transparent placeholder:text-neutral-300 tabular-nums"
              style={{ color: amount ? "#0a0a0a" : undefined }}
            />
            <span className="text-lg font-bold text-neutral-400">USDC</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {isConnected
              ? `Available: ${balanceStr ? Number(balanceStr).toFixed(2) : "0.00"} USDC`
              : "Connect wallet to see balance"}
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1.5 bg-neutral-100 p-1 rounded-2xl">
        {(["equal", "custom"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition ${
              mode === m ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"
            }`}
          >
            {m === "equal" ? "Equal split" : "Custom %"}
          </button>
        ))}
      </div>

      {/* Recipients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-neutral-900">
            Recipients{" "}
            <span className="text-neutral-400 font-normal">({recipients.length}/10)</span>
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
            <div
              key={r.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: ACCENT_TINT, color: ACCENT }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    placeholder="0x… wallet address"
                    value={r.address}
                    onChange={(e) => updateRecipient(r.id, { address: e.target.value })}
                    className="w-full font-mono text-xs outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRecipient(r.id)}
                  className="text-neutral-300 hover:text-red-500 text-sm shrink-0"
                  title="Remove"
                  aria-label="Remove recipient"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                {mode === "custom" ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      inputMode="decimal"
                      value={r.percent}
                      onChange={(e) =>
                        updateRecipient(r.id, { percent: e.target.value.replace(/[^\d.]/g, "") })
                      }
                      className="w-16 text-sm font-semibold outline-none bg-neutral-50 rounded-lg px-2.5 py-1 text-neutral-900"
                    />
                    <span className="text-xs text-neutral-500">%</span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">Equal share</span>
                )}
                <span className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>
                  {calc.toFixed(2)} USDC
                </span>
              </div>
            </div>
          );
        })}
        {mode === "custom" && (
          <div className="text-xs text-right px-1 text-neutral-500">
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
      <div
        className="rounded-2xl border p-4 text-sm space-y-2"
        style={{ backgroundColor: ACCENT_TINT, borderColor: "#C7E9DC" }}
      >
        <Row label="Total" value={`${totalAmount.toFixed(2)} USDC`} accent />
        <Row label="Recipients" value={String(validRecipients.length)} />
        {mode === "equal" && validRecipients.length > 0 && (
          <Row label="Per wallet" value={`${equalShare.toFixed(2)} USDC`} />
        )}
        <div className="border-t my-1" style={{ borderColor: "#C7E9DC" }} />
        <Row label="Est. gas" value="~0.01 USDC" />
        <Row label="Network" value="Arc Testnet" />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm p-4">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="w-full rounded-2xl px-5 py-4 font-semibold text-white transition active:scale-[.98] flex items-center justify-center gap-2 shadow-sm disabled:shadow-none"
        style={{
          backgroundColor: canSend ? ACCENT : "#D4D4D4",
          color: canSend ? "white" : "#737373",
          cursor: canSend ? "pointer" : "not-allowed",
        }}
      >
        <SendIcon />
        {sending
          ? "Sending…"
          : !isConnected
            ? "Connect wallet to send"
            : totalAmount <= 0
              ? "Enter an amount"
              : "Split & Send"}
      </button>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-600">{label}</span>
      <span
        className={accent ? "font-bold text-base tabular-nums" : "text-neutral-900 font-semibold tabular-nums"}
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-neutral-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen px-5 py-8 flex justify-center" style={{ backgroundColor: BG }}>
          <div className="w-full max-w-[480px]">
            <Header />
            <App />
            <p className="mt-8 text-center text-xs text-neutral-400">
              Arc Testnet · Chain ID {arcTestnet.id}
            </p>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

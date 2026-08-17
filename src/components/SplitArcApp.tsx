import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createPublicClient, createWalletClient, custom, erc20Abi, formatUnits, http, parseUnits, isAddress, type EIP1193Provider } from "viem";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { useAppTheme } from "@/components/AppProviders";
import { Send as SendLucide, Clock as ClockLucide, Users as UsersLucide } from "lucide-react";

export type WalletShim = {
  chainId: string;
  switchChain: (id: number) => void;
  getEthereumProvider: () => Promise<EIP1193Provider>;
};


import {
  ARC_TESTNET_ID,
  SPLITARC_ADDRESS,
  SPLITARC_ABI,
  EXPLORER_URL,
  arcTestnet,
} from "@/lib/arc";
import { TOKENS, TOKEN_LIST, type TokenKey, type TokenInfo } from "@/lib/tokens";
import {
  useContacts,
  useHistory,
  useTemplates,
  findContactName,
  type Contact,
  type HistoryEntry,
  type Template,
} from "@/lib/storage";

type Mode = "equal" | "custom";
type Tab = "new" | "history" | "contacts";

type Recipient = {
  id: string;
  address: string;
  percent: string;
};

type SendResult = {
  address: string;
  amount: string;
  txHash: string;
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

function arcscanTx(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ---------------- Icons ---------------- */

function Logo() {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-[11px]"
      style={{ background: ACCENT }}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 12h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 6h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 18h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 4v16a1 1 0 0 0 1 1h14V3H5a1 1 0 0 0-1 1zm4 0v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

function MoonIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ProfileIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

/* ---------------- Token UI ---------------- */

function TokenIcon({ token, size = 20 }: { token: TokenInfo; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ backgroundColor: token.color, width: size, height: size, fontSize: Math.round(size * 0.55) }}
      aria-hidden
    >
      {token.icon}
    </span>
  );
}

function TokenSelect({ value, onChange }: { value: TokenKey; onChange: (t: TokenKey) => void }) {
  const token = TOKENS[value];
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TokenKey)}
        aria-label="Select token"
        className="appearance-none text-base font-bold pl-11 pr-9 py-3 min-h-[48px] min-w-[120px] rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 outline-none cursor-pointer hover:bg-neutral-100 touch-manipulation"
      >
        {TOKEN_LIST.map((t) => (
          <option key={t.key} value={t.key}>
            {t.symbol}
          </option>
        ))}
      </select>
      <span className="absolute left-3 pointer-events-none">
        <TokenIcon token={token} size={22} />
      </span>
      <span className="absolute right-3 text-neutral-400 text-xs pointer-events-none">▾</span>
    </div>
  );
}

/* ---------------- Header + Wallet ---------------- */

function Header({ children, actions }: { children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/"
          onClick={() => {
            if (typeof window !== "undefined") window.sessionStorage.removeItem("splitarc:launched");
          }}
          className="flex items-center gap-3 group"
          aria-label="Back to landing page"
        >
          <Logo />
          <div className="leading-tight">
            <div className="font-bold text-xl text-neutral-900 dark:text-white group-hover:underline">SplitArc</div>
            <div className="text-xs text-neutral-500">USDC split payments</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: ACCENT_TINT, color: ACCENT }}>Arc Testnet</span>
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}

function WalletBar({ address, wallet, displayName, token }: { address?: string; wallet: WalletShim | undefined; displayName: string; token: TokenInfo }) {
  const isConnected = !!address;
  const chainId = wallet?.chainId;
  const onWrongChain = isConnected && chainId !== `eip155:${ARC_TESTNET_ID}`;
  const [balance, setBalance] = useState("0");
  useEffect(() => {
    if (!address || onWrongChain) return;
    const client = createPublicClient({ chain: arcTestnet, transport: http() });
    let active = true;
    const load = () => client.readContract({ address: token.address, abi: erc20Abi, functionName: "balanceOf", args: [address as `0x${string}`] }).then((raw) => active && setBalance(formatUnits(raw, token.decimals))).catch(() => undefined);
    setBalance("0");
    load();
    const timer = window.setInterval(load, 10_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [address, onWrongChain, token.address, token.decimals]);

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
          <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">Welcome back, {displayName}</span>
          <span className="font-mono text-sm text-neutral-900 truncate">{truncate(address)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onWrongChain ? (
          <button
            type="button"
            onClick={() => wallet?.switchChain(ARC_TESTNET_ID)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800"
          >
            Switch to Arc
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">
                Balance
              </div>
              <div className="text-sm font-bold" style={{ color: ACCENT }}>
                 {Number(balance).toFixed(2)} {token.symbol}
              </div>
            </div>
            <a
              href={token.faucet ?? "https://faucet.circle.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition active:scale-[.98] hover:bg-neutral-50"
              style={{ color: ACCENT, borderColor: "#C7E9DC" }}
            >
              <DropletIcon />
              Get test {token.symbol}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tab bar ---------------- */

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "new", label: "New Split", icon: "💸" },
    { key: "history", label: "History", icon: "🕐" },
    { key: "contacts", label: "Contacts", icon: "👥" },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-2xl">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => setTab(t.key)}
          className={`py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
            tab === t.key ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"
          }`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Contact picker ---------------- */

function ContactPicker({
  contacts,
  onPick,
  onClose,
}: {
  contacts: Contact[];
  onPick: (c: Contact) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-20 mt-1 right-0 w-64 rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden"
    >
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold border-b border-neutral-100">
        Pick a contact
      </div>
      {contacts.length === 0 ? (
        <div className="p-4 text-xs text-neutral-500 text-center">
          No contacts yet. Add some from the Contacts tab.
        </div>
      ) : (
        <div className="max-h-64 overflow-auto">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              className="w-full text-left px-3 py-2.5 hover:bg-neutral-50 flex items-center justify-between gap-2"
            >
              <span className="text-sm font-semibold text-neutral-900 truncate">{c.name}</span>
              <span className="font-mono text-[11px] text-neutral-500 shrink-0">
                {truncate(c.address)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Main App ---------------- */

type PrefillRecipient = { address: string; percent: string };
type Prefill = {
  name: string;
  mode: Mode;
  amount?: string;
  recipients: PrefillRecipient[];
};

function App({ address, wallet, displayName }: { address?: string; wallet: WalletShim | undefined; displayName: string }) {
  const isConnected = !!address && !!wallet;
  const chainId = wallet?.chainId;
  const publicClient = useMemo(() => createPublicClient({ chain: arcTestnet, transport: http() }), []);

  const contactsStore = useContacts(address);
  const historyStore = useHistory(address);
  const templatesStore = useTemplates(address);

  const [tab, setTab] = useState<Tab>("new");
  const [tokenKey, setTokenKey] = useState<TokenKey>("usdc");
  const token = TOKENS[tokenKey];

  const [balanceStr, setBalanceStr] = useState<string>();
  useEffect(() => {
    if (!address || chainId !== `eip155:${ARC_TESTNET_ID}`) return;
    let active = true;
    const load = () => publicClient.readContract({ address: token.address, abi: erc20Abi, functionName: "balanceOf", args: [address as `0x${string}`] }).then((raw) => active && setBalanceStr(formatUnits(raw, token.decimals))).catch(() => undefined);
    setBalanceStr(undefined);
    load();
    const timer = window.setInterval(load, 10_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [address, chainId, publicClient, token.address, token.decimals]);

  const [splitName, setSplitName] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Mode>("equal");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: uid(), address: "", percent: "50" },
    { id: uid(), address: "", percent: "50" },
  ]);
  const [sendStatus, setSendStatus] = useState<"idle" | "approving" | "splitting">("idle");
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const sending = sendStatus !== "idle";

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

  function applyPrefill(p: Prefill) {
    setSplitName(p.name);
    setMode(p.mode);
    if (p.amount !== undefined) setAmount(p.amount);
    setRecipients(
      p.recipients.map((r) => ({
        id: uid(),
        address: r.address,
        percent: r.percent,
      })),
    );
    setResults(null);
    setError(null);
    setTab("new");
  }

  function saveAsTemplate() {
    if (!splitName.trim()) {
      setError("Give this split a name before saving as template.");
      return;
    }
    if (recipients.every((r) => !r.address.trim())) {
      setError("Add at least one recipient before saving as template.");
      return;
    }
    const tpl: Template = {
      id: uid(),
      name: splitName.trim(),
      mode,
      recipients: recipients
        .filter((r) => r.address.trim())
        .map((r) => ({ address: r.address.trim(), percent: r.percent, chain: "arc" })),
    };
    templatesStore.add(tpl);
    setError(null);
  }

  async function handleSend() {
    setError(null);
    setResults(null);

    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (chainId !== `eip155:${ARC_TESTNET_ID}`) {
      setError("Switch your wallet to Arc Testnet to continue.");
      return;
    }
    if (!publicClient) {
      setError("RPC client not ready — try again in a second.");
      return;
    }
    if (!splitName.trim()) {
      setError("Give this split a name.");
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

    const perRecipientWei = validRecipients.map((r) =>
      parseUnits(amountFor(r).toFixed(token.decimals), token.decimals),
    );
    const totalWei = perRecipientWei.reduce((a, b) => a + b, 0n);
    const addresses = validRecipients.map((r) => r.address.trim() as `0x${string}`);

    try {
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({ chain: arcTestnet, transport: custom(provider) });
      const account = address as `0x${string}`;
      setSendStatus("approving");
      const approveHash = await walletClient.writeContract({
        account,
        address: token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [SPLITARC_ADDRESS, totalWei],
        chain: arcTestnet,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      setSendStatus("splitting");
      const splitHash = await walletClient.writeContract({
        account,
        address: SPLITARC_ADDRESS,
        abi: SPLITARC_ABI,
        functionName: "split",
        args: [splitName.trim(), addresses, perRecipientWei],
        chain: arcTestnet,
      });
      await publicClient.waitForTransactionReceipt({ hash: splitHash });

      const recs: SendResult[] = validRecipients.map((r, i) => ({
        address: r.address.trim(),
        amount: formatUnits(perRecipientWei[i], token.decimals),
        txHash: splitHash,
      }));
      setResults(recs);
      setLastTxHash(splitHash);

      const entry: HistoryEntry = {
        id: uid(),
        name: splitName.trim(),
        total: totalAmount.toFixed(token.decimals),
        timestamp: Date.now(),
        txHash: splitHash,
        mode,
        token: token.symbol,
        recipients: recs.map((r) => ({ address: r.address, amount: r.amount, chain: "arc" })),
      };
      historyStore.add(entry);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes("User rejected") ? "Transaction rejected in wallet." : msg);
    } finally {
      setSendStatus("idle");
    }
  }

  /* ------- Success screen ------- */
  if (results && lastTxHash) {
    return (
      <div className="rounded-3xl p-6 space-y-6" style={{ backgroundColor: ACCENT_TINT }}>
        <style>{`
          @keyframes check-draw { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
          @keyframes check-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          .check-path { stroke-dasharray: 60; stroke-dashoffset: 60; animation: check-draw 0.6s ease-out 0.2s forwards; }
          .check-circle { animation: check-pop 0.5s ease-out forwards; }
        `}</style>
        <div className="text-center pt-4">
          <div
            className="check-circle mx-auto h-24 w-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: ACCENT, boxShadow: `0 10px 30px -10px ${ACCENT}80` }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path className="check-path" d="M5 12.5L10 17.5L19 7.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">Split Complete!</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Sent {token.symbol} to {results.length} recipient{results.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-3">
          {results.map((r, i) => {
            const contactName = findContactName(contactsStore.items, r.address);
            return (
              <div key={r.address + i} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TokenIcon token={token} size={32} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-neutral-900 truncate font-semibold">
                        {contactName ?? truncate(r.address)}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-500 truncate">
                        {truncate(r.address)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-base shrink-0" style={{ color: ACCENT }}>
                    {r.amount} {token.symbol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-3 flex flex-wrap items-center gap-2">
          <a
            href={arcscanTx(lastTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition active:scale-[.98] hover:shadow-sm"
            style={{ color: ACCENT, borderColor: "#C7E9DC" }}
          >
            View on ArcScan →
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(lastTxHash);
              setCopiedTx(lastTxHash);
              setTimeout(() => setCopiedTx((c) => (c === lastTxHash ? null : c)), 2000);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition active:scale-[.98] hover:shadow-sm"
            style={{ color: ACCENT, borderColor: "#C7E9DC" }}
          >
            {copiedTx === lastTxHash ? "Copied!" : "Copy transaction hash"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setResults(null);
            setLastTxHash(null);
            setCopiedTx(null);
            setSplitName("");
            setAmount("");
            setMode("equal");
            setRecipients([
              { id: uid(), address: "", percent: "50" },
              { id: uid(), address: "", percent: "50" },
            ]);
            setError(null);
            setPickerOpenFor(null);
            setTab("new");
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
       <WalletBar address={address} wallet={wallet} displayName={displayName} token={token} />
      <TabBar tab={tab} setTab={setTab} />

      {tab === "new" && (
        <>
          {/* Split name */}
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Split name
            </label>
            <input
              placeholder="e.g. Team dinner"
              value={splitName}
              onChange={(e) => setSplitName(e.target.value)}
              className="mt-1 w-full text-sm font-semibold outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

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
                  className="w-[55%] text-5xl font-bold text-center outline-none bg-transparent placeholder:text-neutral-300 tabular-nums"
                  style={{ color: amount ? "#0a0a0a" : undefined }}
                />
                <TokenSelect value={tokenKey} onChange={setTokenKey} />
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {isConnected
                  ? `Available: ${balanceStr ? Number(balanceStr).toFixed(2) : "0.00"} ${token.symbol}`
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
              const trimmed = r.address.trim();
              const addressInvalid = trimmed.length > 0 && !isAddress(trimmed);
              const contactName = trimmed ? findContactName(contactsStore.items, trimmed) : null;
              const alreadySaved = !!contactName;
              return (
                <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: ACCENT_TINT, color: ACCENT }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      {contactName && (
                        <div className="text-sm font-semibold text-neutral-900">
                          {contactName}
                        </div>
                      )}
                      <div className="relative flex items-center gap-1.5">
                        <input
                          placeholder="0x… wallet address"
                          value={r.address}
                          onChange={(e) => updateRecipient(r.id, { address: e.target.value })}
                          className={`flex-1 min-w-0 font-mono text-xs outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400 rounded-md px-2 py-1.5 border ${
                            addressInvalid ? "border-red-400 bg-red-50" : "border-transparent"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPickerOpenFor((cur) => (cur === r.id ? null : r.id))
                          }
                          title="Pick from contacts"
                          aria-label="Pick from contacts"
                          className="p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 shrink-0"
                        >
                          <BookIcon />
                        </button>
                        {isAddress(trimmed) && !alreadySaved && (
                          <button
                            type="button"
                            onClick={() => {
                              const name = window.prompt("Save this address as… (name)");
                              if (name && name.trim()) {
                                contactsStore.add({
                                  id: uid(),
                                  name: name.trim(),
                                  address: trimmed,
                                });
                              }
                            }}
                            title="Save to contacts"
                            aria-label="Save to contacts"
                            className="p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 shrink-0"
                          >
                            <PlusIcon />
                          </button>
                        )}
                        {pickerOpenFor === r.id && (
                          <ContactPicker
                            contacts={contactsStore.items}
                            onPick={(c) => {
                              updateRecipient(r.id, { address: c.address });
                              setPickerOpenFor(null);
                            }}
                            onClose={() => setPickerOpenFor(null)}
                          />
                        )}
                      </div>
                      {addressInvalid && (
                        <div className="text-[11px] font-semibold text-red-600">
                          Invalid address — must be 0x followed by 40 hex characters
                        </div>
                      )}
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
                      {calc.toFixed(2)} {token.symbol}
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
            <Row label="Total" value={`${totalAmount.toFixed(2)} ${token.symbol}`} accent />
            <Row label="Recipients" value={String(validRecipients.length)} />
            {mode === "equal" && validRecipients.length > 0 && (
              <Row label="Per wallet" value={`${equalShare.toFixed(2)} ${token.symbol}`} />
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

          <div className="flex flex-col gap-2">
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
              {sendStatus === "approving"
                ? `Approving ${token.symbol}…`
                : sendStatus === "splitting"
                  ? "Sending split…"
                  : !isConnected
                    ? "Connect wallet to send"
                    : totalAmount <= 0
                      ? "Enter an amount"
                      : "Split & Send"}
            </button>
            <button
              type="button"
              onClick={saveAsTemplate}
              disabled={!isConnected}
              className="w-full rounded-2xl px-5 py-3 text-sm font-semibold border transition active:scale-[.98] disabled:opacity-50"
              style={{ color: ACCENT, borderColor: "#C7E9DC", backgroundColor: "white" }}
            >
              Save as template
            </button>
          </div>
        </>
      )}

      {tab === "history" && (
        <HistoryPanel
          history={historyStore.items}
          contacts={contactsStore.items}
          onDelete={historyStore.remove}
          onRepeat={(h) =>
            applyPrefill({
              name: h.name,
              mode: h.mode,
              amount: (parseFloat(h.total) || 0).toString(),
              recipients: h.recipients.map((r) => ({
                address: r.address,
                percent: (100 / Math.max(h.recipients.length, 1)).toString(),
              })),
            })
          }
          connected={isConnected}
        />
      )}

      {tab === "contacts" && (
        <ContactsPanel
          contacts={contactsStore.items}
          onAdd={(name, addr) =>
            contactsStore.add({ id: uid(), name, address: addr })
          }
          onDelete={contactsStore.remove}
          templates={templatesStore.items}
          onDeleteTemplate={templatesStore.remove}
          onUseTemplate={(t) =>
            applyPrefill({
              name: t.name,
              mode: t.mode,
              recipients: t.recipients.map((r) => ({
                address: r.address,
                percent: r.percent,
              })),
            })
          }
          connected={isConnected}
        />
      )}
    </div>
  );
}

/* ---------------- History panel ---------------- */

function HistoryPanel({
  history,
  contacts,
  onDelete,
  onRepeat,
  connected,
}: {
  history: HistoryEntry[];
  contacts: Contact[];
  onDelete: (id: string) => void;
  onRepeat: (h: HistoryEntry) => void;
  connected: boolean;
}) {
  if (!connected) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        Connect your wallet to see split history.
      </div>
    );
  }
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <div
          className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: ACCENT_TINT }}
        >
          <span className="text-2xl">🕐</span>
        </div>
        <div className="font-semibold text-neutral-900">No splits yet</div>
        <div className="text-xs text-neutral-500 mt-1">
          Completed splits will appear here.
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {history.map((h) => (
        <div key={h.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-neutral-900 truncate">{h.name}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{formatDate(h.timestamp)}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>
                {Number(h.total).toFixed(2)} {h.token ?? "USDC"}
              </div>
              <div className="text-[11px] text-neutral-500">
                {h.recipients.length} recipient{h.recipients.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {h.recipients.map((r, i) => {
              const name = findContactName(contacts, r.address);
              return (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-neutral-700 truncate">
                    {name ?? (
                      <span className="font-mono text-neutral-500">{truncate(r.address)}</span>
                    )}
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: ACCENT }}>
                    {Number(r.amount).toFixed(2)} {h.token ?? "USDC"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2">
            <a
              href={arcscanTx(h.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition active:scale-[.98] hover:shadow-sm"
              style={{ color: ACCENT, borderColor: "#C7E9DC" }}
            >
              View on ArcScan →
            </a>
            <button
              type="button"
              onClick={() => onRepeat(h)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition active:scale-[.98]"
              style={{ backgroundColor: ACCENT }}
            >
              Repeat this split
            </button>
            <button
              type="button"
              onClick={() => onDelete(h.id)}
              className="ml-auto text-neutral-400 hover:text-red-500 p-1.5 rounded-md"
              title="Delete from history"
              aria-label="Delete from history"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Contacts + Templates panel ---------------- */

function ContactsPanel({
  contacts,
  onAdd,
  onDelete,
  templates,
  onDeleteTemplate,
  onUseTemplate,
  connected,
}: {
  contacts: Contact[];
  onAdd: (name: string, address: string) => void;
  onDelete: (id: string) => void;
  templates: Template[];
  onDeleteTemplate: (id: string) => void;
  onUseTemplate: (t: Template) => void;
  connected: boolean;
}) {
  const [name, setName] = useState("");
  const [addr, setAddr] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!connected) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        Connect your wallet to manage contacts and templates.
      </div>
    );
  }

  function submit() {
    setFormError(null);
    const trimmedName = name.trim();
    const trimmedAddr = addr.trim();
    if (!trimmedName) {
      setFormError("Give this contact a name.");
      return;
    }
    if (!isAddress(trimmedAddr)) {
      setFormError("Enter a valid 0x wallet address.");
      return;
    }
    if (contacts.some((c) => c.address.toLowerCase() === trimmedAddr.toLowerCase())) {
      setFormError("This address is already saved");
      return;
    }
    if (contacts.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError("A contact with this name already exists");
      return;
    }
    onAdd(trimmedName, trimmedAddr);
    setName("");
    setAddr("");
  }

  return (
    <div className="space-y-6">
      {/* Contacts */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 px-1">
          👥 Contacts <span className="text-neutral-400 font-normal">({contacts.length})</span>
        </h3>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2 shadow-sm">
          <input
            placeholder="Name (e.g. Mum)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm font-semibold outline-none bg-neutral-50 rounded-lg px-3 py-2 text-neutral-900"
          />
          <input
            placeholder="0x… wallet address"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            className="w-full font-mono text-xs outline-none bg-neutral-50 rounded-lg px-3 py-2 text-neutral-900"
          />
          {formError && (
            <div className="text-[11px] font-semibold text-red-600">{formError}</div>
          )}
          <button
            type="button"
            onClick={submit}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[.98]"
            style={{ backgroundColor: ACCENT }}
          >
            Add contact
          </button>
        </div>
        {contacts.length === 0 ? (
          <div className="text-xs text-neutral-500 text-center py-4">
            No contacts yet.
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-neutral-900 truncate">{c.name}</div>
                  <div className="font-mono text-[11px] text-neutral-500 truncate">
                    {truncate(c.address)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="text-neutral-400 hover:text-red-500 p-1.5 rounded-md"
                  title="Delete contact"
                  aria-label="Delete contact"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 px-1">
          📋 Templates <span className="text-neutral-400 font-normal">({templates.length})</span>
        </h3>
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-xs text-neutral-500">
            No templates yet. Save a split as a template from the New Split tab.
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-neutral-900 truncate">{t.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {t.recipients.length} recipient{t.recipients.length === 1 ? "" : "s"} ·{" "}
                      {t.mode === "equal" ? "Equal split" : "Custom %"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(t.id)}
                    className="text-neutral-400 hover:text-red-500 p-1.5 rounded-md shrink-0"
                    title="Delete template"
                    aria-label="Delete template"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onUseTemplate(t)}
                  className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition active:scale-[.98]"
                  style={{ backgroundColor: ACCENT }}
                >
                  Use template
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- ---------------- */

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

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${ACCENT}55`, borderTopColor: "transparent", borderTopWidth: 2 }}
      aria-hidden
    />
  );
}

function AuthShell({ theme, children }: { theme: string; children: React.ReactNode }) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center px-5 bg-[#F5F5F5] dark:bg-[#0A0A0A]">
        <div className="w-full max-w-sm text-center">{children}</div>
      </div>
    </div>
  );
}

export default function SplitArcApp() {
  const { address, isConnected, status, chainId, connector } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { theme, toggleTheme } = useAppTheme();

  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [customName, setCustomName] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!address) {
      setCustomName("");
      return;
    }
    setCustomName(window.localStorage.getItem(`splitarc:${address.toLowerCase()}:display-name`) ?? "");
  }, [address]);

  const wallet: WalletShim | undefined = useMemo(() => {
    if (!isConnected || !connector) return undefined;
    return {
      chainId: `eip155:${chainId ?? ARC_TESTNET_ID}`,
      switchChain: (id: number) => switchChain({ chainId: id }),
      getEthereumProvider: async () => (await connector.getProvider()) as EIP1193Provider,
    };
  }, [isConnected, connector, chainId, switchChain]);

  const fallbackName = address ? truncate(address) : "there";
  const displayName = customName || fallbackName;

  const handleConnect = () => {
    const preferred = connectors.find((c) => c.type === "injected") ?? connectors[0];
    connect({ connector: preferred ?? injected() });
  };

  // Initial hydration / reconnect — show branded loader instead of a white flash.
  if (!mounted || status === "connecting" || status === "reconnecting") {
    return (
      <AuthShell theme={theme}>
        <div className="mx-auto w-fit"><Logo /></div>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Starting SplitArc…</p>
        </div>
      </AuthShell>
    );
  }

  if (!isConnected || !address) {
    return (
      <AuthShell theme={theme}>
        <div className="mx-auto w-fit"><Logo /></div>
        <h1 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">Welcome to SplitArc</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">Split USDC to anyone, instantly</p>
        <p className="mt-1 text-xs text-neutral-400">Works with MetaMask, Rabby or any injected EVM wallet</p>
        {connectError && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{connectError.message}</p>
        )}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="w-full rounded-2xl px-5 py-4 font-semibold text-white transition active:scale-[.98] disabled:opacity-60"
            style={{ backgroundColor: ACCENT }}
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        </div>
        <Link to="/" className="mt-6 inline-block text-xs font-semibold underline" style={{ color: ACCENT }}>
          Back to home
        </Link>
      </AuthShell>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="splitarc-app min-h-screen px-5 py-8 flex justify-center bg-[#F5F5F5] dark:bg-[#0A0A0A]">
        <div className="w-full max-w-[480px]">
          <Header
            actions={
              <>
                <button type="button" onClick={toggleTheme} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" aria-label="Toggle color theme">
                  {theme === "light" ? <MoonIcon /> : <SunIcon />}
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setProfileOpen((open) => !open)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" aria-label="Open profile">
                    <ProfileIcon />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-10 z-30 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate">{displayName}</div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-800">
                        <span className="font-mono text-xs text-neutral-600 dark:text-neutral-300">{truncate(address)}</span>
                        <button type="button" onClick={() => navigator.clipboard.writeText(address)} className="text-xs font-semibold" style={{ color: ACCENT }}>Copy</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = window.prompt("Enter a display name", customName || fallbackName);
                          if (next === null) return;
                          const clean = next.trim();
                          setCustomName(clean);
                          const key = `splitarc:${address.toLowerCase()}:display-name`;
                          if (clean) window.localStorage.setItem(key, clean);
                          else window.localStorage.removeItem(key);
                        }}
                        className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                      >
                        Edit display name
                      </button>
                      <button type="button" onClick={() => { setProfileOpen(false); disconnect(); }} className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                        Disconnect wallet
                      </button>
                    </div>
                  )}
                </div>
              </>
            }
          />
          <App address={address} wallet={wallet} displayName={displayName} />
          <p className="mt-8 text-center text-xs text-neutral-400">
            Arc Testnet · Chain ID {arcTestnet.id}
          </p>
        </div>
      </div>
    </div>
  );
}


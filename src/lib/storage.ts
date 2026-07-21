import { useCallback, useEffect, useState } from "react";

export type Contact = { id: string; name: string; address: string };
export type HistoryRecipient = { address: string; amount: string; chain: string };
export type HistoryEntry = {
  id: string;
  name: string;
  total: string;
  timestamp: number;
  txHash: string;
  mode: "equal" | "custom";
  recipients: HistoryRecipient[];
};
export type TemplateRecipient = { address: string; percent: string; chain: string };
export type Template = {
  id: string;
  name: string;
  mode: "equal" | "custom";
  recipients: TemplateRecipient[];
};

type Kind = "contacts" | "history" | "templates";

function keyFor(address: string | undefined, kind: Kind) {
  if (!address) return null;
  return `splitarc:${address.toLowerCase()}:${kind}`;
}

function read<T>(address: string | undefined, kind: Kind): T[] {
  const k = keyFor(address, kind);
  if (!k || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(address: string | undefined, kind: Kind, value: T[]) {
  const k = keyFor(address, kind);
  if (!k || typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(value));
}

function useCollection<T extends { id: string }>(address: string | undefined, kind: Kind) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    setItems(read<T>(address, kind));
  }, [address, kind]);

  const save = useCallback(
    (next: T[]) => {
      setItems(next);
      write<T>(address, kind, next);
    },
    [address, kind],
  );

  const add = useCallback((item: T) => save([item, ...items]), [items, save]);
  const remove = useCallback((id: string) => save(items.filter((i) => i.id !== id)), [items, save]);
  const clear = useCallback(() => save([]), [save]);

  return { items, add, remove, clear, save };
}

export function useContacts(address: string | undefined) {
  return useCollection<Contact>(address, "contacts");
}
export function useHistory(address: string | undefined) {
  return useCollection<HistoryEntry>(address, "history");
}
export function useTemplates(address: string | undefined) {
  return useCollection<Template>(address, "templates");
}

export function findContactName(contacts: Contact[], address: string): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  const hit = contacts.find((c) => c.address.toLowerCase() === lower);
  return hit ? hit.name : null;
}

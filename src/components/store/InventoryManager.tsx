import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";

interface StockRow {
  id: string; title: string; author: string; category: string; price: number;
  stock_quantity: number; low_stock_threshold: number; available: boolean;
}

export function InventoryManager({ onChanged }: { onChanged?: () => void }) {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("books")
      .select("id, title, author, category, price, stock_quantity, low_stock_threshold, available")
      .order("title");
    setRows((data ?? []) as StockRow[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(row: StockRow) {
    const next = drafts[row.id];
    if (next === undefined || next === row.stock_quantity) return;
    const { error } = await supabase
      .from("books")
      .update({ stock_quantity: Math.max(0, Math.round(next)), available: next > 0 })
      .eq("id", row.id);
    setMessage(error ? error.message : `${row.title} updated.`);
    if (!error) { await load(); onChanged?.(); }
  }

  const visible = rows.filter((row) => {
    if (lowOnly && row.stock_quantity > row.low_stock_threshold) return false;
    const needle = filter.trim().toLowerCase();
    return !needle || row.title.toLowerCase().includes(needle) || row.author.toLowerCase().includes(needle);
  });

  const lowCount = rows.filter((row) => row.stock_quantity <= row.low_stock_threshold).length;
  const totalUnits = rows.reduce((sum, row) => sum + row.stock_quantity, 0);

  return (
    <section aria-labelledby="inventory-heading" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="inventory-heading" className="section-heading">Inventory</h2>
          <p className="mt-1 text-xs text-muted-foreground">{totalUnits} copies on the shelves · {lowCount} title{lowCount === 1 ? "" : "s"} low on stock</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search titles" aria-label="Search inventory" className="h-10 w-56 border border-input bg-background px-3 text-sm" />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>
        </div>
      </div>

      {message && <p className="mt-3 text-xs text-muted-foreground" role="status">{message}</p>}

      <div className="mt-5 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase text-muted-foreground">
            <tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">In stock</th><th className="px-5 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => {
              const low = row.stock_quantity <= row.low_stock_threshold;
              return (
                <tr key={row.id}>
                  <td className="px-5 py-3">
                    <span className="font-medium">{row.title}</span>
                    <span className="block text-xs text-muted-foreground">{row.author}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{row.category}</td>
                  <td className="px-5 py-3">{formatPrice(Number(row.price))}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        aria-label={`Stock for ${row.title}`}
                        value={drafts[row.id] ?? row.stock_quantity}
                        onChange={(e) => setDrafts((d) => ({ ...d, [row.id]: Number(e.target.value) }))}
                        className="h-9 w-20 border border-input bg-background px-2"
                      />
                      {low && <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-destructive"><AlertTriangle className="size-3.5" /> Low</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => void save(row)}>Save</Button></td>
                </tr>
              );
            })}
            {visible.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">No titles match.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

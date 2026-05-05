import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, type Product } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { raspInspect } from "@/lib/security";
import { Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const QuerySchema = z
  .string()
  .trim()
  .max(100, "Query too long")
  .regex(/^[\p{L}\p{N}\s\-_'.]*$/u, "Only letters, numbers and spaces allowed");

function SearchPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState(""); // ✅ القيم الآمنة فقط
  const [inputValue, setInputValue] = useState(""); // 👈 المستخدم يكتب هنا
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      setItems(PRODUCTS);
      return;
    }

    const rows: Product[] = data.map((row: any) => ({
      id: Number(row.id),
      name: row.name ?? "",
      category: row.category ?? "",
      price: Number(row.price ?? 0),
      image: row.image_url || PRODUCTS[0].image,
      description: row.description || "",
      stock: Number(row.stock ?? 0),
    }));

    setItems(rows);
  }

  // 🔥 تسجيل الهجمات
  async function logSecurityEvent(input: string, threat: string) {
    try {
      await supabase.from("security_logs").insert({
        type: "RASP",
        input,
        threat,
        page: "search",
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("log failed", e);
    }
  }

  const onChange = async (v: string) => {
    setInputValue(v); // 👈 المستخدم يشوف اللي يكتبه
    setBlocked(null);
    setError(null);

    if (!v) {
      setQ("");
      return;
    }

    const cleaned = v.trim().replace(/\s+/g, " ");

    // ✅ Validation
    const parsed = QuerySchema.safeParse(cleaned);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    // 🚨 RASP
    const insp = raspInspect(cleaned, "search");

    if (!insp.safe) {
      const threat = insp.threat ?? "Suspicious input";
      setBlocked(threat);

      // 🔥 تسجيل الهجوم
      await logSecurityEvent(cleaned, threat);

      return; // ⛔ منع الإدخال
    }

    // ✅ فقط القيم النظيفة
    setQ(cleaned);
  };

  const safeQuery = !error && !blocked ? q.toLowerCase() : "";

  const results = useMemo(() => {
    if (!safeQuery) return items;

    return items.filter((p) =>
      [p.name, p.category, p.description]
        .join(" ")
        .toLowerCase()
        .includes(safeQuery)
    );
  }, [items, safeQuery]);

  return (
    <PageShell>
      <section className="bg-gradient-hero py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Secure Product Search
          </h1>
          <p className="mt-2 text-white/80">
            Search products securely with validation and runtime protection.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={inputValue} // 👈 هنا الفرق المهم
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search products..."
            className="h-12 pl-10 text-base shadow-card"
          />
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        {blocked && (
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Blocked.</strong> Threat detected: {blocked}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {results.length} result{results.length === 1 ? "" : "s"}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
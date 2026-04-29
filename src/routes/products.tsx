import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, type Product } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — SecureShop" },
      {
        name: "description",
        content:
          "Browse SecureShop's catalog of electronics, served over a secure, RASP-protected interface.",
      },
      { property: "og:title", content: "Products — SecureShop" },
      {
        property: "og:description",
        content: "Browse SecureShop's catalog of electronics.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [items, setItems] = useState<Product[]>(PRODUCTS);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        setItems(PRODUCTS);
        return;
      }

      if (!data || data.length === 0) {
        setItems(PRODUCTS);
        return;
      }

      const rows: Product[] = data.map((row: any) => ({
        id: Number(row.id),
        name: row.name ?? "",
        category: row.category ?? "Other",
        price: Number(row.price ?? 0),
        image:
          row.image_url &&
          String(row.image_url).trim() !== ""
            ? row.image_url
            : PRODUCTS[0].image,
        description: row.description ?? "",
        stock: Number(row.stock ?? 0),
      }));

      setItems(rows);
    } catch (err) {
      console.error("Load products failed:", err);
      setItems(PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          items
            .map((p) => p.category)
            .filter((v) => v && v.trim() !== "")
        )
      ),
    ];
  }, [items]);

  const filtered =
    active === "All"
      ? items
      : items.filter((p) => p.category === active);

  return (
    <PageShell>
      <section className="bg-gradient-hero py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Our Products</h1>
          <p className="mt-2 text-white/80">
            Verified, in stock, and securely listed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                active === c
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No products found.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();

  const [items, setItems] = useState(getCart());
  const [loading, setLoading] = useState(false);

  const refresh = () => setItems(getCart());

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (items.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: total,
          status: "pending",
        })
        .select()
        .single();

      if (error || !order) {
        console.error(error);
        alert("Failed to place order");
        return;
      }

      const rows = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(rows);

      if (itemsError) {
        console.error(itemsError);
        alert("Order saved, but items failed");
        return;
      }

      clearCart();
      refresh();

      alert("Order placed successfully");
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        {items.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Cart is empty</p>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />

                    <div>
                      <h2 className="font-semibold">{item.name}</h2>

                      <p className="text-sm text-muted-foreground">
                        ${item.price} × {item.qty}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      removeFromCart(item.id);
                      refresh();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-xl font-bold">Total: ${total}</div>

            <Button
              className="mt-4 bg-gradient-primary"
              disabled={loading}
              onClick={handleCheckout}
            >
              {loading ? "Processing..." : "Checkout"}
            </Button>
          </>
        )}
      </section>
    </PageShell>
  );
}

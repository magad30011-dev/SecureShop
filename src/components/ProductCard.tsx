import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { escapeHtml } from "@/lib/security";
import { addToCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const imageSrc =
    product.image && product.image.trim() !== ""
      ? product.image
      : "https://via.placeholder.com/600x600?text=No+Image";

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: Number(product.price),
      image: imageSrc,
      qty: 1,
    });

    alert("Added to cart");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/600x600?text=No+Image";
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {product.category}
          </span>

          <span className="flex items-center gap-1 text-xs text-success">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        <h3 className="text-base font-semibold">
          {escapeHtml(product.name)}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-xl font-bold text-primary">
              ${product.price}
            </div>

            <div className="text-xs text-muted-foreground">
              {product.stock} in stock
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-gradient-primary"
            >
              Buy
            </Button>

            <Button asChild size="sm" variant="outline">
              <Link to="/products">View</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}